"use client";

import { useState } from "react";

type CampaignResult = {
  campaign: string;
  dryRun: boolean;
  eligible: number;
  alreadySent: number;
  sent: number;
  failed: number;
  errors: string[];
  sampleRecipients: string[];
};

/**
 * Admin control for the Pro upgrade campaign.
 *
 * The dry run is the primary action and the only one reachable in a single
 * click. Sending requires typing the confirmation, because the action is
 * irreversible and lands in real customers' inboxes.
 */
export function CampaignPanel() {
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [testEmail, setTestEmail] = useState("");

  async function run(payload: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Request failed");
        setResult(null);
        return;
      }
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  const canSend = confirmText === "SEND";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h3 className="text-lg font-semibold text-white">Pro upgrade campaign</h3>
      <p className="mt-1 text-sm text-white/60">
        Targets free accounts with no active subscription that have not opted out. Each
        recipient is recorded, so re-running never emails the same person twice.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => run({ dryRun: true })}
          className="rounded-lg bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-500/30 disabled:opacity-50"
        >
          {loading ? "Working…" : "Preview recipients (dry run)"}
        </button>

        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30"
          />
          <button
            type="button"
            disabled={loading || !testEmail}
            onClick={() => run({ dryRun: false, testEmail })}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
          >
            Send test
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-amber-400/20 bg-amber-400/5 p-4">
        <p className="text-sm text-amber-200/90">
          Type <code className="font-mono font-semibold">SEND</code> to enable the real
          send. This cannot be undone.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="SEND"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30"
          />
          <button
            type="button"
            disabled={loading || !canSend}
            onClick={() => run({ dryRun: false, confirm: "SEND" })}
            className="rounded-lg bg-rose-500/80 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-40"
          >
            Send for real
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>
      )}

      {result && (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {(
            [
              ["Eligible", result.eligible],
              ["Already sent", result.alreadySent],
              ["Sent", result.sent],
              ["Failed", result.failed],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-lg bg-white/5 p-3">
              <dt className="text-white/50">{label}</dt>
              <dd className="text-xl font-semibold text-white">{value}</dd>
            </div>
          ))}
          {result.sampleRecipients.length > 0 && (
            <div className="col-span-2 rounded-lg bg-white/5 p-3 sm:col-span-4">
              <dt className="text-white/50">
                {result.dryRun ? "Would send to (first 5)" : "Sent to (first 5)"}
              </dt>
              <dd className="mt-1 font-mono text-xs text-white/80">
                {result.sampleRecipients.join(", ")}
              </dd>
            </div>
          )}
          {result.errors.length > 0 && (
            <div className="col-span-2 rounded-lg bg-rose-500/10 p-3 sm:col-span-4">
              <dt className="text-rose-200/70">Errors</dt>
              <dd className="mt-1 font-mono text-xs text-rose-200">
                {result.errors.slice(0, 5).join(" · ")}
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
