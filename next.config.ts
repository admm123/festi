import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

// Enables the Cloudflare bindings/env locally when running `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
