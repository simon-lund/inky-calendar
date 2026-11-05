import type { NextConfig } from "next";

// INKY_DEMO=1 builds a static demo for ui.simon-lund.com: example events, drawings kept in the
// browser, served under BASE_PATH. pageExtensions leaves the API routes (route.ts) out of it.
const demo = process.env.INKY_DEMO === "1";

const nextConfig: NextConfig = demo
  ? {
      output: "export",
      trailingSlash: true,
      basePath: process.env.BASE_PATH || undefined,
      pageExtensions: ["tsx"],
      env: { NEXT_PUBLIC_INKY_DEMO: "1" },
    }
  : {};

export default nextConfig;
