import type { ReactNode } from "react";

export function FestiThemeRoot({ children }: { children?: ReactNode }) {
  return (
    <div
      className="bg-background text-foreground font-sans"
      style={{ padding: "1.5rem", borderRadius: "0.75rem" }}
    >
      {children}
    </div>
  );
}
