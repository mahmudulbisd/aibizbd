import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native/server-only drivers out of the serverless bundle.
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
