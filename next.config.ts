import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma + the pg driver out of the server bundle so workerd resolves
  // their Cloudflare-specific exports (e.g. pg-cloudflare) at runtime instead
  // of esbuild trying (and failing) to bundle them.
  serverExternalPackages: [
    "@prisma/client",
    ".prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "pg-cloudflare",
  ],
};

export default nextConfig;

// Enables the Cloudflare bindings/env locally when running `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
