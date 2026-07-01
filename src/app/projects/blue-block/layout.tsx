import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtro Azul (Blue Block) | Óptica Roma',
  description: 'Protegé tus ojos de la luz azul de las pantallas. Cristales con tecnología Blue Block que reducen la fatiga visual y mejoran el descanso.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
