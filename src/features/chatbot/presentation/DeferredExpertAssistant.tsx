/**
 * DeferredExpertAssistant
 * @module features/chatbot/presentation
 *
 * Defers mounting the global chat widget — and the `useWhatsappPhone`
 * read it now performs (D7) — until the browser is idle or the user
 * first interacts with the page (`useIdleOrInteraction`). Renders `null`
 * during SSR and the first client render, so there is no hydration
 * mismatch (#421) and no SSR markup change. The FAB is `position:fixed`,
 * so mounting it later causes no CLS.
 *
 * Also listens for `OPEN_ASSISTANT_EVENT` directly (independent of
 * `ExpertAssistant`'s own listener, which only exists once it is
 * mounted): if "Pruébalo ahora" is clicked before idle/interaction, the
 * widget mounts immediately, already open (`initialOpen`), instead of
 * the event being lost.
 *
 * Idle-mount is additionally gated on `useAppStylesheetApplied`
 * (font-stability PR3, design.md D4): the FAB is `position: fixed`, so
 * mounting it before the deferred app stylesheet has applied would
 * render it in normal flow first, then snap to fixed (CLS). The
 * `openedEarly` (user-initiated) path bypasses this gate — user input is
 * excluded from CLS scoring (`hadRecentInput`).
 *
 * See design.md D6 — SDD `landing-main-thread-tbt`, slice S2b.
 */
import React, { useEffect, useState } from "react";

import { useAppStylesheetApplied } from "@shared/hooks/useAppStylesheetApplied";
import { useIdleOrInteraction } from "@shared/hooks/useIdleOrInteraction";

import { ExpertAssistant, OPEN_ASSISTANT_EVENT } from "./ExpertAssistantWithRAG";

export const DeferredExpertAssistant: React.FC = () => {
  const idleOrInteracted = useIdleOrInteraction();
  const stylesheetApplied = useAppStylesheetApplied();
  const [openedEarly, setOpenedEarly] = useState(false);

  const readyToMount = (idleOrInteracted && stylesheetApplied) || openedEarly;

  useEffect(() => {
    // Once mounted (idle/interaction + stylesheet already happened, or the
    // event below already fired once), ExpertAssistant's own listener
    // takes over.
    if (readyToMount) return;

    const handleOpen = () => setOpenedEarly(true);
    globalThis.addEventListener(OPEN_ASSISTANT_EVENT, handleOpen);
    return () => globalThis.removeEventListener(OPEN_ASSISTANT_EVENT, handleOpen);
  }, [readyToMount]);

  if (!readyToMount) return null;

  return <ExpertAssistant initialOpen={openedEarly} />;
};

export default DeferredExpertAssistant;
