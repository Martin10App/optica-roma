import type { Metadata } from 'next';
import TestVision from '@/components/test-vision/TestVision';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Test de visión online gratis | Óptica Roma',
  description:
    'Probá tu vista en 4 minutos desde el celular o la computadora: de lejos, de cerca, astigmatismo, rejilla de Amsler y contraste, con una explicación según tu edad (presbicia, miopía, hipermetropía). Orientativo, no reemplaza al oftalmólogo.',
  alternates: { canonical: `${SITE_URL}/test-de-vision` },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-papel px-4 pb-20 pt-[104px] sm:px-6 md:pt-[120px]">
      <TestVision />
    </div>
  );
}
