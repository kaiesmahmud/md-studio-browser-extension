import { defaultSchema } from "rehype-sanitize";
import type { Options as SanitizeOptions } from "rehype-sanitize";
import yaml from "js-yaml";
import type { DocumentStats, FrontMatterResult, TocEntry } from "@/types";

/**
 * Sanitize schema — permissive enough for real markdown, strict on anything
 * script-adjacent. Raw HTML in user documents is rendered but neutered.
 */
export const sanitizeSchema: SanitizeOptions = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "id", "align"],
    code: [["className", /^language-./, "math-inline", "math-display"]],
    span: [["className", /^hljs-./]],
    input: ["type", "checked", "disabled"],
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
    img: [...(defaultSchema.attributes?.img ?? []), "loading", "width", "height"],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "input",
    "del",
    "details",
    "summary",
    "mark",
    "kbd",
    "sub",
    "sup",
  ],
  protocols: {
    ...defaultSchema.protocols,
    src: ["http", "https", "data"],
    href: ["http", "https", "mailto", "tel", "#"],
  },
};

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseFrontMatter(source: string): FrontMatterResult {
  const match = source.match(FRONT_MATTER_RE);

  if (!match) {
    return { data: null, body: source, raw: null };
  }

  try {
    const parsed = yaml.load(match[1]);
    const data =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;

    return {
      data,
      body: source.slice(match[0].length),
      raw: match[1],
    };
  } catch {
    // Malformed YAML — treat the block as ordinary content.
    return { data: null, body: source, raw: match[1] };
  }
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/gm;
const FENCE_RE = /^```[\s\S]*?^```/gm;

export function extractToc(source: string): TocEntry[] {
  // Strip fenced blocks so "# comment" inside code isn't treated as a heading.
  const withoutFences = source.replace(FENCE_RE, "");
  const entries: TocEntry[] = [];
  const seen = new Map<string, number>();

  let match: RegExpExecArray | null;
  HEADING_RE.lastIndex = 0;

  while ((match = HEADING_RE.exec(withoutFences)) !== null) {
    const depth = match[1].length;
    const text = match[2].replace(/[*_`~]/g, "").trim();
    if (!text) continue;

    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    entries.push({
      id: count === 0 ? base : `${base}-${count}`,
      text,
      depth,
    });
  }

  return entries;
}

/** Matches github-slugger, which is what rehype-slug uses. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

const WORDS_PER_MINUTE = 200;

export function computeStats(source: string): DocumentStats {
  const { body } = parseFrontMatter(source);
  const plain = body
    .replace(FENCE_RE, "")
    .replace(/`[^`]*`/g, "")
    .replace(/[#*_>~\-[\]()]/g, " ");

  const words = plain.split(/\s+/).filter(Boolean).length;
  const minutes = words / WORDS_PER_MINUTE;

  return {
    words,
    characters: source.length,
    charactersNoSpaces: source.replace(/\s/g, "").length,
    lines: source.split(/\r?\n/).length,
    readingTimeMinutes: minutes,
    readingTimeText: formatReadingTime(minutes),
  };
}

function formatReadingTime(minutes: number): string {
  if (minutes < 1) return "under 1 min read";
  const rounded = Math.ceil(minutes);
  return `${rounded} min read`;
}
