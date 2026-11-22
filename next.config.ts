import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Keep the Mongo driver / Better Auth on Node's runtime so `dns.setServers`
  // (Atlas SRV) works the same way as the Express server. Bundling them breaks
  // SRV lookups with querySrv ECONNREFUSED.
  serverExternalPackages: ["mongodb"],
  images: {
    // Service cover images are uploaded to ImgBB by the backend and stored as
    // absolute URLs (`https://i.ibb.co/...`). Without this allow-list,
    // next/image rejects them and every card/detail image fails to render.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
