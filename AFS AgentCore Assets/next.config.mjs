/** @type {import('next').NextConfig} */
const nextConfig = {
  // mcp-handler runs on the Node.js runtime (uses Buffer/crypto), not Edge.
  experimental: {
    serverComponentsExternalPackages: ["mcp-handler"],
  },
};

export default nextConfig;
