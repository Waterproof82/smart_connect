/**
 * Pure parser for curated knowledge-base markdown files (design.md
 * rag-knowledge-base-refresh D9/D10). No fs/Deno/network imports — the
 * orchestrator (Unit 7) reads `content/knowledge-base/*.md` and passes the
 * raw text in here.
 *
 * - Minimal in-house frontmatter parser (no gray-matter dependency): a
 *   `---\nkey: value\n---` block at the top, with `title`/`lang`/`url?`/
 *   `draft?` fields. `draft: true` skips the whole file.
 * - Any `##`/`###` section whose text contains the literal token
 *   `TODO(owner)` is removed from the returned body and reported in
 *   `excludedSections` — it must never reach the embeddings/documents table.
 */

const HEADING_RE = /^(#{2,3})\s+(.+)$/;
const DEFAULT_HEADING = "Introducción";
const TODO_TOKEN_RE = /TODO\(owner\)/;

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

/** Exact, case-sensitive match of the `TODO(owner)` convention token. Does
 * NOT match the common Spanish word "todo" — only the parenthesised tag. */
export function containsTodoToken(text) {
  return TODO_TOKEN_RE.test(text);
}

function parseScalarValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  const quoted = value.match(/^["'](.*)["']$/);
  return quoted ? quoted[1] : value;
}

/** @param {string} raw */
export function parseFrontmatter(raw) {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return { data: {}, body: raw };

  const [, frontmatterBlock, body] = match;
  const data = {};
  for (const line of frontmatterBlock.split("\n")) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    data[key] = parseScalarValue(rawValue.trim());
  }
  return { data, body };
}

/** Splits the body into heading sections (preserving the heading markup line
 * so a cleaned body can be reconstructed with valid markdown headings). */
function splitBodyIntoSections(body) {
  const lines = body.split("\n");
  const sections = [];
  let current = { heading: DEFAULT_HEADING, headingLine: null, lines: [] };

  for (const line of lines) {
    const match = line.match(HEADING_RE);
    if (match) {
      sections.push(current);
      current = { heading: match[2].trim(), headingLine: line, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);

  return sections;
}

/** Removes any section whose full text matches TODO_TOKEN_RE; reconstructs
 * the remaining body with headings intact; reports excluded headings. */
function stripTodoSections(body) {
  const sections = splitBodyIntoSections(body);
  const kept = [];
  const excludedSections = [];

  for (const section of sections) {
    const sectionText = [section.headingLine, ...section.lines].filter(Boolean).join("\n");
    if (containsTodoToken(sectionText)) {
      excludedSections.push(section.heading);
      continue;
    }
    kept.push(section);
  }

  const cleanBody = kept
    .map((section) => [section.headingLine, ...section.lines].filter((l) => l !== null).join("\n"))
    .join("\n")
    .trim();

  return { body: cleanBody, excludedSections };
}

/**
 * @param {string} raw
 * @param {{ filePath?: string }} [options]
 * @returns {{ skip: boolean, reason?: string, filePath: string, title: string, lang: string, url: string|null, body: string, excludedSections: string[] }}
 */
export function parseCuratedFile(raw, { filePath = "" } = {}) {
  const { data, body } = parseFrontmatter(raw);
  const title = data.title ?? "Untitled";
  const lang = data.lang ?? "es";
  const url = data.url ?? null;

  if (data.draft === true) {
    return { skip: true, reason: "draft", filePath, title, lang, url, body: "", excludedSections: [] };
  }

  const { body: cleanBody, excludedSections } = stripTodoSections(body);

  return { skip: false, filePath, title, lang, url, body: cleanBody, excludedSections };
}
