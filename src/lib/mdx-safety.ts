const BLOCK_COMPONENTS = new Set(["Callout", "FunFact", "ThinkAboutIt"]);

function isFence(line: string): boolean {
  return /^```/.test(line.trimStart());
}

function normaliseMdxLine(line: string): string {
  const block = line.match(/^<([A-Z][A-Za-z0-9]*)(\s[^>]*)?>(.+)$/);
  if (block) {
    const [, name, attrs = "", rest] = block;
    if (name && BLOCK_COMPONENTS.has(name) && !rest.includes(`</${name}>`)) {
      return `<${name}${attrs}>\n${rest}`;
    }
  }

  return line.replace(/<(?=\d)/g, "&lt;");
}

/**
 * Normalises machine-translated MDX defects that are safe to repair
 * mechanically before next-mdx-remote compiles the source.
 */
export function normaliseMdxSource(source: string): string {
  let inFence = false;

  return source
    .split("\n")
    .map((line) => {
      if (isFence(line)) {
        inFence = !inFence;
        return line;
      }
      return inFence ? line : normaliseMdxLine(line);
    })
    .join("\n");
}
