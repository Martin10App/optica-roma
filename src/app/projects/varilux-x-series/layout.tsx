import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Varilux X Series | Óptica Roma',
  description: 'La revolución definitiva en lentes multifocales premium. Capturá cada detalle al alcance de tus brazos con absoluta naturalidad y precisión.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
