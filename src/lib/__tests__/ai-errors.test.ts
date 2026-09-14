import { describe, it, expect } from "vitest";
import { mapAiError } from "../ai-errors";

describe("mapAiError", () => {
  describe("given the model is at capacity", () => {
    it("maps a 503 from the Generative AI SDK to 503, not 500", () => {
      const err = new Error(
        "[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent: [503 Service Unavailable] This model is currently experiencing high demand."
      );

      const result = mapAiError(err);

      expect(result.status).toBe(503);
      expect(result.body.error).toMatch(/busy/i);
    });

    it("maps an UNAVAILABLE status to 503", () => {
      expect(mapAiError(new Error("UNAVAILABLE: backend overloaded")).status).toBe(503);
    });

    it("maps an overloaded message to 503", () => {
      expect(mapAiError(new Error("The model is overloaded")).status).toBe(503);
    });
  });

  describe("given our quota is exhausted", () => {
    it("maps a 429 to 429", () => {
      expect(mapAiError(new Error("[429 Too Many Requests]")).status).toBe(429);
    });

    it("maps RESOURCE_EXHAUSTED to 429", () => {
      expect(mapAiError(new Error("RESOURCE_EXHAUSTED")).status).toBe(429);
    });

    it("maps a quota message to 429", () => {
      expect(mapAiError(new Error("quota exceeded for this project")).status).toBe(429);
    });

    it("prefers 429 over 503 when both could match", () => {
      // Quota errors are actionable by us; capacity errors are not. If the
      // upstream message mentions both, the quota signal must win.
      expect(mapAiError(new Error("429 RESOURCE_EXHAUSTED: high demand")).status).toBe(429);
    });
  });

  describe("given a genuine fault", () => {
    it("falls back to 500 for unrecognised errors", () => {
      const result = mapAiError(new Error("Cannot read properties of undefined"));

      expect(result.status).toBe(500);
      expect(result.body.error).toMatch(/went wrong/i);
    });

    it("handles non-Error values without throwing", () => {
      expect(mapAiError("something odd").status).toBe(500);
      expect(mapAiError(null).status).toBe(500);
      expect(mapAiError(undefined).status).toBe(500);
    });
  });
});
