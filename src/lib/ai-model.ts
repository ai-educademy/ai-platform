import type { Content, GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Models tried in order. Capacity and quota are tracked per model, so when the
 * flagship is overloaded or rate-limited a lighter sibling usually still has
 * headroom. Override with GEMINI_MODELS="a,b,c" without a deploy of code.
 */
export const DEFAULT_GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-2.5-flash-lite",
];

export function geminiModels(): string[] {
  const fromEnv = process.env.GEMINI_MODELS?.split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_GEMINI_MODELS;
}

/** Errors another model might not have: capacity, quota, or a retired model id. */
export function isModelFallbackError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota") ||
    msg.includes("503") ||
    msg.includes("unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("high demand") ||
    msg.includes("404") ||
    msg.includes("not found")
  );
}

export async function sendChatWithFallback(
  genAI: GoogleGenerativeAI,
  {
    systemInstruction,
    history,
    message,
  }: { systemInstruction: string; history: Content[]; message: string },
  models: string[] = geminiModels(),
): Promise<{ text: string; model: string }> {
  let lastError: unknown;
  for (const name of models) {
    try {
      const chat = genAI
        .getGenerativeModel({ model: name, systemInstruction })
        .startChat({ history });
      const result = await chat.sendMessage(message);
      return { text: result.response.text(), model: name };
    } catch (err) {
      lastError = err;
      if (!isModelFallbackError(err)) throw err;
      console.warn(
        `[ai] ${name} unavailable, trying next model:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  throw lastError;
}
