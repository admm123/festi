"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { PostImageInfo } from "../types";

type ImageLightboxProps = {
  images: PostImageInfo[];
  index: number | null;
  title: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

/** Fullscreen image viewer with prev/next navigation and keyboard support. */
export function ImageLightbox({
  images,
  index,
  title,
  onIndexChange,
  onClose,
}: ImageLightboxProps) {
  const open = index !== null;
  const count = images.length;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + count) % count);
    },
    [index, count, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const current = index !== null ? images[index] : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton
        className="max-w-3xl border-0 bg-transparent p-0 ring-0 sm:max-w-3xl"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {current && (
          <div className="relative flex items-center justify-center">
            {/* biome-ignore lint/performance/noImgElement: R2 URLs, not optimized */}
            <img
              src={current.url}
              alt={title}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-2 flex size-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                >
                  <ChevronLeftIcon className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-2 flex size-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                >
                  <ChevronRightIcon className="size-6" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                  {(index ?? 0) + 1} / {count}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
