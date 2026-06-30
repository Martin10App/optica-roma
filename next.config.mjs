/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: false },
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/pedidos',
        destination: 'https://martin10app.github.io/pedidosrabaquino/',
      },
      {
        source: '/pedidos/:path*',
        destination: 'https://martin10app.github.io/pedidosrabaquino/:path*',
      },
    ];
  },
};

export default nextConfig;
