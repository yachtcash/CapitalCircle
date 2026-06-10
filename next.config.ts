import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // SVG placeholders live under /opportunities and /companies. Next.js
    // disables SVG by default; allow them with a strict CSP so external SVGs
    // can't execute scripts. (All SVGs here are statically authored.)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Real photos come from Loremflickr (Flickr Creative Commons proxy
    // widely used for development/demo work). It serves a 302 redirect to
    // Flickr's static CDN, so we have to allow both hostnames.
    remotePatterns: [
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "live.staticflickr.com" },
    ],
  },
};

export default nextConfig;
