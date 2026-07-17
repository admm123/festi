"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GoBack({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      className={
        "inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm hover:opacity-90 " +
        (className ?? "")
      }
    >
      <ArrowLeft className="size-4" /> Back
    </button>
  );
}
