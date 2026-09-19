import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compile } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";
import { normaliseMdxSource } from "@/lib/mdx-safety";

async function expectMdxCompiles(source: string) {
  await expect(compile(source, { jsx: true })).resolves.toBeDefined();
}

describe("normaliseMdxSource", () => {
  it("escapes translated less-than metrics that MDX otherwise treats as JSX", async () => {
    const broken = "- **Core Web Vitals**: all green (LCP <2.5s, FID <100ms, CLS <0.1)";

    await expect(compile(broken, { jsx: true })).rejects.toThrow(/Unexpected character/);
    await expectMdxCompiles(normaliseMdxSource(broken));
  });

  it("splits machine-translated block component text onto a child line", async () => {
    const broken = [
      "<FunFact>The average person uses AI 20 to 30 times per day.",
      "</FunFact>",
    ].join("\n");

    await expect(compile(broken, { jsx: true })).rejects.toThrow(/Expected a closing tag/);
    await expectMdxCompiles(normaliseMdxSource(broken));
  });

  it("leaves fenced code examples unchanged", () => {
    const source = [
      "```tsx",
      "if (value <2) {",
      "  return <FunFact>not content",
      "}",
      "```",
    ].join("\n");

    expect(normaliseMdxSource(source)).toBe(source);
  });

  it("compiles the production URLs that exposed React error 441", async () => {
    const root = process.cwd();
    const files = [
      "content/blog/hi/how-we-built-ai-educademy.mdx",
      "content/blog/pt/how-we-built-ai-educademy.mdx",
      "content/blog/te/how-we-built-ai-educademy.mdx",
      "content/programs/ai-seeds/lessons/ar/what-is-ai.mdx",
      "content/programs/ai-seeds/lessons/de/what-is-ai.mdx",
      "content/programs/ai-sketch/lessons/ar/arrays-and-hashmaps.mdx",
      "content/programs/ai-sketch/lessons/de/arrays-and-hashmaps.mdx",
    ];

    for (const file of files) {
      const source = readFileSync(join(root, file), "utf8");
      await expectMdxCompiles(normaliseMdxSource(source));
    }
  });
});
