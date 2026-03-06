"use client";

import { useState, useEffect, useCallback } from "react";

interface Summary {
  totalEvents: number;
  totalSubscribers: number;
  totalFeedback: number;
  eventCounts: Record<string, number>;
  popularLessons: { lesson: string; views: number }[];
  feedbackByProgram: Record<string, { up: number; down: number }>;
  recentSubscribers: { email: string; subscribedAt: string }[];
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analytics/summary");
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch {
      setError("Failed to load analytics data");
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
      setError("Invalid secret");
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <h1 className="text-2xl font-bold mb-6 text-center">🔐 Admin Access</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter admin secret"
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold"
          >
            Access Dashboard
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
        <p className="text-[var(--color-text-muted)]">Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-gradient">📊 Admin Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Newsletter Subscribers", value: data.totalSubscribers, icon: "📧" },
          { label: "Total Feedback", value: data.totalFeedback, icon: "💬" },
          { label: "Total Events", value: data.totalEvents, icon: "📈" },
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
        <h2 className="text-xl font-bold mb-4">💬 Feedback by Program</h2>
        {Object.keys(data.feedbackByProgram).length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">No feedback yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 font-semibold">Program</th>
                <th className="text-right py-2 font-semibold">👍 Up</th>
                <th className="text-right py-2 font-semibold">👎 Down</th>
                <th className="text-right py-2 font-semibold">Total</th>
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
        <h2 className="text-xl font-bold mb-4">🔥 Popular Lessons</h2>
        {data.popularLessons.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">No page views tracked yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 font-semibold">Lesson</th>
                <th className="text-right py-2 font-semibold">Views</th>
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
        <h2 className="text-xl font-bold mb-4">📈 Event Breakdown</h2>
        {Object.keys(data.eventCounts).length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">No events tracked yet</p>
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
        <h2 className="text-xl font-bold mb-4">📧 Recent Subscribers</h2>
        {data.recentSubscribers.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">No subscribers yet</p>
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

      <button
        onClick={fetchData}
        className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-all cursor-pointer"
      >
        🔄 Refresh Data
      </button>
    </div>
  );
}
