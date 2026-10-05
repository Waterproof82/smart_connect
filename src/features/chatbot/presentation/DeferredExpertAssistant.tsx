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
 * See design.md D6 — SDD `landing-main-thread-tbt`, slice S2b.
 */
import React, { useEffect, useState } from "react";

import { useIdleOrInteraction } from "@shared/hooks/useIdleOrInteraction";

import { ExpertAssistant, OPEN_ASSISTANT_EVENT } from "./ExpertAssistantWithRAG";

export const DeferredExpertAssistant: React.FC = () => {
  const idleOrInteracted = useIdleOrInteraction();
  const [openedEarly, setOpenedEarly] = useState(false);

  useEffect(() => {
    // Once mounted (idle/interaction already happened, or the event below
    // already fired once), ExpertAssistant's own listener takes over.
    if (idleOrInteracted || openedEarly) return;

    const handleOpen = () => setOpenedEarly(true);
    globalThis.addEventListener(OPEN_ASSISTANT_EVENT, handleOpen);
    return () => globalThis.removeEventListener(OPEN_ASSISTANT_EVENT, handleOpen);
  }, [idleOrInteracted, openedEarly]);

  if (!idleOrInteracted && !openedEarly) return null;

  return <ExpertAssistant initialOpen={openedEarly} />;
};

export default DeferredExpertAssistant;
