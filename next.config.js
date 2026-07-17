/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Serve the SLEEQUE site at the root of the domain.
  // (No pages/index.js exists, so "/" falls through to this rewrite.)
  async rewrites() {
    return [{ source: "/", destination: "/home.html" }];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Allows embedding on your own domains if you ever iframe it.
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://sleeque.com https://*.sleeque.com;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
