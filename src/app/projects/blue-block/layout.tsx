import { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';

const title = 'Filtro Azul (Blue Block) | Óptica Roma';
const description = 'Protegé tus ojos de la luz azul de las pantallas. Cristales con tecnología Blue Block que reducen la fatiga visual y mejoran el descanso.';
const url = `${SITE_URL}/projects/blue-block`;
const image = `${SITE_URL}/media/video-poster.jpg`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
