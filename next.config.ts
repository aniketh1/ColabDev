import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
    ],
  },
  // Note: WebContainer requires CORS headers (Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy)
  // but these headers break Next-Auth. We'll use an alternative approach with a separate preview page.
};

export default nextConfig;
