import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Festi - Your Hardstyle Festival Planner",
  description:
    "Plan your festival season, connect with ravers, and never miss a beat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${raleway.variable} h-full antialiased`}>
      <body className="min-h-screen bg-background text-foreground font-[family-name:var(--font-raleway)]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
