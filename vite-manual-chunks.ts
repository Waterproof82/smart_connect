// Pure, dependency-free helpers for Rollup's `output.manualChunks`.
// Kept at the repo root, alongside vite-plugin-md-negotiation.ts, so it can
// be imported both by vite.config.ts and by Jest without going through the
// Vite runtime.
//
// design.md D7 (sdd/core-web-vitals-perf): the previous manualChunks used
// `id.includes("react")`, a substring check that also matched lucide-react,
// react-router-dom, react-helmet-async, react-hook-form, react-icons, and
// @hookform/resolvers, collapsing them all into vendor-react. This module
// replaces it with exact package-name matching against the LAST
// "/node_modules/" segment in the module id, which also makes pnpm's
// nested ".pnpm/<pkg>@<version>/node_modules/<pkg>/..." ids resolve to the
// real package name.
//
// vendor-recharts is intentionally NOT handled here: it is admin-only and
// its dependency closure (react-redux, d3-*) is not leaf-closed, so pulling
// it into its own vendor chunk risks circular chunk imports. Rollup keeps
// it co-located with its importers in the lazy admin chunk instead.

const NODE_MODULES_MARKER = "/node_modules/";

const VENDOR_REACT_PACKAGES = new Set(["react", "react-dom", "scheduler"]);

/**
 * Extracts the real package name from a Rollup/Vite module id.
 * Returns `undefined` when the id has no node_modules segment (app source).
 */
export function packageNameFromId(id: string): string | undefined {
  const normalized = id.replace(/\\/g, "/");
  const markerIndex = normalized.lastIndexOf(NODE_MODULES_MARKER);
  if (markerIndex === -1) return undefined;

  const rest = normalized.slice(markerIndex + NODE_MODULES_MARKER.length);
  const [first, second] = rest.split("/");
  if (!first) return undefined;

  if (first.startsWith("@") && second) {
    return `${first}/${second}`;
  }
  return first;
}

/**
 * Rollup `output.manualChunks` callback: returns the vendor chunk name for
 * a module id, or `undefined` to let Rollup decide (co-locate with
 * importers).
 */
export function vendorChunkFor(id: string): string | undefined {
  const pkg = packageNameFromId(id);
  if (!pkg) return undefined;

  if (VENDOR_REACT_PACKAGES.has(pkg)) return "vendor-react";
  if (pkg.startsWith("@supabase/")) return "vendor-supabase";
  if (pkg === "lucide-react") return "vendor-lucide";
  return undefined;
}
