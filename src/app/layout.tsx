import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/cart/CartDrawer";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Óptica Roma | Tu visión es nuestra prioridad",
  description:
    "Encontrá los mejores armazones y cristales en Óptica Roma. Visitanos en Las Piedras y Canelones. Atención personalizada, revisión visual gratuita y calidad profesional.",
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
    "revisión visual",
    "chequeo de ojos",
  ],
  openGraph: {
    title: "Óptica Roma | Tu visión es nuestra prioridad",
    description:
      "Encontrá los mejores armazones y cristales en Óptica Roma. Visitanos en Las Piedras y Canelones. Atención personalizada y calidad profesional.",
    url: SITE_URL,
    siteName: "Óptica Roma",
    images: [
      {
        url: `${SITE_URL}/media/expositor-armazoens2.png`,
        width: 1200,
        height: 630,
        alt: "Óptica Roma - Interior del local",
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
    images: ["/media/expositor-armazoens2.png"],
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
    <html lang="es" className="scroll-smooth">
      <head>
        {/* Google Analytics — Reemplazar G-XXXXXXXXXX con tu ID real */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body
        className={`${inter.variable} antialiased min-h-screen flex flex-col font-sans`}
      >
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
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
