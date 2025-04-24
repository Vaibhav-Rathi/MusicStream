import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  },
};

export default nextConfig;