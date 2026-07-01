import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Colección Natalia Oreiro | Óptica Roma',
  description: 'Descubrí la colección exclusiva de gafas y armazones de Natalia Oreiro. Diseño único y elegancia para tu mirada.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
