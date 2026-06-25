import type { NextConfig } from "next";

// Collect allowed dev origins from env or use wildcard pattern for space-z.ai previews
const devOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(",")
  : [];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  allowedDevOrigins: [...devOrigins, '.monkeycode-ai.online'],
};

export default nextConfig;
