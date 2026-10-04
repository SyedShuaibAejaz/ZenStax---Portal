import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  serverExternalPackages: ["@react-pdf/renderer"],
  // The PDF templates read the logo and fonts from /public with fs at runtime.
  // Vercel functions don't include /public unless it is traced in explicitly.
  outputFileTracingIncludes: {
    "/api/invoices/**": ["./public/**/*"],
    "/api/quotations/**": ["./public/**/*"],
    "/api/credit-notes/**": ["./public/**/*"],
  },
};

export default nextConfig;
