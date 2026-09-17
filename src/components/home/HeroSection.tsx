'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Pause, Play, ShieldCheck, Wrench } from 'lucide-react';
import { WHATSAPP_CONSULTA } from '@/lib/constants';
import { formatearPrecio } from '@/lib/catalogoTipos';

const WHATSAPP = 'https://wa.me/598098871673?text=';

type Diapositiva = {
  nombre: string;
  etiqueta: string;
  titulo: ReactNode;
  texto: string;
  principal: { texto: string; href: string; externo?: boolean };
  secundario: { texto: string; href: string; externo?: boolean };
  /** Segundos que queda en pantalla antes de pasar a la siguiente */
  segundos: number;
  medio:
    | { tipo: 'video'; src: string; poster: string; reiniciar?: boolean }
    | { tipo: 'foto'; src: string }
    | { tipo: 'dibujo' };
  alt: string;
};

// La primera diapositiva dura lo mismo que el video de Varilux (12,4 s), así se
// ve entero una vez antes de pasar.
const DIAPOSITIVAS: Diapositiva[] = [
  {
    nombre: 'Varilux Doble Disfrute',
    etiqueta: 'Promo Varilux · Doble Disfrute',
    titulo: 'Tu segundo par de lentes progresivos, de regalo.',
    texto:
      'Comprá tus lentes progresivos Varilux y llevate el segundo par sin costo. En Óptica Roma somos especialistas Varilux certificados.',
    principal: {
      texto: 'Consultar la promo',
      href: WHATSAPP + encodeURIComponent('Hola! Quiero consultar por la promo Varilux Doble Disfrute.'),
      externo: true,
    },
    secundario: { texto: 'Ver promociones', href: '/#promociones' },
    segundos: 12.4,
    medio: {
      tipo: 'video',
      src: '/media/varilux/doble-disfrute-cuadrado.mp4',
      poster: '/media/varilux/doble-disfrute-cuadrado-poster.jpg',
      reiniciar: true,
    },
    alt: 'Comercial de Varilux Doble Disfrute',
  },
  {
    nombre: 'Test de visión',
    etiqueta: 'Gratis · 4 minutos',
    titulo: '¿Cómo está tu vista? Hacé el test online.',
    texto:
      'De lejos, de cerca, astigmatismo y más, desde el celular o la computadora. Te explica qué puede estar pasando según tu edad y, si hace falta, te derivamos a un médico oftalmólogo.',
    principal: { texto: 'Hacer el test', href: '/test-de-vision' },
    secundario: { texto: '¿No tenés receta?', href: '/#chequeo' },
    segundos: 8,
    medio: { tipo: 'dibujo' },
    alt: 'Letras E de distintos tamaños, como en un test de visión',
  },
  {
    nombre: 'Óptica Roma',
    etiqueta: 'Óptica Roma · Las Piedras y Canelones',
    titulo: 'Tus lentes, en el acto.',
    texto:
      'Más de mil armazones con el precio a la vista. Armamos los cristales en nuestro taller, así muchos trabajos salen en el día.',
    principal: { texto: 'Ver catálogo', href: '/catalogo' },
    secundario: { texto: 'Consultanos por WhatsApp', href: WHATSAPP_CONSULTA, externo: true },
    segundos: 9,
    // Versión cuadrada y liviana (1,4 MB): la de 4,5 MB se trababa al entrar
    medio: {
      tipo: 'video',
      src: '/media/local/local-las-piedras-cuadrado.mp4',
      poster: '/media/local/local-las-piedras-cuadrado-poster.jpg',
    },
    alt: 'Recorrido por la vidriera y el interior de Óptica Roma en Las Piedras',
  },
  {
    nombre: 'Promo Ninety',
    etiqueta: 'Promo armazón y cristales',
    titulo: <>Armazón Ninety con cristales, a {formatearPrecio(4900)}.</>,
    texto: 'Cristales monofocales de índice 1.56 con antirreflejo, armados en nuestro taller. Traé la receta de tu médico.',
    principal: {
      texto: 'Consultar la promo',
      href: WHATSAPP + encodeURIComponent('Hola! Quiero consultar por la promo de $4.900: armazón Ninety con cristales monofocales.'),
      externo: true,
    },
    secundario: { texto: 'Ver armazones Ninety', href: '/catalogo/armazones-de-receta/ninety' },
    segundos: 7,
    medio: { tipo: 'foto', src: '/media/promo-ninety-web.jpg' },
    alt: 'Armazones de la colección Ninety',
  },
];

const DIFERENCIALES = [
  { icono: Wrench, titulo: 'Taller propio', texto: 'Armamos tus lentes en el momento' },
  { icono: ShieldCheck, titulo: 'Mutualistas y BPS', texto: 'Hacemos el trámite en el local' },
  { icono: BadgeCheck, titulo: 'Especialistas Varilux', texto: 'Certificados por Essilor' },
];

// Lo que tarda el cambio de diapositiva (la animación más larga es la del texto: 150 + 800 ms)
const TRANSICION_MS = 1000;

type Estado = 'activa' | 'sale' | 'espera';

function Enlace({ destino, className, children }: { destino: Diapositiva['principal']; className: string; children: ReactNode }) {
  return destino.externo ? (
    <a href={destino.href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={destino.href} className={className}>
      {children}
    </Link>
  );
}

// El video de cada diapositiva corre solo mientras está en pantalla. React no
// escribe "muted" en el HTML del servidor, y sin eso el navegador no lo deja
// arrancar solo: por eso se silencia y se le da play desde acá.
function VideoDiapositiva({
  medio,
  activa,
  proxima,
  pausado,
  alt,
}: {
  medio: Extract<Diapositiva['medio'], { tipo: 'video' }>;
  activa: boolean;
  proxima: boolean;
  pausado: boolean;
  alt: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // El que sale se pausa en el acto: dos videos decodificando a la vez mientras
    // se deslizan hacían que el cambio se trabara
    if (!activa || pausado) {
      v.pause();
      return;
    }
    // Si el play llega antes de que el video tenga datos, el navegador lo puede
    // rechazar y quedaba quieto: se reintenta apenas se puede reproducir
    const reproducir = () => {
      if (v.paused) v.play().catch(() => {});
    };
    reproducir();
    v.addEventListener('canplay', reproducir);
    v.addEventListener('loadeddata', reproducir);
    return () => {
      v.removeEventListener('canplay', reproducir);
      v.removeEventListener('loadeddata', reproducir);
    };
  }, [activa, pausado]);

  // Varilux vuelve a empezar cada vez que entra, para que se vea la historia completa
  useEffect(() => {
    const v = ref.current;
    if (v && activa && medio.reiniciar) v.currentTime = 0;
  }, [activa, medio.reiniciar]);

  return (
    <video
      ref={ref}
      src={medio.src}
      poster={medio.poster}
      muted
      loop
      playsInline
      // El de la próxima diapositiva se empieza a bajar antes de que le toque
      preload={activa || proxima ? 'auto' : 'none'}
      aria-label={alt}
      className="h-full w-full object-cover"
    />
  );
}

// Cartel de letras E para la pantalla del test de visión: dibujo propio, sin fotos
const FILAS_E: { tamano: number; giros: number[] }[] = [
  { tamano: 17, giros: [0] },
  { tamano: 11, giros: [90, 270] },
  { tamano: 7.5, giros: [180, 0, 90] },
  { tamano: 5, giros: [270, 90, 180, 0] },
  { tamano: 3.4, giros: [0, 180, 270, 90, 180] },
];

function DibujoTestVision({ activa, alt }: { activa: boolean; alt: string }) {
  let y = 12;
  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      <svg viewBox="0 0 100 100" className={`h-[82%] w-[82%] ${activa ? 'acercamiento-lento' : ''}`} role="img" aria-label={alt} style={{ '--duracion': '9s' } as CSSProperties}>
        {FILAS_E.map((fila) => {
          const hueco = fila.tamano * 0.9;
          const ancho = fila.giros.length * fila.tamano + (fila.giros.length - 1) * hueco;
          const fy = y;
          y += fila.tamano + 7;
          return fila.giros.map((giro, j) => {
            const x = 50 - ancho / 2 + j * (fila.tamano + hueco);
            return (
              <path
                key={`${fy}-${j}`}
                d="M0 0H5V1H1V2H5V3H1V4H5V5H0Z"
                fill="#10152b"
                transform={`translate(${x} ${fy}) scale(${fila.tamano / 5}) rotate(${giro} 2.5 2.5)`}
              />
            );
          });
        })}
        <rect x="18" y={y + 1} width="64" height="0.8" fill="#0b2bd6" />
      </svg>
    </div>
  );
}

export default function HeroSection() {
  const [activa, setActiva] = useState(0);
  const [anterior, setAnterior] = useState<number | null>(null);
  const [direccion, setDireccion] = useState<1 | -1>(1);
  const [vuelta, setVuelta] = useState(0);
  const [pausaManual, setPausaManual] = useState(false);
  const [fueraDeVista, setFueraDeVista] = useState(false);
  const [pestanaOculta, setPestanaOculta] = useState(false);
  const seccion = useRef<HTMLElement>(null);
  const toque = useRef<number | null>(null);
  const total = DIAPOSITIVAS.length;
  // No se frena con el mouse encima: la portada ocupa casi toda la pantalla y los
  // videos quedaban quietos. Se frena fuera de vista, con la pestaña oculta o con
  // el botón de pausa.
  const pausado = pausaManual || fueraDeVista || pestanaOculta;

  const ir = useCallback(
    (destino: number, sentido: 1 | -1) => {
      const nueva = (destino + total) % total;
      if (nueva === activa) return;
      setAnterior(activa);
      setDireccion(sentido);
      setActiva(nueva);
      setVuelta((v) => v + 1);
    },
    [activa, total]
  );

  const siguiente = useCallback(() => ir(activa + 1, 1), [activa, ir]);
  const previa = useCallback(() => ir(activa - 1, -1), [activa, ir]);

  // No avanza si la portada no se ve (el usuario bajó) ni con la pestaña oculta
  useEffect(() => {
    const el = seccion.current;
    if (!el) return;
    const observador = new IntersectionObserver(([e]) => setFueraDeVista(!e.isIntersecting), { threshold: 0.25 });
    observador.observe(el);
    const pestana = () => setPestanaOculta(document.hidden);
    document.addEventListener('visibilitychange', pestana);
    return () => {
      observador.disconnect();
      document.removeEventListener('visibilitychange', pestana);
    };
  }, []);

  useEffect(() => {
    if (anterior === null) return;
    const t = setTimeout(() => setAnterior(null), TRANSICION_MS);
    return () => clearTimeout(t);
  }, [anterior, vuelta]);

  const estado = (i: number): Estado => (i === activa ? 'activa' : i === anterior ? 'sale' : 'espera');

  // Clases de animación con el sentido explícito (globals.css, "Portada").
  // Con transiciones, al volver hacia atrás la imagen nueva entraba del lado
  // equivocado porque su posición de espera cambiaba en el mismo instante.
  const lado = direccion === 1 ? 'der' : 'izq';
  const ladoSalida = direccion === 1 ? 'izq' : 'der';

  const claseTexto = (i: number) => {
    const e = estado(i);
    if (e === 'activa') return anterior === null ? '' : `hero-texto-entra-${lado}`;
    if (e === 'sale') return `hero-texto-sale-${ladoSalida}`;
    return 'invisible opacity-0';
  };

  const claseMedio = (i: number) => {
    const e = estado(i);
    if (e === 'activa') return `z-[2] ${anterior === null ? '' : `hero-entra-${lado}`}`;
    if (e === 'sale') return `z-[1] hero-sale-${ladoSalida}`;
    return 'invisible z-0';
  };

  return (
    <section
      ref={seccion}
      aria-roledescription="carrusel"
      aria-label="Promociones destacadas"
      className="relative overflow-hidden bg-papel pt-[72px]"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') siguiente();
        if (e.key === 'ArrowLeft') previa();
      }}
    >
      <h1 className="sr-only">Óptica Roma: armazones, cristales y taller propio en Las Piedras y Canelones</h1>

      <div className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 md:pt-14 lg:px-8 lg:pb-16">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Imagen o video: pasa hacia el costado. Se puede deslizar con el dedo. */}
          <div className="lg:order-2 lg:col-span-6">
            <div
              className="abrir-foto relative mx-auto aspect-square w-full max-w-[540px] touch-pan-y overflow-hidden rounded-[28px] bg-tinta lg:ml-auto lg:mr-0"
              onPointerDown={(e) => {
                toque.current = e.clientX;
              }}
              onPointerUp={(e) => {
                if (toque.current === null) return;
                const dx = e.clientX - toque.current;
                toque.current = null;
                if (Math.abs(dx) > 50) (dx < 0 ? siguiente : previa)();
              }}
            >
              {DIAPOSITIVAS.map((d, i) => (
                <div
                  key={d.nombre}
                  className={`absolute inset-0 will-change-transform ${claseMedio(i)}`}
                  aria-hidden={i !== activa}
                >
                  {d.medio.tipo === 'video' ? (
                    <VideoDiapositiva
                      medio={d.medio}
                      activa={i === activa}
                      proxima={i === (activa + 1) % total}
                      pausado={pausado}
                      alt={d.alt}
                    />
                  ) : d.medio.tipo === 'dibujo' ? (
                    <DibujoTestVision activa={i === activa} alt={d.alt} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.medio.src}
                      alt={d.alt}
                      className={`h-full w-full object-cover ${i === activa ? 'acercamiento-lento' : ''}`}
                      style={{ '--duracion': `${d.segundos + 1}s` } as CSSProperties}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:order-1 lg:col-span-6">
            {/* Todas las diapositivas ocupan la misma celda: el alto no salta al cambiar */}
            <div className="entrada grid">
              {DIAPOSITIVAS.map((d, i) => (
                <div
                  key={d.nombre}
                  role="group"
                  aria-roledescription="diapositiva"
                  aria-label={`${i + 1} de ${total}: ${d.nombre}`}
                  aria-hidden={i !== activa}
                  // Las diapositivas ocultas no reciben foco ni clics (React 18 no conoce el atributo inert)
                  ref={(el) => {
                    if (el) el.inert = i !== activa;
                  }}
                  className={`[grid-area:1/1] ${claseTexto(i)}`}
                >
                  <p className="text-sm font-semibold text-cobalto">{d.etiqueta}</p>
                  <h2 className="titular mt-4 max-w-[16ch] text-[2.4rem] text-tinta sm:text-5xl xl:text-[3.6rem]">{d.titulo}</h2>
                  <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-pizarra">{d.texto}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Enlace destino={d.principal} className="btn-cta">
                      {d.principal.texto}
                    </Enlace>
                    <Enlace destino={d.secundario} className="btn-outline bg-white">
                      {d.secundario.texto}
                    </Enlace>
                  </div>
                </div>
              ))}
            </div>

            {/* Barritas de avance (tocar una va directo) y flechas */}
            <div className={`mt-10 flex items-center gap-5 ${pausado ? 'carrusel-pausado' : ''}`}>
              <ol className="flex flex-1 gap-2">
                {DIAPOSITIVAS.map((d, i) => (
                  <li key={d.nombre} className="flex-1">
                    <button
                      type="button"
                      onClick={() => ir(i, i > activa ? 1 : -1)}
                      aria-label={`Ver ${d.nombre}`}
                      aria-current={i === activa}
                      className="group block w-full py-2 text-left"
                    >
                      <span className="block h-[3px] overflow-hidden rounded-full bg-linea">
                        {i === activa ? (
                          <span
                            key={vuelta}
                            className="avance-carrusel block h-full rounded-full bg-cobalto"
                            style={{ '--duracion': `${d.segundos}s` } as CSSProperties}
                            onAnimationEnd={siguiente}
                          />
                        ) : (
                          <span className={`block h-full rounded-full ${i < activa ? 'bg-tinta/25' : ''}`} />
                        )}
                      </span>
                      <span
                        className={`mt-2 hidden truncate text-xs sm:block ${i === activa ? 'font-semibold text-tinta' : 'text-pizarra group-hover:text-tinta'}`}
                      >
                        {d.nombre}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setPausaManual((p) => !p)}
                  aria-label={pausaManual ? 'Reanudar el carrusel' : 'Pausar el carrusel'}
                  aria-pressed={pausaManual}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-tinta ring-1 ring-linea transition hover:ring-tinta"
                >
                  {pausaManual ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
                </button>
                <button
                  type="button"
                  onClick={previa}
                  aria-label="Anterior"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-tinta ring-1 ring-linea transition hover:ring-tinta"
                >
                  <ArrowLeft size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={siguiente}
                  aria-label="Siguiente"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-tinta ring-1 ring-linea transition hover:ring-tinta"
                >
                  <ArrowRight size={18} aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>

        <ul className="mt-12 grid gap-6 border-t border-linea pt-8 sm:grid-cols-3">
          {DIFERENCIALES.map(({ icono: Icono, titulo, texto }) => (
            <li key={titulo} className="flex gap-3">
              <Icono size={24} strokeWidth={1.75} className="shrink-0 text-cobalto" aria-hidden />
              <div>
                <p className="text-[15px] font-semibold text-tinta">{titulo}</p>
                <p className="mt-0.5 text-sm text-pizarra">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
