/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: false },
  async rewrites() {
    return [
      {
        // Agenda del consultorio (página privada del médico)
        source: '/consultorio',
        destination: '/consultorio.html',
      },
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
  async headers() {
    return [
      {
        // Permite que el portal Rabaquino (GitHub Pages) llame a esta API
        // sin importar si se accede via opticaroma.store/pedidos o el link directo de GitHub Pages.
        source: '/api/rabaquino/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
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
