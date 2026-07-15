import Link from "next/link";

const LINKS = [
  { href: "/imprint", label: "Imprint" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={`flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:justify-between ${className ?? ""}`}
    >
      <p>&copy; {new Date().getFullYear()} Festi</p>
      <nav className="flex items-center gap-4">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
