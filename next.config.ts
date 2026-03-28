import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: "/shop", destination: "/", permanent: true },
      { source: "/shop/cart", destination: "/cart", permanent: true },
      {
        source: "/shop/products/:id",
        destination: "/products/:id",
        permanent: true,
      },
      { source: "/shop/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
