import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7 requires the query compiler runtime (WASM) at runtime.
  // Externalizing these packages prevents Next.js from attempting to bundle
  // the WASM modules and keeps the Prisma client outside the server bundle.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
  allowedDevOrigins: ['127.0.0.1'],
  experimental: {
    // Enables the `forbidden()` function and `forbidden.tsx` file for
    // server-side authorization (403) responses.
    authInterrupts: true,
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@tanstack/react-query",
      "@base-ui/react",
      "clsx",
      "tailwind-merge",
    ],
  },
};

export default nextConfig;
