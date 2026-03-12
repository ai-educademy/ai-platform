"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

interface Summary {
  totalEvents: number;
  totalSubscribers: number;
  totalFeedback: number;
  eventCounts: Record<string, number>;
  popularLessons: { lesson: string; views: number }[];
  feedbackByProgram: Record<string, { up: number; down: number }>;
  recentSubscribers: { email: string; subscribedAt: string }[];
}

interface UserSummary {
  totalUsers: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  mrr: number;
  roleBreakdown: Record<string, number>;
  planBreakdown: Record<string, number>;
  recentUsers: { id: string; name: string | null; email: string; role: string; createdAt: string }[];
}

export default function AdminPage() {
  const t = useTranslations("admin");
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<Summary | null>(null);
  const [userData, setUserData] = useState<UserSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        fetch("/api/analytics/summary"),
        fetch("/api/admin/users"),
      ]);
      if (!analyticsRes.ok) throw new Error("Failed to fetch analytics");
      setData(await analyticsRes.json());
      if (usersRes.ok) {
        setUserData(await usersRes.json());
      }
    } catch (error) {
      console.error("[Admin]", error);
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("secret");
    if (s && s === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      setAuthenticated(true);
      setSecret(s);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated, fetchData]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      setAuthenticated(true);
    } else {
      setError(t("invalidSecret"));
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("loginTitle")}</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={t("passwordPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold"
          >
            {t("accessButton")}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-[var(--color-text-muted)]">{t("loading")}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500">{error || t("noData")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-gradient">{t("title")}</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: t("subscribers"), value: data.totalSubscribers, icon: "📧" },
          { label: t("totalFeedback"), value: data.totalFeedback, icon: "💬" },
          { label: t("totalEvents"), value: data.totalEvents, icon: "📈" },
          { label: "Users", value: userData?.totalUsers ?? 0, icon: "👥" },
          { label: "Active Subs", value: userData?.activeSubscriptions ?? 0, icon: "⭐" },
          { label: "MRR", value: `£${userData?.mrr?.toFixed(0) ?? 0}`, icon: "💰" },
        ].map((card) => (
          <div
            key={card.label}
            className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
          >
            <div className="text-3xl mb-2">{card.icon}</div>
            <p className="text-3xl font-bold text-gradient">{card.value}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Feedback by Program */}
      <div className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
        <h2 className="text-xl font-bold mb-4">{t("feedbackByProgram")}</h2>
        {Object.keys(data.feedbackByProgram).length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">{t("noFeedback")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 font-semibold">{t("program")}</th>
                <th className="text-right py-2 font-semibold">{t("upVotes")}</th>
                <th className="text-right py-2 font-semibold">{t("downVotes")}</th>
                <th className="text-right py-2 font-semibold">{t("total")}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.feedbackByProgram).map(([program, counts]) => (
                <tr key={program} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 font-medium">{program}</td>
                  <td className="text-right py-2 text-green-500">{counts.up}</td>
                  <td className="text-right py-2 text-red-500">{counts.down}</td>
                  <td className="text-right py-2">{counts.up + counts.down}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Popular Lessons */}
      <div className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
        <h2 className="text-xl font-bold mb-4">{t("popularLessons")}</h2>
        {data.popularLessons.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">{t("noPageViews")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 font-semibold">{t("lesson")}</th>
                <th className="text-right py-2 font-semibold">{t("views")}</th>
              </tr>
            </thead>
            <tbody>
              {data.popularLessons.map((l) => (
                <tr key={l.lesson} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 font-medium">{l.lesson}</td>
                  <td className="text-right py-2">{l.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Event Counts */}
      <div className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
        <h2 className="text-xl font-bold mb-4">{t("eventBreakdown")}</h2>
        {Object.keys(data.eventCounts).length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">{t("noEvents")}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(data.eventCounts).map(([event, count]) => (
              <div
                key={event}
                className="p-3 rounded-xl bg-[var(--color-bg-section)] text-center"
              >
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{event}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Subscribers */}
      <div className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
        <h2 className="text-xl font-bold mb-4">{t("recentSubscribers")}</h2>
        {data.recentSubscribers.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">{t("noSubscribers")}</p>
        ) : (
          <ul className="space-y-2">
            {data.recentSubscribers.map((s) => (
              <li
                key={s.email}
                className="flex justify-between text-sm py-1 border-b border-[var(--color-border)]/50"
              >
                <span>{s.email}</span>
                <span className="text-[var(--color-text-muted)]">
                  {new Date(s.subscribedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* User & Subscription Management */}
      {userData && (
        <>
          <div className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
            <h2 className="text-xl font-bold mb-4">📊 Subscription Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(userData.roleBreakdown).map(([role, count]) => (
                <div key={role} className="p-3 rounded-xl bg-[var(--color-bg-section)] text-center">
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs text-[var(--color-text-muted)] capitalize">{role} users</p>
                </div>
              ))}
              {Object.entries(userData.planBreakdown).map(([plan, count]) => (
                <div key={plan} className="p-3 rounded-xl bg-[var(--color-bg-section)] text-center">
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs text-[var(--color-text-muted)] capitalize">{plan} plan</p>
                </div>
              ))}
              <div className="p-3 rounded-xl bg-[var(--color-bg-section)] text-center">
                <p className="text-lg font-bold text-red-500">{userData.cancelledSubscriptions}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Cancelled</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6">
            <h2 className="text-xl font-bold mb-4">👥 Recent Users</h2>
            {userData.recentUsers.length === 0 ? (
              <p className="text-[var(--color-text-muted)] text-sm">No users yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-2 font-semibold">Name</th>
                    <th className="text-left py-2 font-semibold">Email</th>
                    <th className="text-right py-2 font-semibold">Role</th>
                    <th className="text-right py-2 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.recentUsers.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--color-border)]/50">
                      <td className="py-2 font-medium">{u.name ?? "—"}</td>
                      <td className="py-2 text-[var(--color-text-muted)]">{u.email}</td>
                      <td className="text-right py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          u.role === "admin" ? "bg-purple-500/15 text-purple-600" :
                          u.role === "pro" ? "bg-amber-500/15 text-amber-600" :
                          "bg-gray-500/15 text-gray-600"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-right py-2 text-[var(--color-text-muted)]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <button
        onClick={fetchData}
        className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-all cursor-pointer"
      >
        {t("refreshData")}
      </button>
    </div>
  );
}
