"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "festi-cookie-consent";

export function CookieConsent() {
  // `null` = not yet determined (avoids a flash before we read storage).
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Defer one tick so the enter transition plays.
        const t = setTimeout(() => setVisible(true), 400);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ accepted: true, at: Date.now() }),
      );
    } catch {
      // Ignore storage errors (e.g. private mode); banner just won't persist.
    }
    setVisible(false);
  };

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
      className={`fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="flex w-full max-w-3xl flex-col gap-4 rounded-xl border border-border bg-card/95 p-5 shadow-2xl shadow-black/40 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use only essential cookies needed to keep you signed in and to keep
          Festi secure. See our{" "}
          <Link href="/privacy" className="text-red-500 hover:text-red-400">
            Privacy Policy
          </Link>
          .
        </p>
        <Button
          onClick={accept}
          className="w-full shrink-0 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 sm:w-auto"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
