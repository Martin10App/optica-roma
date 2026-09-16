import { Star } from 'lucide-react';
import EncabezadoSeccion from './EncabezadoSeccion';

// Reseñas reales de Google Maps (Óptica Roma, Las Piedras), copiadas tal cual salvo los emojis.
// Puntaje y cantidad verificados el 16/09/2026: 4,9 con 43 reseñas.
const GOOGLE_MAPS =
  'https://www.google.com/maps/search/?api=1&query=%C3%93ptica%20Roma%20Rivera%20617%20Las%20Piedras%20Uruguay';

const RESENAS = [
  {
    nombre: 'Sofia Albanese',
    texto:
      'La compra resulta muy sencilla y la entrega super rápida, en todos los casos me lo han resuelto en el momento y en 20 minutos me voy con mis lentes nuevos. La atención es un 10.',
  },
  {
    nombre: 'Yanira Moreira',
    texto:
      'Compré 5 pares de lentes para niña y adulto y son los mejores en la atención y buena calidad, me resolvieron rápido unos cristales y con eso para mí es gran ayuda gracias óptica',
  },
  {
    nombre: 'Elsa Camejo',
    texto:
      'Hace muchos años me atiendo con el Doctor y me hacen los lentes en la Óptica, son muy responsables , buen trabajo y excelente atención',
  },
  {
    nombre: 'Rosario Martinez',
    texto: 'Es la mejor óptica! Siempre atienden con la mejor onda y te asesoran muy bien; los recomiendo siempre.',
  },
  {
    nombre: 'Maria Noel Arrascaeta',
    detalle: 'Local Guide',
    texto: 'Me cambio el día a día. Son cómodos y muy livianos los lentes. Espectacular. La atención de la óptica un lujo.',
  },
  {
    nombre: 'Florencia Amil',
    texto: 'Impecable todo, súper bien todo el armazón los cristales y la atención y sobre todo a un buen precio !!!',
  },
  {
    nombre: 'Susana Silva',
    texto: 'Muy buena atención, yo me hice un par de aumento y también me gane unos lentes de sol, super feliz',
  },
  {
    nombre: 'Estrella Acuña',
    detalle: 'Local Guide',
    texto: 'Excelente optica. Muy cordiales y atentos. Los precios no me parecieron caros Gracias',
  },
  {
    nombre: 'Daniela Rodriguez',
    texto: 'Siempre excelente atención y los anteojos ,lo mejor de lo mejor en Las Piedras',
  },
  {
    nombre: 'Rodrigo Almada Gimenez',
    texto: 'Excelente servicio, atención y variedad a la hora de elegir cualquier tipo de Lentes!',
  },
  { nombre: 'Sandra Gutierrez', texto: 'Muy buena atención. Y entrega ràpida. Siempre muy conforme. Gracias.' },
  { nombre: 'Cintia Tejera', texto: 'Hace años me hago los lentes alli exelente atencion !!!' },
  { nombre: 'Karina Perez', texto: 'Excelente en Todo... Recomiendo 100%' },
];

// Dos filas que avanzan hacia lados opuestos, como el desfile de Recién llegados:
// se frenan al pasar el mouse y con "reducir movimiento" quedan quietas con
// scroll horizontal.
const FILAS = [RESENAS.slice(0, 7), RESENAS.slice(7)];

function Estrellas({ tamano = 16 }: { tamano?: number }) {
  return (
    <span className="flex gap-0.5 text-cobalto" aria-label="5 de 5 estrellas">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={tamano} className="fill-current" aria-hidden />
      ))}
    </span>
  );
}

export default function TestimonialsSection() {
  return (
    <section aria-labelledby="opiniones" className="overflow-hidden bg-papel py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion
          idTitulo="opiniones"
          titulo="Opiniones"
          bajada="Lo que escriben nuestros clientes en Google."
          accion={
            <a href={GOOGLE_MAPS} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4">
              <span className="titular text-5xl tabular-nums text-tinta">4,9</span>
              <span>
                <Estrellas />
                <span className="enlace mt-1 block text-sm">Más de 40 reseñas en Google</span>
              </span>
            </a>
          }
        />
      </div>

      <div data-aparecer className="mt-12 space-y-5">
        {FILAS.map((fila, f) => (
          <div key={f} className="desfile-marco py-1">
            <ul
              className={`desfile flex w-max ${f === 1 ? 'desfile-inverso' : ''}`}
              style={{ '--duracion': `${fila.length * 10}s` } as React.CSSProperties}
            >
              {[...fila, ...fila].map((r, i) => {
                const copia = i >= fila.length;
                return (
                  // Margen a la izquierda (y no gap) para que el -50% del desfile caiga justo
                  <li key={`${r.nombre}-${i}`} aria-hidden={copia || undefined} className="ml-5 flex w-[300px] shrink-0 md:w-[380px]">
                    <figure className="flex w-full flex-col rounded-2xl bg-white p-6 ring-1 ring-linea md:p-7">
                      <div className="flex items-center justify-between">
                        <Estrellas tamano={14} />
                        <img src="/media/logos/google-g-logo.svg" alt="" width={18} height={18} loading="lazy" />
                      </div>
                      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-tinta md:text-base">{r.texto}</blockquote>
                      <figcaption className="mt-5 flex items-center gap-3">
                        <span
                          aria-hidden
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vidrio text-sm font-semibold text-cobalto"
                        >
                          {r.nombre.charAt(0)}
                        </span>
                        <span className="text-sm">
                          <span className="block font-semibold text-tinta">{r.nombre}</span>
                          <span className="text-pizarra">{r.detalle ? `${r.detalle} en Google` : 'Reseña de Google'}</span>
                        </span>
                      </figcaption>
                    </figure>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
