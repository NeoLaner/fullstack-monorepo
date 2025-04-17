/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: ["@neolaner/ui"],
  reactStrictMode: false,
  // output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  experimental: {
    authInterrupts: true,
    taint: true,
  },

  async redirects() {
    return [
      // Basic redirect
      {
        source: "/auth",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wallpapers.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "justposters.com.au",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "variety.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default config;
