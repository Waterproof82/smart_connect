/**
 * Pure markdown chunker for the knowledge-base ingestion pipeline (design.md
 * rag-knowledge-base-refresh D11). No fs/Deno/network imports.
 *
 * Splits a markdown body by `##`/`###` headings into one chunk per section,
 * merges sections shorter than MIN_CHUNK_CHARS into a neighbour, splits
 * sections longer than MAX_CHUNK_CHARS by paragraph with an overlap window,
 * drops anything that still ends up under MIN_CHUNK_CHARS, and prefixes the
 * final content of every chunk with `Página: {title} › {section}` so the
 * heading context travels with the embedding text.
 */

export const MIN_CHUNK_CHARS = 80;
export const MAX_CHUNK_CHARS = 1200;
export const OVERLAP_CHARS = 150;

const HEADING_RE = /^(#{2,3})\s+(.+)$/;
const DEFAULT_HEADING = "Introducción";

/** @param {string} markdown */
function splitIntoSections(markdown) {
  const lines = markdown.split("\n");
  const sections = [];
  let current = { heading: DEFAULT_HEADING, lines: [] };

  for (const line of lines) {
    const match = line.match(HEADING_RE);
    if (match) {
      sections.push(current);
      current = { heading: match[2].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);

  return sections
    .map((section) => ({
      heading: section.heading,
      content: section.lines.join("\n").trim(),
    }))
    .filter((section) => section.content.length > 0);
}

/** Merges any section shorter than MIN_CHUNK_CHARS into a neighbour. */
function mergeShortSections(sections) {
  if (sections.length <= 1) return sections;

  const working = sections.map((section) => ({ ...section }));
  const result = [];

  for (let i = 0; i < working.length; i++) {
    const section = working[i];
    if (section.content.length < MIN_CHUNK_CHARS) {
      if (i < working.length - 1) {
        working[i + 1] = {
          heading: working[i + 1].heading,
          content: `${section.content}\n\n${working[i + 1].content}`,
        };
        continue;
      }
      if (result.length > 0) {
        const previous = result.pop();
        result.push({
          heading: previous.heading,
          content: `${previous.content}\n\n${section.content}`,
        });
        continue;
      }
    }
    result.push(section);
  }

  return result;
}

/** Splits long section content by paragraph, with a trailing-char overlap carried into the next part. */
function splitLongSection(content, maxLen, overlap) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  const parts = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > maxLen && current) {
      parts.push(current);
      const overlapText = current.slice(-overlap);
      current = `${overlapText}\n\n${paragraph}`;
    } else {
      current = candidate;
    }
  }
  if (current) parts.push(current);

  return parts;
}

/**
 * @param {string} markdown
 * @param {{ title?: string }} [options]
 * @returns {{ section: string, content: string }[]}
 */
export function chunkMarkdown(markdown, { title = "Untitled" } = {}) {
  const rawSections = splitIntoSections(markdown);
  if (rawSections.length === 0) return [];

  const merged = mergeShortSections(rawSections);

  const expanded = [];
  for (const section of merged) {
    if (section.content.length > MAX_CHUNK_CHARS) {
      for (const part of splitLongSection(section.content, MAX_CHUNK_CHARS, OVERLAP_CHARS)) {
        expanded.push({ heading: section.heading, content: part });
      }
    } else {
      expanded.push(section);
    }
  }

  return expanded
    .filter((section) => section.content.length >= MIN_CHUNK_CHARS)
    .map((section) => ({
      section: section.heading,
      content: `Página: ${title} › ${section.heading}\n\n${section.content}`,
    }));
}
