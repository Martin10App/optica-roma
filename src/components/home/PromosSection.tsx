import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { formatearPrecio } from '@/lib/catalogoTipos';
import EncabezadoSeccion from './EncabezadoSeccion';

const WHATSAPP = 'https://wa.me/598098871673?text=';

type Promo = {
  etiqueta: string;
  titulo: string;
  precio?: number;
  foto: string;
  fotoAlt: string;
  incluye: string[];
  nota: string;
  mensaje: string;
  link?: { texto: string; href: string };
};

const PROMOS: Promo[] = [
  {
    etiqueta: 'Armazón y cristales',
    titulo: 'Armazón Ninety con cristales monofocales y antirreflejo',
    precio: 4900,
    foto: '/media/promo-ninety-web.jpg',
    fotoAlt: 'Armazones de la colección Ninety',
    incluye: [
      'Armazón de la colección Ninety (modelos seleccionados)',
      'Cristales monofocales de índice 1.56 con antirreflejo',
      'Armado en nuestro taller',
      'Garantía de adaptación de 30 días',
    ],
    nota: 'Traé la receta de tu médico con la graduación.',
    mensaje: 'Hola! Quiero consultar por la promo de $4.900: armazón Ninety con cristales monofocales.',
    link: { texto: 'Ver armazones Ninety', href: '/catalogo/armazones-de-receta/ninety' },
  },
  {
    etiqueta: 'Varilux',
    titulo: 'Tu segundo par de lentes progresivos, de regalo',
    foto: '/media/promo-varilux-web.jpg',
    fotoAlt: 'Varilux: tu segundo par de lentes progresivos de regalo',
    incluye: [
      'Cristales progresivos Varilux',
      'Un segundo par de progresivos de regalo',
      'Antirreflejo en los dos pares',
      'Armazón a elección del catálogo',
    ],
    nota: '¿No tenés receta? Te derivamos a un médico oftalmólogo.',
    mensaje: 'Hola! Quiero consultar por la promo Varilux con el segundo par de regalo.',
    link: { texto: 'Conocé Varilux', href: '/projects/varilux-x-series' },
  },
];

export default function PromosSection() {
  return (
    <section id="promociones" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion titulo="Promociones" />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {PROMOS.map((promo, i) => (
            <article
              key={promo.titulo}
              data-aparecer
              data-aparecer-retraso={i * 120}
              className="flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-linea"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-papel">
                <Image
                  src={promo.foto}
                  alt={promo.fotoAlt}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-8 md:p-10">
                <p className="text-sm font-semibold text-cobalto">{promo.etiqueta}</p>
                <h3 className="titular mt-2 text-2xl text-tinta md:text-[1.75rem]">{promo.titulo}</h3>

                {promo.precio != null && (
                  <p className="mt-5 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tabular-nums tracking-tight text-tinta md:text-5xl">
                      {formatearPrecio(promo.precio)}
                    </span>
                    <span className="text-sm text-pizarra">precio final</span>
                  </p>
                )}

                <ul className="mt-6 space-y-3">
                  {promo.incluye.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] leading-snug text-tinta/85">
                      <Check size={18} strokeWidth={2.25} className="mt-px shrink-0 text-cobalto" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="mt-6 border-t border-linea pt-5 text-[15px] text-pizarra">{promo.nota}</p>

                <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-4 pt-8">
                  <a
                    href={WHATSAPP + encodeURIComponent(promo.mensaje)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Consultar por WhatsApp
                  </a>
                  {promo.link && (
                    <Link href={promo.link.href} className="enlace text-[15px]">
                      {promo.link.texto}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
