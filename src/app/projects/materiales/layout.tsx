import { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Materiales de Cristales | Óptica Roma';
  const description = 'Conocé nuestra gama de materiales: CR-39, Policarbonato y Alto Índice. Hacemos tus lentes más estéticos y livianos, sea cual sea tu graduación.';
  const url = `${SITE_URL}/projects/materiales`;
  const image = `${SITE_URL}/media/expositor-de-armazones.png`;
  
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
