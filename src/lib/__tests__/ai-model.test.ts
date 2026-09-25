import { describe, expect, it, vi } from "vitest";
import type { GoogleGenerativeAI } from "@google/generative-ai";
import { isModelFallbackError, sendChatWithFallback } from "@/lib/ai-model";

function fakeGenAI(behaviour: Record<string, () => Promise<string>>) {
  const tried: string[] = [];
  const genAI = {
    getGenerativeModel: ({ model }: { model: string }) => ({
      startChat: () => ({
        sendMessage: async () => {
          tried.push(model);
          const text = await behaviour[model]();
          return { response: { text: () => text } };
        },
      }),
    }),
  } as unknown as GoogleGenerativeAI;
  return { genAI, tried };
}

const input = { systemInstruction: "sys", history: [], message: "hi" };

describe("sendChatWithFallback", () => {
  it("given the first model is overloaded, when a chat is sent, then the next model answers", async () => {
    const { genAI, tried } = fakeGenAI({
      a: () =>
        Promise.reject(
          new Error("[503 Service Unavailable] The model is overloaded"),
        ),
      b: () => Promise.resolve("answer from b"),
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await sendChatWithFallback(genAI, input, ["a", "b"]);

    expect(result).toEqual({ text: "answer from b", model: "b" });
    expect(tried).toEqual(["a", "b"]);
  });

  it("given a non-capacity error, when a chat is sent, then it fails fast without trying other models", async () => {
    const { genAI, tried } = fakeGenAI({
      a: () => Promise.reject(new Error("[400 Bad Request] API key not valid")),
      b: () => Promise.resolve("never"),
    });

    await expect(
      sendChatWithFallback(genAI, input, ["a", "b"]),
    ).rejects.toThrow("API key not valid");
    expect(tried).toEqual(["a"]);
  });

  it("given every model is exhausted, when a chat is sent, then the last error surfaces for mapping", async () => {
    const { genAI } = fakeGenAI({
      a: () => Promise.reject(new Error("[429 Too Many Requests] quota")),
      b: () =>
        Promise.reject(new Error("[429 Too Many Requests] RESOURCE_EXHAUSTED")),
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      sendChatWithFallback(genAI, input, ["a", "b"]),
    ).rejects.toThrow("RESOURCE_EXHAUSTED");
  });

  it("classifies capacity, quota and retired-model errors as fallback-worthy", () => {
    expect(isModelFallbackError(new Error("[429 Too Many Requests]"))).toBe(
      true,
    );
    expect(isModelFallbackError(new Error("[503 Service Unavailable]"))).toBe(
      true,
    );
    expect(
      isModelFallbackError(new Error("[404 Not Found] models/x is not found")),
    ).toBe(true);
    expect(
      isModelFallbackError(new Error("[400 Bad Request] invalid argument")),
    ).toBe(false);
  });
});
