"use client";

import { useEffect } from "react";
import { updatePresence } from "../actions/updatePresence";
import { PRESENCE_HEARTBEAT_INTERVAL_MS } from "../lib/presence";

/**
 * Sends a presence heartbeat on mount and then on an interval, but only while
 * the tab is visible. Pauses when the tab is hidden and fires immediately when
 * it becomes visible again. Renders nothing.
 */
export function PresenceHeartbeat() {
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    const ping = () => {
      void updatePresence();
    };

    const start = () => {
      if (interval) return;
      ping();
      interval = setInterval(ping, PRESENCE_HEARTBEAT_INTERVAL_MS);
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") {
      start();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
