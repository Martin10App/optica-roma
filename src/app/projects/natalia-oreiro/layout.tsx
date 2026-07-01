import { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Colección Natalia Oreiro | Óptica Roma';
  const description = 'Descubrí la colección exclusiva de gafas y armazones de Natalia Oreiro. Diseño único y elegancia para tu mirada.';
  const url = `${SITE_URL}/projects/natalia-oreiro`;
  const image = `${SITE_URL}/media/armazones-natalia-oreiro.jpeg`;
  
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
