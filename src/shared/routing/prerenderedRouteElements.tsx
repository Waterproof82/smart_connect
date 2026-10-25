import type { ComponentType, ReactElement } from "react";
import { Route } from "react-router-dom";
import { PRERENDERED_PATHS, type PrerenderedPath } from "./prerenderedRoutes";

/**
 * Exhaustive per-entry page map (design.md shared-app-shell). Each entry
 * (server, client) builds its own `PageMap` — omitting a `PrerenderedPath`
 * key fails `tsc` on the `Record` assignment.
 */
export type PageMap = Readonly<Record<PrerenderedPath, ComponentType>>;

/**
 * Turns a `PageMap` into the `<Route>` elements both entries render inside
 * their `<Routes>`. One helper, one list (`PRERENDERED_PATHS`) — so the
 * route table itself can never drift between entry-server.tsx and
 * entry-client.tsx the way two hand-copied `<Routes>` blocks could.
 */
export function prerenderedRouteElements(pages: PageMap): ReactElement[] {
  return PRERENDERED_PATHS.map((path) => {
    const Component = pages[path];
    return <Route key={path} path={path} element={<Component />} />;
  });
}
