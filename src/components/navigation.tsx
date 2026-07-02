import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Auth Buttons - Centered */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700"
          >
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
