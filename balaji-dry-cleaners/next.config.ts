import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/whatsapp",
        destination: "https://wa.me/918005817455",
        permanent: false,
      },
      {
        source: "/wa",
        destination: "https://wa.me/918005817455",
        permanent: false,
      },
      {
        source: "/map",
        destination: "https://maps.app.goo.gl/QJjveVxXsVUa8yF78",
        permanent: false,
      },
      {
        source: "/location",
        destination: "https://maps.app.goo.gl/QJjveVxXsVUa8yF78",
        permanent: false,
      },
      {
        source: "/ampledia",
        destination: "https://www.instagram.com/ampledia.in/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
