import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseProStatus = vi.fn();

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ isCompleted: () => true }),
}));
vi.mock("@/hooks/useReducedMotion", () => ({ useReducedMotion: () => true }));
vi.mock("@/hooks/useProStatus", () => ({
  useProStatus: () => mockUseProStatus(),
}));

import { LessonFeedback } from "@/components/lessons/LessonFeedback";

beforeEach(() => {
  vi.clearAllMocks();
  mockUseProStatus.mockReturnValue({ isPro: false, loading: false });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }),
  );
});

async function rateHelpful() {
  const user = userEvent.setup();
  render(
    <LessonFeedback
      lessonSlug="what-is-ai"
      programSlug="ai-seeds"
      locale="fr"
    />,
  );
  await user.click(screen.getByRole("button", { name: /helpful/ }));
  const submit = screen.queryByRole("button", { name: /submit/ });
  if (submit) await user.click(submit);
  await screen.findByText(/thanks/);
}

describe("LessonFeedback certificate nudge", () => {
  it("given a free learner who found the lesson helpful, when they finish feedback, then Pro certificates are offered in their locale", async () => {
    await rateHelpful();

    expect(screen.getByText(/certificateNudge$/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "certificateNudgeCta" }),
    ).toHaveAttribute("href", "/fr/pricing");
  });

  it("given a Pro learner, when they finish feedback, then no upsell is shown", async () => {
    mockUseProStatus.mockReturnValue({ isPro: true, loading: false });

    await rateHelpful();

    expect(
      screen.queryByRole("link", { name: "certificateNudgeCta" }),
    ).toBeNull();
  });
});
