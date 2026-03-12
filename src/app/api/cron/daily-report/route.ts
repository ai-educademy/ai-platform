import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/db/schema";
import { sql, gte, count, eq } from "drizzle-orm";
import { readJsonFile } from "@/lib/fileStore";
import { sendAdminNotification } from "@/lib/email";
import Redis from "ioredis";

interface Subscriber {
  email: string;
  subscribedAt: string;
  locale?: string;
}

interface FeedbackEntry {
  lessonSlug: string;
  programSlug: string;
  rating: "up" | "down";
  comment?: string;
  timestamp: string;
}

let redis: Redis | null = null;

function getRedis() {
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  redis = new Redis(url, { maxRetriesPerRequest: 1, connectTimeout: 5000 });
  redis.on("error", () => {});
  return redis;
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dateStr = now.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Europe/London",
    });

    // --- Database queries ---
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult?.count || 0;

    const [newUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, twentyFourHoursAgo));
    const newUsersToday = newUsersResult?.count || 0;

    // Users by role
    const roleBreakdown = await db
      .select({ role: users.role, count: count() })
      .from(users)
      .groupBy(users.role);

    // Active subscriptions
    const [activeSubsResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));
    const activeSubs = activeSubsResult?.count || 0;

    // New subscriptions today
    const [newSubsResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(gte(subscriptions.createdAt, twentyFourHoursAgo));
    const newSubsToday = newSubsResult?.count || 0;

    // Subscription plan breakdown
    const planBreakdown = await db
      .select({ plan: subscriptions.plan, count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"))
      .groupBy(subscriptions.plan);

    // Recent signups (last 5)
    const recentUsers = await db
      .select({ name: users.name, email: users.email, createdAt: users.createdAt })
      .from(users)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(5);

    // --- JSON file analytics + Redis page views ---
    const [subscribers, feedback] = await Promise.all([
      readJsonFile<Subscriber[]>("newsletter-subscribers.json", []),
      readJsonFile<FeedbackEntry[]>("lesson-feedback.json", []),
    ]);

    // Page views from Redis (the real source of truth)
    let pageViews = 0;
    const client = getRedis();
    if (client) {
      try {
        const count = await client.get("page-views:total");
        pageViews = count ? parseInt(count, 10) : 0;
      } catch {
        // Redis unavailable — fall back to 0
      }
    }

    // Country/locale breakdown is not available from Redis (kept as placeholder)
    const topCountries: [string, number][] = [];
    const topPages: [string, number][] = [];

    // Today's feedback
    const todayFeedback = feedback.filter(
      (f) => new Date(f.timestamp) >= twentyFourHoursAgo
    );
    const feedbackUp = todayFeedback.filter((f) => f.rating === "up").length;
    const feedbackDown = todayFeedback.filter((f) => f.rating === "down").length;

    // Today's newsletter signups
    const todaySubscribers = subscribers.filter(
      (s) => new Date(s.subscribedAt) >= twentyFourHoursAgo
    );

    // --- Build the email ---
    const roleRows = roleBreakdown
      .map((r) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${r.role}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${r.count}</td></tr>`)
      .join("");

    const planRows = planBreakdown.length > 0
      ? planBreakdown
          .map((p) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${p.plan}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${p.count}</td></tr>`)
          .join("")
      : '<tr><td style="padding:6px 12px;color:#999;" colspan="2">No active subscriptions</td></tr>';

    const countryRows = topCountries.length > 0
      ? topCountries
          .map(([country, cnt]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${country}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${cnt}</td></tr>`)
          .join("")
      : '<tr><td style="padding:6px 12px;color:#999;" colspan="2">No data yet</td></tr>';

    const pageRows = topPages.length > 0
      ? topPages
          .map(([page, cnt]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;max-width:300px;overflow:hidden;text-overflow:ellipsis;">${page}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${cnt}</td></tr>`)
          .join("")
      : '<tr><td style="padding:6px 12px;color:#999;" colspan="2">No page views tracked</td></tr>';

    const recentUserRows = recentUsers
      .map((u) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${u.name || "-"}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${u.email || "-"}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#999;">${u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "-"}</td></tr>`)
      .join("");

    const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;color:#1f2937;">
  
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:24px;">📊 Daily Report</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${dateStr}</p>
  </div>

  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;">
    
    <!-- Key Metrics -->
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td style="padding:16px;text-align:center;background:#f0fdf4;border-radius:8px;width:25%;">
          <div style="font-size:28px;font-weight:800;color:#16a34a;">${newUsersToday}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">New Users</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:16px;text-align:center;background:#eff6ff;border-radius:8px;width:25%;">
          <div style="font-size:28px;font-weight:800;color:#2563eb;">${totalUsers}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Total Users</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:16px;text-align:center;background:#fef3c7;border-radius:8px;width:25%;">
          <div style="font-size:28px;font-weight:800;color:#d97706;">${newSubsToday}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">New Subs</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:16px;text-align:center;background:#faf5ff;border-radius:8px;width:25%;">
          <div style="font-size:28px;font-weight:800;color:#7c3aed;">${activeSubs}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Active Subs</div>
        </td>
      </tr>
    </table>

    <!-- Activity Summary -->
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td style="padding:12px 16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
          <span style="font-size:14px;">📄 Page views today: <strong>${pageViews}</strong></span> &nbsp;|&nbsp;
          <span style="font-size:14px;">👍 Feedback: <strong>${feedbackUp}</strong> up / <strong>${feedbackDown}</strong> down</span> &nbsp;|&nbsp;
          <span style="font-size:14px;">📧 Newsletter signups: <strong>${todaySubscribers.length}</strong></span>
        </td>
      </tr>
    </table>

    <!-- Users by Role -->
    <h3 style="margin:0 0 8px;font-size:16px;color:#374151;">👥 Users by Role</h3>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;">
      <tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;">Role</th><th style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;">Count</th></tr>
      ${roleRows}
    </table>

    <!-- Subscriptions by Plan -->
    <h3 style="margin:0 0 8px;font-size:16px;color:#374151;">💳 Active Subscriptions by Plan</h3>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;">
      <tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;">Plan</th><th style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;">Count</th></tr>
      ${planRows}
    </table>

    <!-- Visitors by Country/Locale -->
    <h3 style="margin:0 0 8px;font-size:16px;color:#374151;">🌍 Visitors by Country/Locale</h3>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;">
      <tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;">Country</th><th style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;">Events</th></tr>
      ${countryRows}
    </table>

    <!-- Top Pages -->
    <h3 style="margin:0 0 8px;font-size:16px;color:#374151;">🔥 Top Pages Today</h3>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;">
      <tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;">Page</th><th style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;">Views</th></tr>
      ${pageRows}
    </table>

    <!-- Recent Signups -->
    <h3 style="margin:0 0 8px;font-size:16px;color:#374151;">🆕 Recent Signups</h3>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;">
      <tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;">Name</th><th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;">Email</th><th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;">Joined</th></tr>
      ${recentUserRows}
    </table>
  </div>

  <!-- Footer -->
  <div style="background:#f9fafb;padding:16px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">
      AI Educademy Daily Report &bull; <a href="https://aieducademy.org/admin" style="color:#6366f1;text-decoration:none;">View Admin Dashboard</a>
    </p>
  </div>
</div>`;

    await sendAdminNotification(`Daily Report: ${dateStr}`, html);

    return NextResponse.json({
      success: true,
      summary: {
        totalUsers,
        newUsersToday,
        activeSubs,
        newSubsToday,
        pageViews,
        feedbackUp,
        feedbackDown,
        newsletterSignups: todaySubscribers.length,
      },
    });
  } catch (error) {
    console.error("[Cron] Daily report failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
