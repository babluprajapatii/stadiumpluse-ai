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
};

export default nextConfig;
