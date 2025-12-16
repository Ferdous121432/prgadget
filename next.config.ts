import type { NextConfig } from "next";

let nextConfig: NextConfig = {
  // Enable compression
  compress: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "5gvtqd14y1.ufs.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.ufs.sh",
        pathname: "/**",
      },
    ],
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tabler/icons-react",
      "recharts",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-menubar",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-label",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-separator",
      "@radix-ui/react-switch",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "embla-carousel-react",
      "@tanstack/react-table",
      "@stripe/react-stripe-js",
      "sonner",
      "react-icons",
    ],
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Modularize imports for better tree-shaking
  modularizeImports: {
    "react-icons/?(((\\w*)?/?)*)": {
      transform: "react-icons/{{ matches.[1] }}/{{member}}",
    },
  },

  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(js|css)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

// Only add bundle analyzer when ANALYZE is true
if (process.env.ANALYZE === "true") {
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: true,
  });
  nextConfig = withBundleAnalyzer(nextConfig);
}

export default nextConfig;
