import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // SVG placeholders live under /opportunities and /companies. Next.js
    // disables SVG by default; allow them with a strict CSP so external SVGs
    // can't execute scripts. (All SVGs here are statically authored.)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
