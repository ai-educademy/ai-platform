#!/usr/bin/env python3
"""
Machine-translates MDX lesson and blog content into the locales the site ships.

Design notes
------------
MDX is not plain prose. A naive whole-file translation destroys it: code fences
get "translated", JSX attribute quoting breaks, URLs are mangled and quiz answer
indices drift. So the pipeline splits every file into translatable text spans and
protected spans, translates only the former, and reassembles.

Protected, never sent to the translator:
  * fenced code blocks and inline code
  * JSX tag names, and the `src`, `answer`, `correct` attributes
  * markdown link/image targets
  * frontmatter keys, and the values of order/difficulty/duration/icon/
    published/date/author/image (difficulty is an enum the app switches on)

Translated:
  * frontmatter title and description
  * all prose, headings, list items, blockquotes, table cells
  * Quiz question / explanation, and each pipe- or array-separated option
    translated INDIVIDUALLY so the delimiter and option count survive
  * Illustration alt and caption

Every generated file is stamped `machineTranslated: true` in its frontmatter so
the UI can tell the learner it has not been human-reviewed.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import random
import re
import ssl
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

ENDPOINT = "https://clients5.google.com/translate_a/t"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

TARGET_LOCALES = ["fr", "nl", "hi", "te", "es", "pt", "de", "zh", "ja", "ar"]
# Google uses different codes for a couple of these.
GOOGLE_CODE = {"zh": "zh-CN"}

# Frontmatter values that must stay byte-identical: enums the app switches on,
# numbers, booleans, dates, file paths and author names.
FM_TRANSLATE = {"title", "description"}

TRANSLATABLE_ATTRS = {"question", "explanation", "alt", "caption", "title", "concept"}
OPTION_ATTRS = {"options"}
# Answer indices and asset paths must never be touched.
PROTECTED_ATTRS = {"src", "answer", "correct", "order", "questionId", "language", "image"}

_sentinel_re = re.compile(r"\u2e24(\d+)\u2e25")


def sentinel(i: int) -> str:
    """A placeholder the translator reliably leaves intact.

    U+2E24/U+2E25 are bracket punctuation that Google passes through unchanged
    and that never appear in the corpus. Verified empirically before use.
    """
    return f"\u2e24{i}\u2e25"


class Translator:
    """Batching client with retry, backoff and an on-disk cache."""

    def __init__(self, cache_path: str, rate: float = 0.12, verbose: bool = False):
        self.cache_path = cache_path
        self.rate = rate
        self.verbose = verbose
        self.lock = threading.Lock()
        self.net_lock = threading.Lock()
        self.last_call = 0.0
        self.calls = 0
        self.chars = 0
        self.cache: dict[str, str] = {}
        if os.path.exists(cache_path):
            try:
                with open(cache_path, encoding="utf-8") as fh:
                    self.cache = json.load(fh)
            except Exception:
                self.cache = {}

    def save(self) -> None:
        with self.lock:
            tmp = self.cache_path + ".tmp"
            with open(tmp, "w", encoding="utf-8") as fh:
                json.dump(self.cache, fh, ensure_ascii=False)
            os.replace(tmp, self.cache_path)

    def _request(self, texts: list[str], tl: str) -> list[str]:
        params = [("client", "dict-chrome-ex"), ("sl", "en"), ("tl", tl)]
        params += [("q", t) for t in texts]
        url = ENDPOINT + "?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=60) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
        # Single-item requests come back as ["text"]; batches as ["a","b",...].
        if isinstance(raw, list) and raw and isinstance(raw[0], list):
            raw = [r[0] if isinstance(r, list) else r for r in raw]
        if not isinstance(raw, list):
            raise ValueError(f"unexpected response shape: {type(raw)}")
        if len(raw) != len(texts):
            raise ValueError(f"arity mismatch: sent {len(texts)} got {len(raw)}")
        return [str(x) for x in raw]

    def _throttle(self) -> None:
        now = time.time()
        wait = self.rate - (now - self.last_call)
        if wait > 0:
            time.sleep(wait)
        self.last_call = time.time()

    def translate_batch(self, texts: list[str], locale: str) -> list[str]:
        tl = GOOGLE_CODE.get(locale, locale)
        out: list[str | None] = [None] * len(texts)
        pending: list[tuple[int, str]] = []

        for i, t in enumerate(texts):
            if not t.strip():
                out[i] = t
                continue
            key = f"{locale}\x00{t}"
            with self.lock:
                hit = self.cache.get(key)
            if hit is not None:
                out[i] = hit
            else:
                pending.append((i, t))

        for chunk in self._chunks(pending):
            idxs = [i for i, _ in chunk]
            payload = [t for _, t in chunk]
            result = self._send_with_retry(payload, tl)
            with self.lock:
                for i, src, dst in zip(idxs, payload, result):
                    out[i] = dst
                    self.cache[f"{locale}\x00{src}"] = dst

        return [o if o is not None else "" for o in out]

    @staticmethod
    def _chunks(pending: list[tuple[int, str]], max_chars: int = 3500, max_items: int = 20):
        batch: list[tuple[int, str]] = []
        size = 0
        for item in pending:
            ln = len(item[1])
            if ln > max_chars:
                if batch:
                    yield batch
                    batch, size = [], 0
                yield [item]
                continue
            if batch and (size + ln > max_chars or len(batch) >= max_items):
                yield batch
                batch, size = [], 0
            batch.append(item)
            size += ln
        if batch:
            yield batch

    def _send_with_retry(self, payload: list[str], tl: str) -> list[str]:
        delay = 2.0
        for attempt in range(8):
            try:
                with self.net_lock:
                    self._throttle()
                    res = self._request(payload, tl)
                self.calls += 1
                self.chars += sum(len(p) for p in payload)
                return res
            except urllib.error.HTTPError as exc:
                if exc.code in (429, 503, 500, 403):
                    sleep_for = delay + random.uniform(0, 1.5)
                    if self.verbose:
                        print(f"    http {exc.code}, backing off {sleep_for:.1f}s", flush=True)
                    time.sleep(sleep_for)
                    delay = min(delay * 2, 90)
                    continue
                raise
            except Exception as exc:  # noqa: BLE001 - network flake, retry
                if attempt >= 5:
                    raise
                if self.verbose:
                    print(f"    retry after {exc}", flush=True)
                time.sleep(delay)
                delay = min(delay * 2, 60)
        raise RuntimeError("translation failed after retries")


# --------------------------------------------------------------------------
# MDX segmentation
# --------------------------------------------------------------------------

CODE_FENCE = re.compile(r"```.*?```", re.S)
INLINE_CODE = re.compile(r"`[^`\n]+`")
MD_LINK = re.compile(r"(!?\[)([^\]]*)(\]\()([^)]+)(\))")
HTML_COMMENT = re.compile(r"<!--.*?-->", re.S)
CLOSE_TAG = re.compile(r"</[A-Za-z]\w*>")
JSX_BLOCK = re.compile(r"<([A-Z]\w*)((?:[^>\"']|\"[^\"]*\"|'[^']*'|\{[^{}]*\})*?)(/?)>")
ATTR = re.compile(r"(\w+)\s*=\s*(\"[^\"]*\"|\{[^{}]*\}|'[^']*')")


def protect(text: str, store: list[str]) -> str:
    """Replaces code, comments, closing tags and link targets with sentinels."""

    def stash(m: re.Match) -> str:
        store.append(m.group(0))
        return sentinel(len(store) - 1)

    text = HTML_COMMENT.sub(stash, text)
    text = CODE_FENCE.sub(stash, text)
    text = INLINE_CODE.sub(stash, text)
    # Closing tags sit in the prose stream, so without this the translator can
    # reorder or space them and produce `< /FunFact>`.
    text = CLOSE_TAG.sub(stash, text)

    def link(m: re.Match) -> str:
        # Keep the visible label translatable, protect the URL.
        store.append(m.group(3) + m.group(4) + m.group(5))
        return m.group(1) + m.group(2) + sentinel(len(store) - 1)

    return MD_LINK.sub(link, text)


def restore(text: str, store: list[str]) -> str:
    def put(m: re.Match) -> str:
        idx = int(m.group(1))
        return store[idx] if 0 <= idx < len(store) else m.group(0)

    # Repeat: a restored span can itself contain a sentinel (protected link
    # inside a protected block).
    for _ in range(5):
        new = _sentinel_re.sub(put, text)
        if new == text:
            break
        text = new
    return text


def clean_attr_value(value: str) -> str:
    """Makes a translated string safe inside a double-quoted JSX attribute."""
    return (
        value.replace('"', "\u201d")
        .replace("\u201c", "\u201d")
        .replace("\n", " ")
        .strip()
    )


def split_options(raw: str) -> tuple[str, list[str]]:
    """Returns ('pipe'|'array', options). Handles both authoring styles."""
    v = raw.strip()
    if v.startswith("{") and v.endswith("}"):
        inner = v[1:-1].strip()
        try:
            parsed = json.loads(inner)
            if isinstance(parsed, list):
                return "array", [str(x) for x in parsed]
        except Exception:
            pass
        return "raw", [raw]
    if v.startswith('"') and v.endswith('"'):
        return "pipe", v[1:-1].split("|")
    return "raw", [raw]


class MdxDoc:
    """Collects every translatable span in a document, then rebuilds it."""

    def __init__(self, source: str):
        self.source = source
        self.store: list[str] = []
        self.spans: list[str] = []
        self.plan: list = []
        self._parse()

    def _add(self, text: str) -> int:
        self.spans.append(text)
        return len(self.spans) - 1

    def _parse(self) -> None:
        src = self.source
        fm_match = re.match(r"^---\n(.*?)\n---\n", src, re.S)
        self.frontmatter_raw = fm_match.group(1) if fm_match else None
        body = src[fm_match.end():] if fm_match else src

        self.fm_plan = []
        if self.frontmatter_raw is not None:
            for line in self.frontmatter_raw.split("\n"):
                m = re.match(r"^(\s*)([A-Za-z_]\w*):\s*(.*)$", line)
                if not m:
                    self.fm_plan.append(("raw", line))
                    continue
                indent, key, value = m.groups()
                if key in FM_TRANSLATE and value.strip():
                    quoted = value.strip().startswith('"')
                    inner = value.strip().strip('"')
                    self.fm_plan.append(("tr", indent, key, self._add(inner), quoted))
                else:
                    self.fm_plan.append(("raw", line))

        body = protect(body, self.store)
        self._parse_body(body)

    def _parse_body(self, body: str) -> None:
        pos = 0
        for m in JSX_BLOCK.finditer(body):
            if m.start() > pos:
                self._add_prose(body[pos:m.start()])
            self.plan.append(self._parse_tag(m))
            pos = m.end()
        if pos < len(body):
            self._add_prose(body[pos:])

    def _add_prose(self, chunk: str) -> None:
        """Splits prose on blank lines so each block round-trips independently."""
        for part in re.split(r"(\n\s*\n)", chunk):
            if not part:
                continue
            if part.strip() == "" or part.strip() == "---":
                self.plan.append(("lit", part))
            else:
                self.plan.append(("prose", self._add(part)))

    def _parse_tag(self, m: re.Match) -> tuple:
        name, attrs_raw, selfclose = m.group(1), m.group(2), m.group(3)
        pieces: list = []
        pos = 0
        for a in ATTR.finditer(attrs_raw):
            if a.start() > pos:
                pieces.append(("lit", attrs_raw[pos:a.start()]))
            key, value = a.group(1), a.group(2)
            if key in PROTECTED_ATTRS or key not in (TRANSLATABLE_ATTRS | OPTION_ATTRS):
                pieces.append(("lit", a.group(0)))
            elif key in OPTION_ATTRS:
                kind, opts = split_options(value)
                if kind == "raw":
                    pieces.append(("lit", a.group(0)))
                else:
                    pieces.append(("opts", key, kind, [self._add(o) for o in opts]))
            else:
                quoted = value.startswith('"')
                inner = value[1:-1] if quoted else value
                if quoted:
                    pieces.append(("attr", key, self._add(inner)))
                else:
                    pieces.append(("lit", a.group(0)))
            pos = a.end()
        if pos < len(attrs_raw):
            pieces.append(("lit", attrs_raw[pos:]))
        return ("tag", name, pieces, selfclose)

    def render(self, translated: list[str]) -> str:
        out = []
        if self.frontmatter_raw is not None:
            out.append("---\n")
            for item in self.fm_plan:
                if item[0] == "raw":
                    out.append(item[1] + "\n")
                else:
                    _, indent, key, idx, quoted = item
                    val = translated[idx].replace('"', "\u201d").replace("\n", " ").strip()
                    out.append(f'{indent}{key}: "{val}"\n' if quoted else f"{indent}{key}: {val}\n")
            out.append("machineTranslated: true\n")
            out.append("---\n")

        for item in self.plan:
            kind = item[0]
            if kind == "lit":
                out.append(item[1])
            elif kind == "prose":
                out.append(translated[item[1]])
            elif kind == "tag":
                _, name, pieces, selfclose = item
                buf = [f"<{name}"]
                for p in pieces:
                    if p[0] == "lit":
                        buf.append(p[1])
                    elif p[0] == "attr":
                        buf.append(f'{p[1]}="{clean_attr_value(translated[p[2]])}"')
                    elif p[0] == "opts":
                        _, key, ck, idxs = p
                        vals = [clean_attr_value(translated[i]) for i in idxs]
                        if ck == "pipe":
                            vals = [v.replace("|", "/") for v in vals]
                            buf.append(f'{key}="{"|".join(vals)}"')
                        else:
                            buf.append(f"{key}={{{json.dumps(vals, ensure_ascii=False)}}}")
                buf.append(f"{selfclose}>")
                out.append("".join(buf))
        return restore("".join(out), self.store)


def translate_file(src_path: str, dst_path: str, locale: str, tr: Translator) -> tuple[int, int]:
    with open(src_path, encoding="utf-8") as fh:
        source = fh.read()
    doc = MdxDoc(source)
    translated = tr.translate_batch(doc.spans, locale)

    # Sentinels must survive translation or the document loses its code blocks.
    # The translator drops them occasionally, and deterministically for a few
    # inputs, so a lost sentinel falls back to the English span rather than
    # discarding the whole document. A span left in English is far better than a
    # lesson that exists in ten locales but not this one.
    fallbacks = 0
    for i, (original, result) in enumerate(zip(doc.spans, translated)):
        missing = set(_sentinel_re.findall(original)) - set(_sentinel_re.findall(result))
        if missing:
            translated[i] = original
            fallbacks += 1

    # If most of the document failed, the output would be a confusing mix rather
    # than a translation, so refuse it and leave the locale to fall back wholesale.
    if doc.spans and fallbacks / len(doc.spans) > 0.25:
        raise ValueError(
            f"{os.path.basename(src_path)} [{locale}]: translator dropped placeholders in "
            f"{fallbacks}/{len(doc.spans)} spans"
        )

    rendered = doc.render(translated)
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with open(dst_path, "w", encoding="utf-8") as fh:
        fh.write(rendered)
    return len(doc.spans), sum(len(s) for s in doc.spans)


def discover(roots: list[str]) -> list[tuple[str, str]]:
    """Returns (english_path, relative_dir_marker) for every source document."""
    found = []
    for root in roots:
        for dirpath, _dirnames, filenames in os.walk(root):
            parts = dirpath.split(os.sep)
            if not parts or parts[-1] != "en":
                continue
            for fn in filenames:
                if fn.endswith(".mdx"):
                    found.append((os.path.join(dirpath, fn), dirpath))
    return sorted(found)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--locales", default=",".join(TARGET_LOCALES))
    ap.add_argument("--roots", default="content,content-pro")
    ap.add_argument("--cache", default=".translation-cache.json")
    ap.add_argument("--limit", type=int, default=0, help="only N files per locale")
    ap.add_argument("--only", default="", help="substring filter on source path")
    ap.add_argument("--force", action="store_true", help="retranslate existing files")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--rate", type=float, default=0.12)
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    roots = [r for r in args.roots.split(",") if r]
    locales = [l for l in args.locales.split(",") if l]
    sources = discover(roots)
    if args.only:
        sources = [s for s in sources if args.only in s[0]]
    print(f"found {len(sources)} english documents across {roots}")

    tr = Translator(args.cache, rate=args.rate, verbose=args.verbose)
    jobs = []
    for locale in locales:
        made = 0
        for src, dirpath in sources:
            dst = os.path.join(os.path.dirname(dirpath), locale, os.path.basename(src))
            if os.path.exists(dst) and not args.force:
                continue
            if args.limit and made >= args.limit:
                break
            jobs.append((src, dst, locale))
            made += 1
    print(f"{len(jobs)} files to generate")
    if not jobs:
        return 0

    done = 0
    failures: list[str] = []
    start = time.time()
    lock = threading.Lock()

    def work(job):
        nonlocal done
        src, dst, locale = job
        try:
            spans, chars = translate_file(src, dst, locale, tr)
        except Exception as exc:  # noqa: BLE001 - report and continue
            with lock:
                failures.append(f"{locale} {os.path.basename(src)}: {exc}")
            return
        with lock:
            done += 1
            if done % 10 == 0 or done == len(jobs):
                el = time.time() - start
                rate = done / el if el else 0
                eta = (len(jobs) - done) / rate if rate else 0
                print(
                    f"  {done}/{len(jobs)} files | {tr.calls} calls | "
                    f"{tr.chars/1000:.0f}k chars | {rate*60:.1f} files/min | "
                    f"eta {eta/60:.0f}m",
                    flush=True,
                )
                tr.save()

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        list(pool.map(work, jobs))

    tr.save()
    print(f"\ncompleted {done}/{len(jobs)} in {(time.time()-start)/60:.1f}m")
    if failures:
        print(f"{len(failures)} failures:")
        for f in failures[:40]:
            print("  ", f)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
