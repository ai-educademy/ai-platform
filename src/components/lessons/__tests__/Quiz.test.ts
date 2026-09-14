import { describe, it, expect } from "vitest";
import { parseAnswerIndex } from "../Quiz";

describe("parseAnswerIndex", () => {
  it("reads the numeric spelling used by correct={n}", () => {
    expect(parseAnswerIndex(1)).toBe(1);
    expect(parseAnswerIndex(2)).toBe(2);
  });

  it('reads the string spelling used by answer="n"', () => {
    expect(parseAnswerIndex("1")).toBe(1);
    expect(parseAnswerIndex("2")).toBe(2);
  });

  it("keeps a legitimate zero index", () => {
    expect(parseAnswerIndex(0)).toBe(0);
    expect(parseAnswerIndex("0")).toBe(0);
  });

  it("falls back to 0 for missing or unusable values", () => {
    expect(parseAnswerIndex(undefined)).toBe(0);
    expect(parseAnswerIndex("")).toBe(0);
    expect(parseAnswerIndex("not a number")).toBe(0);
    expect(parseAnswerIndex(-1)).toBe(0);
    expect(parseAnswerIndex(1.5)).toBe(0);
  });
});
