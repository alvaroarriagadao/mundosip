import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Los renders/imágenes vivirán en Cloudinary (fase 2); la DB solo guarda URLs
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
