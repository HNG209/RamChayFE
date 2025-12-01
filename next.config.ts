import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Add 100 to configured qualities to allow Image components using quality=100
    // Next will warn if the quality used isn't present in this array.
    qualities: [100, 70, 70, 70, 70, 75],
  },
};

export default nextConfig;
