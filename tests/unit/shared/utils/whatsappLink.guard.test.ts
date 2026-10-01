import fs from "node:fs";
import path from "node:path";

// design.md § CTA voice: every WhatsApp URL is built by buildWhatsappLink().
// A hand-built `https://wa.me/${...}` skips the digits-only sanitising, the
// pre-filled message and the /#contacto fallback.
const SRC = path.resolve(__dirname, "../../../../src");
const ALLOWED = new Set([path.join(SRC, "shared/utils/whatsappLink.ts")]);

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "__tests__" ? [] : walk(full);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe("WhatsApp links", () => {
  it("are never hand-built outside buildWhatsappLink", () => {
    const offenders = walk(SRC).filter(
      (file) => !ALLOWED.has(file) && /`https:\/\/wa\.me\/\$\{/.test(fs.readFileSync(file, "utf-8")),
    );
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([]);
  });
});
