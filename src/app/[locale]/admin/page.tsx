"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CampaignPanel } from "./CampaignPanel";
import { PageViewCounter } from "@/components/ui/PageViewCounter";
import {
  Users,
  CreditCard,
  TrendingUp,
  Mail,
  MessageSquare,
  Inbox,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Reply,
  Archive,
  LayoutDashboard,
} from "lucide-react";
import {
  UserGrowthChart,
  PlanBarChart,
  SentimentDonut,
  type GrowthPoint,
} from "./charts";

/* ═══════════════════════════ Types ═══════════════════════════ */

interface UserSummary {
  totalUsers: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  totalSubscribers: number;
  totalFeedback: number;
  totalContacts: number;
  mrr: number;
  roleBreakdown: Record<string, number>;
  planBreakdown: Record<string, number>;
  recentUsers: { id: string; name: string | null; email: string; role: string; createdAt: string }[];
  recentFeedback: { id: string; lessonSlug: string; programSlug: string; rating: string; comment: string | null; createdAt: string }[];
}

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  subStatus: string | null;
  subPlan: string | null;
}

interface UserListResponse {
  users: UserRow[];
  total: number;
  page: number;
  totalPages: number;
}

interface ContactRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

interface ContactListResponse {
  contacts: ContactRow[];
  total: number;
  page: number;
  totalPages: number;
}

interface SubscriberRow {
  email: string;
  locale: string | null;
  subscribedAt: string | null;
}

interface FeedbackRow {
  id: string;
  lessonSlug: string;
  programSlug: string;
  rating: string;
  comment: string | null;
  locale: string | null;
  createdAt: string | null;
}

interface FunnelSummary {
  current: {
    visitors: number;
    signups: number;
    activationRate: number;
    paywallViews: number;
    checkoutStarts: number;
    trials: number;
    paid: number;
    churn: number;
  };
  previous: {
    activationRate: number;
  };
  weekOnWeek: Record<"visitors" | "signups" | "paywallViews" | "checkoutStarts" | "trials" | "paid" | "churn", number | null>;
}

type Tab = "overview" | "users" | "contacts" | "subscribers" | "feedback";

/* ═══════════════════════════ Helper components ═══════════════════════════ */

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-green-500/15 text-green-600",
    pro: "bg-blue-500/15 text-blue-600",
    free: "bg-gray-500/15 text-gray-500",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${styles[role] ?? styles.free}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-500/15 text-blue-600",
    read: "bg-yellow-500/15 text-yellow-600",
    replied: "bg-green-500/15 text-green-600",
    archived: "bg-gray-500/15 text-gray-500",
    active: "bg-green-500/15 text-green-600",
    cancelled: "bg-red-500/15 text-red-600",
    past_due: "bg-orange-500/15 text-orange-600",
    trialing: "bg-purple-500/15 text-purple-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${styles[status] ?? "bg-gray-500/15 text-gray-500"}`}>
      {status}
    </span>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-[var(--color-glass)] rounded-xl w-1/3" />
      <div className="h-48 bg-[var(--color-glass)] rounded-2xl" />
      <div className="h-48 bg-[var(--color-glass)] rounded-2xl" />
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg bg-[var(--color-glass)] border border-[var(--color-border)] disabled:opacity-30 hover:brightness-110 transition-all cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-[var(--color-text-muted)]">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg bg-[var(--color-glass)] border border-[var(--color-border)] disabled:opacity-30 hover:brightness-110 transition-all cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ═══════════════════════════ Main Component ═══════════════════════════ */

export default function AdminPage() {
  const t = useTranslations("admin");
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [summaryData, setSummaryData] = useState<UserSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState("");

  // Users tab state
  const [userList, setUserList] = useState<UserListResponse | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userPage, setUserPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ userId: string; name: string; newRole: string } | null>(null);
  const [roleChanging, setRoleChanging] = useState(false);

  // Contacts tab state
  const [contacts, setContacts] = useState<ContactListResponse | null>(null);
  const [contactStatusFilter, setContactStatusFilter] = useState<string>("all");
  const [contactPage, setContactPage] = useState(1);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  // Subscribers tab state
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [subscribersTotal, setSubscribersTotal] = useState(0);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  // Feedback tab state
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackProgramFilter, setFeedbackProgramFilter] = useState<string>("all");

  // Growth chart state
  const [growthData, setGrowthData] = useState<GrowthPoint[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelSummary | null>(null);

  /* ─────── Data fetchers ─────── */

  const fetchGrowth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics/growth");
      if (res.ok) setGrowthData(await res.json());
    } catch (err) {
      console.error("[Admin] Growth fetch error:", err);
    }
  }, []);

  const fetchFunnel = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics/funnel");
      if (res.ok) setFunnelData(await res.json());
    } catch (err) {
      console.error("[Admin] Funnel fetch error:", err);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch summary");
      setSummaryData(await res.json());
    } catch (err) {
      console.error("[Admin]", err);
      setError(t("loadError"));
    } finally {
      setSummaryLoading(false);
    }
  }, [t]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ list: "true", page: String(userPage), limit: "20" });
      if (userSearch) params.set("search", userSearch);
      if (userRoleFilter !== "all") params.set("role", userRoleFilter);
      params.set("sort", "createdAt");
      params.set("order", "desc");
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) setUserList(await res.json());
    } catch (err) {
      console.error("[Admin] Users fetch error:", err);
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch, userRoleFilter, userPage]);

  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(contactPage), limit: "20" });
      if (contactStatusFilter !== "all") params.set("status", contactStatusFilter);
      const res = await fetch(`/api/admin/contacts?${params}`);
      if (res.ok) setContacts(await res.json());
    } catch (err) {
      console.error("[Admin] Contacts fetch error:", err);
    } finally {
      setContactsLoading(false);
    }
  }, [contactStatusFilter, contactPage]);

  const fetchSubscribers = useCallback(async () => {
    setSubscribersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setSubscribersTotal(data.totalSubscribers ?? 0);
      }
      // Fetch full subscriber list via analytics summary (has recent subscribers)
      const analyticsRes = await fetch("/api/analytics/summary");
      if (analyticsRes.ok) {
        const analytics = await analyticsRes.json();
        setSubscribers(
          (analytics.recentSubscribers ?? []).map((s: { email: string; subscribedAt: string }) => ({
            email: s.email,
            locale: null,
            subscribedAt: s.subscribedAt,
          })),
        );
        if (analytics.totalSubscribers) setSubscribersTotal(analytics.totalSubscribers);
      }
    } catch (err) {
      console.error("[Admin] Subscribers fetch error:", err);
    } finally {
      setSubscribersLoading(false);
    }
  }, []);

  const fetchFeedback = useCallback(async () => {
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setFeedbackTotal(data.totalFeedback ?? 0);
        setFeedback(data.recentFeedback ?? []);
      }
    } catch (err) {
      console.error("[Admin] Feedback fetch error:", err);
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  /* ─────── Role change handler ─────── */

  const handleRoleChange = async () => {
    if (!roleChangeTarget) return;
    setRoleChanging(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: roleChangeTarget.userId, role: roleChangeTarget.newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "Failed to update role");
      } else {
        await fetchUsers();
        await fetchSummary();
      }
    } catch (err) {
      console.error("[Admin] Role change error:", err);
      alert("Failed to update role");
    } finally {
      setRoleChanging(false);
      setRoleChangeTarget(null);
    }
  };

  /* ─────── Contact status handler ─────── */

  const handleContactStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        await fetchContacts();
        await fetchSummary();
      }
    } catch (err) {
      console.error("[Admin] Contact status error:", err);
    }
  };

  /* ─────── Effects ─────── */

  useEffect(() => {
    if (isAdmin) fetchSummary();
  }, [isAdmin, fetchSummary]);

  useEffect(() => {
    if (isAdmin) fetchGrowth();
  }, [isAdmin, fetchGrowth]);

  useEffect(() => {
    if (isAdmin) fetchFunnel();
  }, [isAdmin, fetchFunnel]);

  useEffect(() => {
    if (isAdmin && activeTab === "users") fetchUsers();
  }, [isAdmin, activeTab, fetchUsers]);

  useEffect(() => {
    if (isAdmin && activeTab === "contacts") fetchContacts();
  }, [isAdmin, activeTab, fetchContacts]);

  useEffect(() => {
    if (isAdmin && activeTab === "subscribers") fetchSubscribers();
  }, [isAdmin, activeTab, fetchSubscribers]);

  useEffect(() => {
    if (isAdmin && activeTab === "feedback") fetchFeedback();
  }, [isAdmin, activeTab, fetchFeedback]);

  // Reset page when filters change
  useEffect(() => { setUserPage(1); }, [userSearch, userRoleFilter]);
  useEffect(() => { setContactPage(1); }, [contactStatusFilter]);

  /* ─────── Auth gates ─────── */

  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-[var(--color-text-muted)]">{t("loading")}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("loginTitle")}</h1>
        <p className="text-[var(--color-text-muted)] mb-6">Please sign in to access the admin dashboard.</p>
        <Link
          href="/api/auth/signin"
          className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:brightness-110 transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">🚫 Admin Access Required</h1>
        <p className="text-[var(--color-text-muted)]">
          You are signed in as <strong>{session.user.email}</strong> with role &apos;{session.user.role}&apos;.
        </p>
      </div>
    );
  }

  /* ─────── Tab definitions ─────── */

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
    { id: "users", label: "Users", icon: <Users size={16} /> },
    { id: "contacts", label: "Contacts", icon: <Inbox size={16} /> },
    { id: "subscribers", label: "Subscribers", icon: <Mail size={16} /> },
    { id: "feedback", label: "Feedback", icon: <MessageSquare size={16} /> },
  ];

  /* ═══════════════════════════ Render ═══════════════════════════ */

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gradient">{t("title")}</h1>
          <PageViewCounter />
        </div>
        <button
          onClick={fetchSummary}
          disabled={summaryLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={summaryLoading ? "animate-spin" : ""} />
          {t("refreshData")}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-[var(--color-primary)] text-white shadow-lg"
                : "bg-[var(--color-glass)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-bg-card)]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════ Tab 1: Overview ═══════ */}
      {activeTab === "overview" && (
        <div className="space-y-6 fade-up">
          {summaryLoading ? (
            <LoadingSkeleton />
          ) : summaryData ? (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "Total Users", value: summaryData.totalUsers, icon: <Users size={24} className="text-blue-500" /> },
                  { label: "Active Subs", value: summaryData.activeSubscriptions, icon: <CreditCard size={24} className="text-green-500" /> },
                  { label: "MRR", value: `£${summaryData.mrr.toFixed(0)}`, icon: <TrendingUp size={24} className="text-purple-500" /> },
                  { label: "Subscribers", value: summaryData.totalSubscribers, icon: <Mail size={24} className="text-pink-500" /> },
                  { label: "Feedback", value: summaryData.totalFeedback, icon: <MessageSquare size={24} className="text-amber-500" /> },
                  { label: "Contacts", value: summaryData.totalContacts, icon: <Inbox size={24} className="text-indigo-500" /> },
                ].map((card) => (
                  <GlassCard key={card.label} className="p-5">
                    <div className="mb-3">{card.icon}</div>
                    <p className="text-2xl font-bold text-gradient">{card.value}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{card.label}</p>
                  </GlassCard>
                ))}
              </div>

              {/* ── Charts ── */}
              {funnelData && (
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-lg font-bold">Funnel, last 7 days</h2>
                      <p className="text-xs text-[var(--color-text-muted)]">First-party events only. Week-on-week compares with the previous 7 days.</p>
                    </div>
                    <button
                      onClick={fetchFunnel}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-glass)] border border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-colors"
                    >
                      Refresh funnel
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: "visitors", label: "Visitors", value: funnelData.current.visitors, change: funnelData.weekOnWeek.visitors },
                      { key: "signups", label: "Signups", value: funnelData.current.signups, change: funnelData.weekOnWeek.signups },
                      { key: "activation", label: "Activation", value: `${funnelData.current.activationRate}%`, change: funnelData.previous.activationRate },
                      { key: "paywallViews", label: "Paywall views", value: funnelData.current.paywallViews, change: funnelData.weekOnWeek.paywallViews },
                      { key: "checkoutStarts", label: "Checkout starts", value: funnelData.current.checkoutStarts, change: funnelData.weekOnWeek.checkoutStarts },
                      { key: "trials", label: "Trials", value: funnelData.current.trials, change: funnelData.weekOnWeek.trials },
                      { key: "paid", label: "Paid", value: funnelData.current.paid, change: funnelData.weekOnWeek.paid },
                      { key: "churn", label: "Churn", value: funnelData.current.churn, change: funnelData.weekOnWeek.churn },
                    ].map((metric) => (
                      <div key={metric.key} className="rounded-xl bg-[var(--color-glass)] p-4">
                        <p className="text-xs text-[var(--color-text-muted)]">{metric.label}</p>
                        <p className="mt-1 text-2xl font-bold text-gradient tabular-nums">{metric.value}</p>
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          {metric.key === "activation"
                            ? `${metric.change}% previous`
                            : metric.change === null
                              ? "New this week"
                              : `${metric.change > 0 ? "+" : ""}${metric.change}% week-on-week`}
                        </p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* ── Charts ── */}
              <div className="grid grid-cols-1 gap-4">
                <UserGrowthChart data={growthData} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PlanBarChart
                    data={{
                      monthly: summaryData.planBreakdown.monthly ?? 0,
                      annual: summaryData.planBreakdown.annual ?? 0,
                      lifetime: summaryData.planBreakdown.lifetime ?? 0,
                    }}
                  />
                  <SentimentDonut
                    data={{
                      up: summaryData.recentFeedback.filter((f) => f.rating === "up").length,
                      down: summaryData.recentFeedback.filter((f) => f.rating === "down").length,
                    }}
                  />
                </div>
              </div>

              {/* Role & plan breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="p-6">
                  <h2 className="text-lg font-bold mb-4">Role Breakdown</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(summaryData.roleBreakdown).map(([role, cnt]) => (
                      <div key={role} className="text-center p-3 rounded-xl bg-[var(--color-glass)]">
                        <p className="text-xl font-bold">{cnt}</p>
                        <RoleBadge role={role} />
                      </div>
                    ))}
                  </div>
                </GlassCard>
                <GlassCard className="p-6">
                  <h2 className="text-lg font-bold mb-4">Plan Breakdown</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(summaryData.planBreakdown).map(([plan, cnt]) => (
                      <div key={plan} className="text-center p-3 rounded-xl bg-[var(--color-glass)]">
                        <p className="text-xl font-bold">{cnt}</p>
                        <p className="text-xs text-[var(--color-text-muted)] capitalize mt-1">{plan}</p>
                      </div>
                    ))}
                    <div className="text-center p-3 rounded-xl bg-[var(--color-glass)]">
                      <p className="text-xl font-bold text-red-500">{summaryData.cancelledSubscriptions}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">Cancelled</p>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Recent users */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-4">Recent Users</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-2 font-semibold">Name</th>
                        <th className="text-left py-2 font-semibold">Email</th>
                        <th className="text-right py-2 font-semibold">Role</th>
                        <th className="text-right py-2 font-semibold">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.recentUsers.map((u) => (
                        <tr key={u.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-glass)] transition-colors">
                          <td className="py-2 font-medium">{u.name ?? "—"}</td>
                          <td className="py-2 text-[var(--color-text-muted)]">{u.email}</td>
                          <td className="text-right py-2"><RoleBadge role={u.role} /></td>
                          <td className="text-right py-2 text-[var(--color-text-muted)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </>
          ) : (
            <p className="text-[var(--color-text-muted)]">{t("noData")}</p>
          )}
        </div>
      )}

      {/* ═══════ Tab 2: Users ═══════ */}
      {activeTab === "users" && (
        <div className="space-y-4 fade-up">
          {/* Search & filters */}
          <GlassCard className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--color-glass)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "free", "pro", "admin"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      userRoleFilter === r
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-glass)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-bg-card)]"
                    }`}
                  >
                    {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Users table */}
          {usersLoading ? (
            <LoadingSkeleton />
          ) : userList ? (
            <GlassCard className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-3 font-semibold">Name</th>
                      <th className="text-left py-3 font-semibold">Email</th>
                      <th className="text-center py-3 font-semibold">Role</th>
                      <th className="text-center py-3 font-semibold">Subscription</th>
                      <th className="text-center py-3 font-semibold">Joined</th>
                      <th className="text-center py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-[var(--color-text-muted)]">No users found</td>
                      </tr>
                    ) : (
                      userList.users.map((u, i) => (
                        <tr
                          key={u.id}
                          className={`border-b border-[var(--color-border)]/50 hover:bg-[var(--color-glass)] transition-colors ${i % 2 === 1 ? "bg-[var(--color-glass)]/30" : ""}`}
                        >
                          <td className="py-3 font-medium">{u.name ?? "—"}</td>
                          <td className="py-3 text-[var(--color-text-muted)]">{u.email}</td>
                          <td className="py-3 text-center"><RoleBadge role={u.role} /></td>
                          <td className="py-3 text-center">
                            {u.subStatus ? <StatusBadge status={u.subStatus} /> : <span className="text-xs text-[var(--color-text-muted)]">—</span>}
                          </td>
                          <td className="py-3 text-center text-[var(--color-text-muted)] text-xs">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-center">
                            <select
                              value={u.role}
                              onChange={(e) => {
                                if (e.target.value !== u.role) {
                                  setRoleChangeTarget({ userId: u.id, name: u.name ?? u.email, newRole: e.target.value });
                                }
                              }}
                              className="text-xs px-2 py-1 rounded-lg bg-[var(--color-glass)] border border-[var(--color-border)] text-[var(--color-text)] cursor-pointer outline-none"
                            >
                              <option value="free">free</option>
                              <option value="pro">pro</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination page={userList.page} totalPages={userList.totalPages} onPageChange={setUserPage} />
            </GlassCard>
          ) : null}
        </div>
      )}

      {/* ═══════ Tab 3: Contacts ═══════ */}
      {activeTab === "contacts" && (
        <div className="space-y-4 fade-up">
          <GlassCard className="p-4">
            <div className="flex gap-2 flex-wrap">
              {["all", "new", "read", "replied", "archived"].map((s) => (
                <button
                  key={s}
                  onClick={() => setContactStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    contactStatusFilter === s
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-glass)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-bg-card)]"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </GlassCard>

          {contactsLoading ? (
            <LoadingSkeleton />
          ) : contacts ? (
            <GlassCard className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-3 font-semibold">Name</th>
                      <th className="text-left py-3 font-semibold">Email</th>
                      <th className="text-left py-3 font-semibold">Subject</th>
                      <th className="text-center py-3 font-semibold">Date</th>
                      <th className="text-center py-3 font-semibold">Status</th>
                      <th className="text-center py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.contacts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-[var(--color-text-muted)]">No contact submissions</td>
                      </tr>
                    ) : (
                      contacts.contacts.map((c, i) => (
                        <>
                          <tr
                            key={c.id}
                            onClick={() => setExpandedContact(expandedContact === c.id ? null : c.id)}
                            className={`border-b border-[var(--color-border)]/50 hover:bg-[var(--color-glass)] transition-colors cursor-pointer ${i % 2 === 1 ? "bg-[var(--color-glass)]/30" : ""}`}
                          >
                            <td className="py-3 font-medium">{c.name}</td>
                            <td className="py-3 text-[var(--color-text-muted)]">{c.email}</td>
                            <td className="py-3">{c.subject}</td>
                            <td className="py-3 text-center text-xs text-[var(--color-text-muted)]">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 text-center"><StatusBadge status={c.status} /></td>
                            <td className="py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {c.status !== "read" && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleContactStatus(c.id, "read"); }}
                                    title="Mark as Read"
                                    className="p-1.5 rounded-lg hover:bg-[var(--color-glass)] transition-colors cursor-pointer"
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}
                                {c.status !== "replied" && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleContactStatus(c.id, "replied"); }}
                                    title="Mark as Replied"
                                    className="p-1.5 rounded-lg hover:bg-[var(--color-glass)] transition-colors cursor-pointer"
                                  >
                                    <Reply size={14} />
                                  </button>
                                )}
                                {c.status !== "archived" && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleContactStatus(c.id, "archived"); }}
                                    title="Archive"
                                    className="p-1.5 rounded-lg hover:bg-[var(--color-glass)] transition-colors cursor-pointer"
                                  >
                                    <Archive size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {expandedContact === c.id && (
                            <tr key={`${c.id}-msg`}>
                              <td colSpan={6} className="px-4 py-4 bg-[var(--color-glass)]/50">
                                <p className="text-sm whitespace-pre-wrap text-[var(--color-text)]">{c.message}</p>
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination page={contacts.page} totalPages={contacts.totalPages} onPageChange={setContactPage} />
            </GlassCard>
          ) : null}
        </div>
      )}

      {/* ═══════ Tab 4: Subscribers ═══════ */}
      {activeTab === "subscribers" && (
        <div className="space-y-4 fade-up">
          <CampaignPanel />

          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-pink-500" />
              <span className="text-lg font-bold">{subscribersTotal}</span>
              <span className="text-sm text-[var(--color-text-muted)]">total newsletter subscribers</span>
            </div>
          </GlassCard>

          {subscribersLoading ? (
            <LoadingSkeleton />
          ) : (
            <GlassCard className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-3 font-semibold">Email</th>
                      <th className="text-center py-3 font-semibold">Locale</th>
                      <th className="text-right py-3 font-semibold">Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-[var(--color-text-muted)]">No subscribers yet</td>
                      </tr>
                    ) : (
                      subscribers.map((s, i) => (
                        <tr
                          key={s.email}
                          className={`border-b border-[var(--color-border)]/50 hover:bg-[var(--color-glass)] transition-colors ${i % 2 === 1 ? "bg-[var(--color-glass)]/30" : ""}`}
                        >
                          <td className="py-3 font-medium">{s.email}</td>
                          <td className="py-3 text-center text-[var(--color-text-muted)]">{s.locale ?? "en"}</td>
                          <td className="py-3 text-right text-xs text-[var(--color-text-muted)]">
                            {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* ═══════ Tab 5: Feedback ═══════ */}
      {activeTab === "feedback" && (
        <div className="space-y-4 fade-up">
          {/* Aggregate stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-amber-500" />
                <span className="text-lg font-bold">{feedbackTotal}</span>
                <span className="text-sm text-[var(--color-text-muted)]">total feedback</span>
              </div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <ThumbsUp size={20} className="text-green-500" />
                <span className="text-lg font-bold">{feedback.filter((f) => f.rating === "up").length}</span>
                <span className="text-sm text-[var(--color-text-muted)]">positive (recent)</span>
              </div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <ThumbsDown size={20} className="text-red-500" />
                <span className="text-lg font-bold">{feedback.filter((f) => f.rating === "down").length}</span>
                <span className="text-sm text-[var(--color-text-muted)]">negative (recent)</span>
              </div>
            </GlassCard>
          </div>

          {/* Program filter */}
          <GlassCard className="p-4">
            <div className="flex gap-2 flex-wrap">
              {["all", ...Array.from(new Set(feedback.map((f) => f.programSlug)))].map((p) => (
                <button
                  key={p}
                  onClick={() => setFeedbackProgramFilter(p)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    feedbackProgramFilter === p
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-glass)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-bg-card)]"
                  }`}
                >
                  {p === "all" ? "All Programs" : p}
                </button>
              ))}
            </div>
          </GlassCard>

          {feedbackLoading ? (
            <LoadingSkeleton />
          ) : (
            <GlassCard className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-3 font-semibold">Program</th>
                      <th className="text-left py-3 font-semibold">Lesson</th>
                      <th className="text-center py-3 font-semibold">Rating</th>
                      <th className="text-left py-3 font-semibold">Comment</th>
                      <th className="text-right py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback
                      .filter((f) => feedbackProgramFilter === "all" || f.programSlug === feedbackProgramFilter)
                      .map((f, i) => (
                        <tr
                          key={f.id}
                          className={`border-b border-[var(--color-border)]/50 hover:bg-[var(--color-glass)] transition-colors ${i % 2 === 1 ? "bg-[var(--color-glass)]/30" : ""}`}
                        >
                          <td className="py-3 font-medium">{f.programSlug}</td>
                          <td className="py-3 text-[var(--color-text-muted)]">{f.lessonSlug}</td>
                          <td className="py-3 text-center text-lg">{f.rating === "up" ? "👍" : "👎"}</td>
                          <td className="py-3 text-[var(--color-text-muted)] max-w-[200px] truncate">{f.comment ?? "—"}</td>
                          <td className="py-3 text-right text-xs text-[var(--color-text-muted)]">
                            {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      ))}
                    {feedback.filter((f) => feedbackProgramFilter === "all" || f.programSlug === feedbackProgramFilter).length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-[var(--color-text-muted)]">No feedback yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* ═══════ Role change confirmation dialog ═══════ */}
      {roleChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <GlassCard className="p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold mb-3">Confirm Role Change</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Change <strong>{roleChangeTarget.name}</strong>&apos;s role to{" "}
              <RoleBadge role={roleChangeTarget.newRole} />?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRoleChangeTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-glass)] border border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={roleChanging}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
              >
                {roleChanging ? "Updating…" : "Confirm"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
