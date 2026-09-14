/**
 * Maps errors thrown by the Google Generative AI SDK onto HTTP responses that
 * describe what actually went wrong.
 *
 * Without this, every upstream problem surfaced as a generic 500. Two of those
 * cases are not our fault and are expected to recover on their own:
 *   - 429 / RESOURCE_EXHAUSTED: our quota is spent
 *   - 503 / UNAVAILABLE / overloaded: the model itself is at capacity
 *
 * Reporting those as 500 misleads clients, hides genuine server faults in
 * alerting noise, and stops the UI from telling the user to simply retry.
 */
export type AiErrorResponse = {
  status: number;
  body: { error: string };
};

export function mapAiError(err: unknown): AiErrorResponse {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
    return {
      status: 429,
      body: { error: "I'm taking a short break due to high demand 🙏 Please try again in a minute." },
    };
  }

  if (
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.toLowerCase().includes("overloaded") ||
    msg.toLowerCase().includes("high demand")
  ) {
    return {
      status: 503,
      body: { error: "The AI model is busy right now. Please try again in a moment." },
    };
  }

  return {
    status: 500,
    body: { error: "Something went wrong. Please try again." },
  };
}
