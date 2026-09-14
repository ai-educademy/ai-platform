"use client";

import { useEffect, useState } from "react";

interface GitHubStats {
  stars: number;
  forks: number;
  contributors: number;
}

const REPO = "ai-educademy/ai-platform";
const CACHE_KEY = "github-stats-cache";
const CACHE_TTL = 3600000; // 1 hour

export default function GitHubStatsWidget() {
  const [stats, setStats] = useState<GitHubStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      // Check localStorage cache first
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setStats(data);
            return;
          }
        }
      } catch {
        // Corrupt or unavailable cache: fall through to a fresh fetch.
      }

      try {
        const res = await fetch(`https://api.github.com/repos/${REPO}`, {
          headers: { Accept: "application/vnd.github.v3+json" },
        });
        if (!res.ok) return;
        const repo = await res.json();

        // Fetch contributors count (first page with per_page=1 to read Link header)
        let contributors = 0;
        try {
          const contribRes = await fetch(
            `https://api.github.com/repos/${REPO}/contributors?per_page=1&anon=true`,
            { headers: { Accept: "application/vnd.github.v3+json" } }
          );
          const linkHeader = contribRes.headers.get("link");
          if (linkHeader) {
            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
            if (match) contributors = parseInt(match[1], 10);
          } else {
            const contribData = await contribRes.json();
            contributors = Array.isArray(contribData) ? contribData.length : 1;
          }
        } catch {
          // Contributors endpoint is best-effort; keep the count at 0.
        }

        const data: GitHubStats = {
          stars: repo.stargazers_count ?? 0,
          forks: repo.forks_count ?? 0,
          contributors,
        };

        setStats(data);
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data, timestamp: Date.now() })
          );
        } catch {
          // Storage can be full or blocked; caching is optional.
        }
      } catch {
        // Stats are decorative, so a failed fetch just renders nothing.
      }
    }

    fetchStats();
  }, []);

  if (!stats) return null;

  const items = [
    { icon: "⭐", value: stats.stars, label: "Stars" },
    { icon: "🍴", value: stats.forks, label: "Forks" },
    { icon: "👥", value: stats.contributors, label: "Contributors" },
  ];

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 backdrop-blur-sm hover:border-[var(--color-primary)] transition-colors"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-[var(--color-text-muted)]"
        aria-hidden="true"
      >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
      {items.map((item, i) => (
        <span
          key={item.label}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]"
        >
          <span>{item.icon}</span>
          <span className="font-semibold text-[var(--color-text)]">
            {item.value}
          </span>
          <span className="hidden sm:inline">{item.label}</span>
          {i < items.length - 1 && (
            <span className="ml-2 text-[var(--color-border)]">·</span>
          )}
        </span>
      ))}
    </a>
  );
}
