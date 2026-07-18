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

  // Compress responses
  compress: true,

  // Experimental features for performance
  experimental: {
    // Optimize package imports for commonly used icon libraries
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  
  // Custom HTTP Security Headers
  async headers() {
    return [
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
