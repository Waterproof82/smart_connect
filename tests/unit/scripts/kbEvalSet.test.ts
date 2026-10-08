import fs from "node:fs";
import path from "node:path";

// design.md (rag-knowledge-base-refresh) Unit 8 — scripts/kb/eval-set.json is
// static data (no ESM-import constraint), read directly with fs/JSON.parse.
// Spec `chatbot-rag` "Grounded Answer Evaluation Set": >=15 ES + >=5 EN
// questions, including the 3 mandatory scenarios.

const EVAL_SET_PATH = path.resolve(__dirname, "../../../scripts/kb/eval-set.json");

type Criterion = string | string[];

interface EvalQuestion {
  id: string;
  lang: "es" | "en";
  question: string;
  mustInclude?: Criterion[];
  mustNotInclude?: string[];
}

function loadEvalSet(): EvalQuestion[] {
  return JSON.parse(fs.readFileSync(EVAL_SET_PATH, "utf-8"));
}

describe("scripts/kb/eval-set.json — shape (spec: Grounded Answer Evaluation Set)", () => {
  it("has at least 15 Spanish and 5 English questions", () => {
    const questions = loadEvalSet();
    const es = questions.filter((q) => q.lang === "es");
    const en = questions.filter((q) => q.lang === "en");
    expect(es.length).toBeGreaterThanOrEqual(15);
    expect(en.length).toBeGreaterThanOrEqual(5);
  });

  it("every question has a unique id, non-empty question text, and array criteria", () => {
    const questions = loadEvalSet();
    const ids = new Set<string>();
    for (const q of questions) {
      expect(typeof q.id).toBe("string");
      expect(q.id.length).toBeGreaterThan(0);
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
      expect(["es", "en"]).toContain(q.lang);
      expect(typeof q.question).toBe("string");
      expect(q.question.length).toBeGreaterThan(0);
      expect(Array.isArray(q.mustInclude ?? [])).toBe(true);
      expect(Array.isArray(q.mustNotInclude ?? [])).toBe(true);
    }
  });

  it("mandatory scenario: '¿Hacen páginas web?' confirms yes + custom websites + contact CTA", () => {
    const questions = loadEvalSet();
    const q = questions.find((item) => item.question === "¿Hacen páginas web?");
    expect(q).toBeDefined();
    const flatInclude = (q!.mustInclude ?? []).flat();
    expect(flatInclude.some((s) => /s[ií]/i.test(String(s)))).toBe(true);
    expect(flatInclude.join(" ")).toContain("digitalizatenerife.es/#contacto");
  });

  it("mandatory scenario: '¿Tienen carta digital para tiendas?' confirms yes", () => {
    const questions = loadEvalSet();
    const q = questions.find((item) => item.question === "¿Tienen carta digital para tiendas?");
    expect(q).toBeDefined();
    const flatInclude = (q!.mustInclude ?? []).flat();
    expect(flatInclude.some((s) => /s[ií]/i.test(String(s)))).toBe(true);
  });

  it("mandatory scenario: a privacy question redirects to the footer legal links", () => {
    const questions = loadEvalSet();
    const q = questions.find((item) => /privac|personal data/i.test(item.question));
    expect(q).toBeDefined();
    const flatInclude = (q!.mustInclude ?? []).flat().join(" ");
    expect(flatInclude).toMatch(/legal\/(privacidad|cookies|aviso)/);
  });

  it("every pricing question (web/carta/TPV/chatbot) forbids old fake prices and the old brand", () => {
    const questions = loadEvalSet();
    const pricingQuestions = questions.filter((q) => /cuánto cuesta|how much/i.test(q.question));
    expect(pricingQuestions.length).toBeGreaterThan(0);
    for (const q of pricingQuestions) {
      const forbidden = (q.mustNotInclude ?? []).join(" ");
      expect(forbidden.length).toBeGreaterThan(0);
    }
    const hasOldPriceGuard = pricingQuestions.some((q) => (q.mustNotInclude ?? []).includes("39"));
    expect(hasOldPriceGuard).toBe(true);
  });
});
