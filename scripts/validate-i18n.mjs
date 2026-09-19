import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";
import ts from "typescript";
import IntlMessageFormat from "intl-messageformat";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");
const MESSAGES_DIR = join(ROOT, "messages");
const jsonMode = process.argv.includes("--json");

const localeFiles = readdirSync(MESSAGES_DIR)
  .filter((file) => file.endsWith(".json"))
  .sort();

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

function walk(dir, predicate, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(path, predicate, files);
    } else if (predicate(path)) {
      files.push(path);
    }
  }
  return files;
}

function flatten(value, prefix = "", out = {}) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out);
    }
  } else {
    out[prefix] = value;
  }
  return out;
}

function getStringLiteral(node) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return undefined;
}

function unwrapAwait(node) {
  return ts.isAwaitExpression(node) ? node.expression : node;
}

function getCallNamespace(call) {
  if (!ts.isCallExpression(call)) return undefined;
  const callee = call.expression;
  const isTranslationFactory =
    ts.isIdentifier(callee) && (callee.text === "useTranslations" || callee.text === "getTranslations");
  if (!isTranslationFactory) return undefined;

  const first = call.arguments[0];
  const direct = getStringLiteral(first);
  if (direct !== undefined) return direct;

  if (first && ts.isObjectLiteralExpression(first)) {
    for (const prop of first.properties) {
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isIdentifier(prop.name) &&
        prop.name.text === "namespace"
      ) {
        return getStringLiteral(prop.initializer);
      }
    }
  }

  return "";
}

function parseUsedKeys() {
  const used = new Set();
  const dynamicPrefixes = new Set();
  const dynamicCalls = [];
  const files = walk(SRC_DIR, (file) => /\.(ts|tsx)$/.test(file) && !file.endsWith(".d.ts"));

  for (const file of files) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const bindings = new Map();

    function bind(node) {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        const initializer = unwrapAwait(node.initializer);
        const namespace = getCallNamespace(initializer);
        if (namespace !== undefined) bindings.set(node.name.text, namespace);
      }
      ts.forEachChild(node, bind);
    }

    function collect(node) {
      if (ts.isCallExpression(node)) {
        let translator;
        if (ts.isIdentifier(node.expression)) {
          translator = node.expression.text;
        } else if (
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          ["rich", "markup", "raw"].includes(node.expression.name.text)
        ) {
          translator = node.expression.expression.text;
        }

        if (translator && bindings.has(translator)) {
          const namespace = bindings.get(translator);
          const first = node.arguments[0];
          const literal = getStringLiteral(first);
          if (literal !== undefined) {
            used.add(namespace ? `${namespace}.${literal}` : literal);
          } else if (first && ts.isTemplateExpression(first)) {
            const prefix = namespace ? `${namespace}.${first.head.text}` : first.head.text;
            if (prefix) dynamicPrefixes.add(prefix);
            dynamicCalls.push(`${relative(ROOT, file)}:${source.getLineAndCharacterOfPosition(first.pos).line + 1}`);
          } else if (first) {
            dynamicCalls.push(`${relative(ROOT, file)}:${source.getLineAndCharacterOfPosition(first.pos).line + 1}`);
          }
        }
      }
      ts.forEachChild(node, collect);
    }

    bind(source);
    collect(source);
  }

  return { used, dynamicPrefixes, dynamicCalls };
}

function placeholderNames(message) {
  const names = new Set();
  const pattern = /\{([A-Za-z_][A-Za-z0-9_]*)\b/g;
  let match;
  while ((match = pattern.exec(message)) !== null) {
    names.add(match[1]);
  }
  return [...names].sort();
}

const messages = Object.fromEntries(
  localeFiles.map((file) => [file.replace(/\.json$/, ""), readJson(join(MESSAGES_DIR, file))]),
);
const flat = Object.fromEntries(Object.entries(messages).map(([locale, value]) => [locale, flatten(value)]));
const locales = Object.keys(flat);
const enKeys = new Set(Object.keys(flat.en ?? {}));
const { used, dynamicPrefixes, dynamicCalls } = parseUsedKeys();
const usedKeys = [...used].sort();

const canBeDynamic = (key) => [...dynamicPrefixes].some((prefix) => key.startsWith(prefix));

const report = {
  locales: {},
  usedKeyCount: usedKeys.length,
  dynamicCallCount: dynamicCalls.length,
  dynamicCalls,
  icuProblems: [],
  placeholderProblems: [],
};

for (const locale of locales) {
  const keys = new Set(Object.keys(flat[locale]));
  const missingUsed = usedKeys.filter((key) => !keys.has(key));
  const missingFromEnglish = [...enKeys].filter((key) => !keys.has(key)).sort();
  const orphaned = [...keys].filter((key) => !used.has(key) && !canBeDynamic(key)).sort();
  const untranslated = locale === "en"
    ? []
    : [...enKeys].filter((key) => {
        const localValue = flat[locale][key];
        const englishValue = flat.en[key];
        return typeof localValue === "string" && typeof englishValue === "string" && localValue === englishValue;
      }).sort();

  report.locales[locale] = {
    totalKeys: keys.size,
    missingUsed: missingUsed.length,
    missingUsedKeys: missingUsed,
    missingFromEnglish: missingFromEnglish.length,
    missingFromEnglishKeys: missingFromEnglish,
    orphaned: orphaned.length,
    orphanedKeys: orphaned,
    untranslated: untranslated.length,
    untranslatedKeys: untranslated,
  };

  for (const [key, value] of Object.entries(flat[locale])) {
    if (typeof value !== "string") continue;
    try {
      new IntlMessageFormat(value, locale);
    } catch (error) {
      report.icuProblems.push({ locale, key, message: error.message });
    }
  }
}

for (const key of enKeys) {
  const english = flat.en[key];
  if (typeof english !== "string") continue;
  const expected = placeholderNames(english).join(",");
  for (const locale of locales.filter((value) => value !== "en")) {
    const local = flat[locale][key];
    if (typeof local !== "string") continue;
    const actual = placeholderNames(local).join(",");
    if (actual !== expected) {
      report.placeholderProblems.push({ locale, key, expected, actual });
    }
  }
}

const failingLocales = Object.entries(report.locales)
  .filter(([, localeReport]) => localeReport.missingUsed > 0 || localeReport.missingFromEnglish > 0)
  .map(([locale]) => locale);

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Used translation keys: ${report.usedKeyCount}`);
  console.log(`Dynamic translation calls: ${report.dynamicCallCount}`);
  console.log("");
  console.log("| Locale | Missing used | Missing from en | Orphaned | Untranslated |");
  console.log("| --- | ---: | ---: | ---: | ---: |");
  for (const locale of locales) {
    const item = report.locales[locale];
    console.log(`| ${locale} | ${item.missingUsed} | ${item.missingFromEnglish} | ${item.orphaned} | ${item.untranslated} |`);
  }
  if (report.icuProblems.length) {
    console.log("");
    console.log("ICU problems:");
    for (const item of report.icuProblems) {
      console.log(`- ${item.locale}.${item.key}: ${item.message}`);
    }
  }
  if (report.placeholderProblems.length) {
    console.log("");
    console.log("Placeholder problems:");
    for (const item of report.placeholderProblems) {
      console.log(`- ${item.locale}.${item.key}: expected {${item.expected}}, found {${item.actual}}`);
    }
  }
}

if (!existsSync(MESSAGES_DIR)) {
  process.exit(1);
}

if (failingLocales.length || report.icuProblems.length || report.placeholderProblems.length) {
  process.exit(1);
}
