/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@placementhub/shared-types",
    "@placementhub/utils",
    "@placementhub/auth",
  ],

  async rewrites() {
    return [
      // Proxy auth requests to API
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/auth/:path*`,
      },
      // Proxy other API requests
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
