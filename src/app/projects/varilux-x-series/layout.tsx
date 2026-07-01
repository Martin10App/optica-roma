import { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Varilux X Series | Óptica Roma';
  const description = 'La revolución definitiva en lentes multifocales premium. Capturá cada detalle al alcance de tus brazos con absoluta naturalidad y precisión.';
  const url = `${SITE_URL}/projects/varilux-x-series`;
  const image = `${SITE_URL}/media/varilux-1.jpg`;
  
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
