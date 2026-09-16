import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/cart/CartDrawer";
import AnimacionesScroll from "@/components/layout/AnimacionesScroll";

// Archivo variable con el eje de ancho: los títulos usan una versión un poco
// más ancha (clase .titular) y el texto corrido la normal.
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
  variable: "--font-archivo",
});

import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Óptica Roma | Tu visión es nuestra prioridad",
  description:
    "Encontrá los mejores armazones y cristales en Óptica Roma. Visitanos en Las Piedras y Canelones. Atención personalizada, taller propio y trámite de BPS en el local.",
  keywords: [
    "óptica",
    "lentes",
    "armazones",
    "cristales",
    "Varilux",
    "multifocales",
    "Las Piedras",
    "Canelones",
    "Uruguay",
    "lentes de sol",
    "subsidio BPS",
  ],
  openGraph: {
    title: "Óptica Roma | Tu visión es nuestra prioridad",
    description:
      "Encontrá los mejores armazones y cristales en Óptica Roma. Visitanos en Las Piedras y Canelones. Atención personalizada y calidad profesional.",
    url: SITE_URL,
    siteName: "Óptica Roma",
    images: [
      {
        url: `${SITE_URL}/media/local/vidriera-las-piedras.jpg`,
        width: 720,
        height: 900,
        alt: "Vidriera de Óptica Roma frente a la plaza de Las Piedras",
      },
    ],
    locale: "es_UY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Óptica Roma | Tu visión es nuestra prioridad",
    description:
      "Encontrá los mejores armazones y cristales en Óptica Roma. Visitanos en Las Piedras y Canelones.",
    images: ["/media/local/vidriera-las-piedras.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Se sacó el Google Analytics: tenía el ID de ejemplo (G-XXXXXXXXXX), así que
    // descargaba el script en cada visita sin medir nada. Si se crea una cuenta
    // real, se vuelve a agregar con el ID verdadero.
    <html lang="es" className={archivo.variable}>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        {/* Schema.org LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Optician",
              name: "Óptica Roma",
              image: `${SITE_URL}/media/logooptica.png`,
              url: SITE_URL,
              telephone: "+59823641800",
              priceRange: "$$",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "42"
              },
              department: [
                {
                  "@type": "Optician",
                  name: "Óptica Roma - Las Piedras",
                  telephone: "+59823641800",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "Rivera 617",
                    addressLocality: "Las Piedras",
                    addressRegion: "Canelones",
                    addressCountry: "UY",
                  },
                },
                {
                  "@type": "Optician",
                  name: "Óptica Roma - Canelones",
                  telephone: "+59843339869",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "Enrique Rodó 319",
                    addressLocality: "Canelones",
                    addressRegion: "Canelones",
                    addressCountry: "UY",
                  },
                }
              ],
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                  ],
                  opens: "09:00",
                  closes: "18:30",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Saturday",
                  opens: "09:00",
                  closes: "13:00",
                },
              ],
              geo: [
                {
                  "@type": "GeoCoordinates",
                  latitude: "-34.7446",
                  longitude: "-56.2224",
                },
                {
                  "@type": "GeoCoordinates",
                  latitude: "-34.5469",
                  longitude: "-56.2819",
                },
              ],
              sameAs: [
                "https://instagram.com/opticaromalaspiedras",
                "https://facebook.com/RomaLasPiedras",
              ],
            }),
          }}
        />
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <WhatsAppButton />
            <CartDrawer />
            <AnimacionesScroll />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
