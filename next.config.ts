import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
