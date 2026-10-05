/**
 * useIdleOrInteraction Hook
 * @module shared/hooks
 *
 * Returns `false` during SSR and the first client render, then flips to
 * `true` once the browser goes idle (via `scheduleIdle`, up to
 * `timeoutMs`) OR the user's first `pointerdown`/`keydown`/`scroll`,
 * whichever happens first. Used to gate mounting deferred widgets
 * (`DeferredExpertAssistant`, design.md D6) so they never compete with
 * the critical rendering path (SDD `landing-main-thread-tbt`, slice
 * S2a/S2b).
 */
import { useEffect, useState } from "react";

import { scheduleIdle } from "@shared/utils/scheduleIdle";

const INTERACTION_EVENTS = ["pointerdown", "keydown", "scroll"] as const;

export function useIdleOrInteraction(timeoutMs?: number): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    let settled = false;
    const markReady = () => {
      if (settled) return;
      settled = true;
      setReady(true);
    };

    const cancelIdle = scheduleIdle(markReady, { timeout: timeoutMs });

    INTERACTION_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markReady, {
        once: true,
        passive: true,
      });
    });

    return () => {
      cancelIdle();
      INTERACTION_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, markReady);
      });
    };
  }, [ready, timeoutMs]);

  return ready;
}
