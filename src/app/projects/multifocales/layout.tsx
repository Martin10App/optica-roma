import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cristales Multifocales | Óptica Roma',
  description: 'Visión natural a todas las distancias, sin saltos de imagen ni líneas visibles. Redescubrí el placer de ver bien sin cambiar de lentes.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
