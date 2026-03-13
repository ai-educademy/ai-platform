import Link from "next/link";

const PROMPT_PROGRAMS = new Set([
  "ai-canopy",
  "ai-forest",
]);

export function ExperimentCta({
  programSlug,
  basePath,
  label,
  description,
  promptLabel,
  promptDescription,
}: {
  programSlug: string;
  basePath: string;
  label: string;
  description: string;
  promptLabel: string;
  promptDescription: string;
}) {
  const isPromptProgram = PROMPT_PROGRAMS.has(programSlug);
  const href = isPromptProgram
    ? `${basePath}/experiments/prompt-lab`
    : `${basePath}/experiments`;
  const title = isPromptProgram ? promptLabel : label;
  const desc = isPromptProgram ? promptDescription : description;
  const icon = isPromptProgram ? "✨" : "🧪";

  return (
    <div className="mb-14">
      <Link href={href} className="group block">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-6 transition-all duration-300 hover:border-[var(--color-primary)]/40 hover:shadow-lg hover:shadow-[var(--color-primary)]/10">
          <div className="flex items-center gap-4">
            <span className="text-3xl" aria-hidden="true">
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                {title}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
            </div>
            <span className="shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
