import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enforce strict React mode for catching issues early
  reactStrictMode: true,

  // Optimize production bundles
  compiler: {
    // Remove console.log in production (keep console.error/warn)
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // Image optimization configuration
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Security: prevent hotlinking from unknown origins
    dangerouslyAllowSVG: false,
  },

  // Security: prevent exposing the X-Powered-By header
  poweredByHeader: false,

  // Compress responses (gzip/brotli)
  compress: true,

  // Experimental features for performance
  experimental: {
    // Optimize package imports — tree-shake barrel exports
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-accordion",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "class-variance-authority",
    ],
    // Client-side router cache — keep prefetched data fresh
    staleTimes: {
      dynamic: 30,  // seconds — dynamic routes stay cached 30s
      static: 180,  // seconds — static routes stay cached 3 min
    },
  },
  
  // Custom HTTP Security & Performance Headers
  async headers() {
    return [
      {
        // Static assets (favicons, manifests, fonts) — cache for 1 year
        source: "/:path(.+\\.(?:ico|png|svg|woff2?)$)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
