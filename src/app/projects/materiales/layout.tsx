import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Materiales de Cristales | Óptica Roma',
  description: 'Conocé nuestra gama de materiales: CR-39, Policarbonato y Alto Índice. Hacemos tus lentes más estéticos y livianos, sea cual sea tu graduación.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
