/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: false },
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
  async redirects() {
    return [
      { source: '/shop-1', destination: '/', permanent: true },
      { source: '/shop-7', destination: '/', permanent: true },
      { source: '/shop-9', destination: '/', permanent: true },
      { source: '/shop-18', destination: '/', permanent: true },
      // Agregá acá las demás URLs que saques de Google Search Console:
      // { source: '/shop-2', destination: '/', permanent: true },
      // { source: '/shop-3', destination: '/', permanent: true },
      // { source: '/shop-4', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
