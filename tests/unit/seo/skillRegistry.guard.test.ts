import fs from "node:fs";
import path from "node:path";

// S3 (seo-audit-followups): guards `.atl/skill-registry.md` against ever
// recommending the retired `Review`/`AggregateRating`/`HowTo` JSON-LD again
// without the "retired"/deleted" framing. Mirrors the structured-data-policy
// guard in tests/unit/seo/structuredDataPolicy.test.ts, but for project
// documentation instead of src/.

const ROOT = path.resolve(__dirname, "../../../");
const REGISTRY_PATH = path.join(ROOT, ".atl/skill-registry.md");

// Capital-letter schema-type mentions only (word boundary at the start so
// it still matches "ReviewSchema"/"HowToSchema"). This deliberately does
// NOT match lowercase "review" used in its ordinary English sense (code
// review, PR review) elsewhere in the registry.
const SCHEMA_TYPE_MENTION = /\b(Review|AggregateRating|HowTo)/;
const RETIREMENT_LANGUAGE = /\bretired\b|\bdeleted\b|\bNo\b|\bNOT\b/;

describe("skill-registry guard — Review/AggregateRating/HowTo never recommended live", () => {
  it(".atl/skill-registry.md exists", () => {
    expect(fs.existsSync(REGISTRY_PATH)).toBe(true);
  });

  it("every line naming Review, AggregateRating or HowTo also carries retired/deleted/No/NOT", () => {
    const content = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const lines = content.split("\n");

    const offenders: { line: number; text: string }[] = [];
    lines.forEach((lineText, index) => {
      if (SCHEMA_TYPE_MENTION.test(lineText) && !RETIREMENT_LANGUAGE.test(lineText)) {
        offenders.push({ line: index + 1, text: lineText.trim() });
      }
    });

    expect(offenders).toEqual([]);
  });

  it("sanity check: the registry actually mentions Review/HowTo at least once (the guard is not vacuous)", () => {
    const content = fs.readFileSync(REGISTRY_PATH, "utf-8");
    expect(SCHEMA_TYPE_MENTION.test(content)).toBe(true);
  });
});
