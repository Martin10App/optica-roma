import { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Cristales Multifocales | Óptica Roma';
  const description = 'Visión natural a todas las distancias, sin saltos de imagen ni líneas visibles. Redescubrí el placer de ver bien sin cambiar de lentes.';
  const url = `${SITE_URL}/projects/multifocales`;
  const image = `${SITE_URL}/media/promo-varilux.png`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    }
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
