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
      { source: '/shop-1', destination: '/?categoria=lentes-de-sol#catalogo', permanent: true },
      { source: '/shop-7', destination: '/', permanent: true }, // sin stock
      { source: '/shop-9', destination: '/?categoria=armazones-de-receta&marcas=Di+Verona#catalogo', permanent: true },
      { source: '/shop-18', destination: '/?marcas=Sunoptic#catalogo', permanent: true },
      // Placeholders para mapeo de Search Console:
      // { source: '/shop-2', destination: '/', permanent: true },
      // { source: '/shop-3', destination: '/', permanent: true },
      // { source: '/shop-4', destination: '/', permanent: true },
      // { source: '/shop-5', destination: '/', permanent: true },
      // { source: '/shop-6', destination: '/', permanent: true },
      // { source: '/shop-8', destination: '/', permanent: true },
      // { source: '/shop-10', destination: '/', permanent: true },
      // { source: '/shop-11', destination: '/', permanent: true },
      // { source: '/shop-12', destination: '/', permanent: true },
      // { source: '/shop-13', destination: '/', permanent: true },
      // { source: '/shop-14', destination: '/', permanent: true },
      // { source: '/shop-15', destination: '/', permanent: true },
      // { source: '/shop-16', destination: '/', permanent: true },
      // { source: '/shop-17', destination: '/', permanent: true },
      // { source: '/shop-19', destination: '/', permanent: true },
      // { source: '/shop-20', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
