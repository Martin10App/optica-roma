'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, X } from 'lucide-react';

const WHATSAPP = 'https://wa.me/598098871673?text=';

type Cobertura = {
  nombre: string;
  logo?: string;
  detalle?: 'bps' | 'asse';
};

const COBERTURAS: Cobertura[] = [
  { nombre: 'BPS', logo: '/media/logos/BPS-logo.png', detalle: 'bps' },
  { nombre: 'Asistencia Integral', logo: '/media/logos/asistencia-integral-asse.svg', detalle: 'asse' },
  { nombre: 'CASMU', logo: '/media/logos/casmu-logo.jpg' },
  { nombre: 'CRAMI', logo: '/media/logos/mutualista-crami.png' },
  { nombre: 'Círculo Católico', logo: '/media/logos/mutualista-circulo-catolico.png' },
  { nombre: 'Médica Uruguaya', logo: '/media/logos/medica-uruguaya.webp' },
  { nombre: 'Hospital Policial' },
];

export default function CoverageSection() {
  const [abierto, setAbierto] = useState<'bps' | 'asse' | null>(null);
  const cerrarVentana = useCallback(() => setAbierto(null), []);

  return (
    <section id="coberturas" className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div data-aparecer className="lg:col-span-5">
          <h2 className="titular text-3xl text-tinta md:text-5xl">Mutualistas y BPS</h2>
          <p className="mt-4 text-lg leading-relaxed text-pizarra">
            Trabajamos con todas las mutualistas. Si tenés el subsidio de BPS o el beneficio de Asistencia Integral, hacemos
            el trámite en el local.
          </p>
          <a
            href={WHATSAPP + encodeURIComponent('Hola! Quiero consultar por mi cobertura de mutualista.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline mt-8"
          >
            Consultá tu cobertura
          </a>
        </div>

        <ul
          data-aparecer
          data-aparecer-retraso={100}
          className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-linea ring-1 ring-linea sm:grid-cols-4 lg:col-span-7"
        >
          {COBERTURAS.map((c) => {
            const contenido = (
              <>
                {c.logo ? (
                  <img
                    src={c.logo}
                    alt={c.nombre}
                    loading="lazy"
                    className="max-h-12 max-w-[80%] object-contain mix-blend-multiply grayscale transition group-hover:grayscale-0"
                  />
                ) : (
                  <span className="text-center text-[15px] font-semibold text-tinta">{c.nombre}</span>
                )}
                {c.detalle && (
                  <span className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1 text-[12px] font-medium text-cobalto">
                    Cómo funciona <ArrowRight size={12} aria-hidden />
                  </span>
                )}
              </>
            );
            return (
              <li key={c.nombre} className="bg-white">
                {c.detalle ? (
                  <button
                    type="button"
                    onClick={() => setAbierto(c.detalle!)}
                    className="group relative flex h-28 w-full items-center justify-center transition-colors hover:bg-papel sm:h-32"
                    aria-label={`${c.nombre}: cómo funciona`}
                  >
                    {contenido}
                  </button>
                ) : (
                  <div className="group relative flex h-28 items-center justify-center px-3 sm:h-32">{contenido}</div>
                )}
              </li>
            );
          })}
          <li className="flex h-28 items-center justify-center bg-white px-3 text-center text-[15px] text-pizarra sm:h-32">
            y todas las demás
          </li>
        </ul>
      </div>

      <Ventana
        abierta={abierto === 'bps'}
        alCerrar={cerrarVentana}
        titulo="Subsidio de BPS"
        logo="/media/logos/BPS-logo.png"
        mensaje="Hola! Quiero consultar por el subsidio del BPS."
      >
        <p>
          Hacemos la gestión del subsidio de BPS en el local, para que no tengas que hacer el trámite por tu cuenta. Con tu
          receta y tu cédula lo ingresamos en el sistema de BPS y el subsidio se descuenta del total de tu compra.
        </p>
        <h3>Qué necesitás traer</h3>
        <ul>
          <li>Tu cédula de identidad vigente.</li>
          <li>Tu receta oftalmológica, emitida dentro de los últimos 60 días.</li>
        </ul>
        <p>El trámite se puede hacer una vez cada dos años y suele completarse en pocos minutos.</p>
        <h3>Menores de 14 años</h3>
        <p>
          Si sos trabajador dependiente de la actividad privada, cobrás seguro de desempleo o sos jubilado con menores de 14
          años a cargo, también podés pedir el beneficio para los lentes recetados a tus hijos o a los menores a tu cargo.
        </p>
      </Ventana>

      <Ventana
        abierta={abierto === 'asse'}
        alCerrar={cerrarVentana}
        titulo="Asistencia Integral"
        logo="/media/logos/asistencia-integral-asse.svg"
        mensaje="Hola! Quiero consultar por el beneficio de Asistencia Integral ASSE."
      >
        <p>
          Trabajamos con el beneficio de Asistencia Integral para funcionarios de ASSE: descuentos y facilidades en lentes y
          cristales, según la cobertura vigente al momento de la compra.
        </p>
        <h3>Qué necesitás traer</h3>
        <ul>
          <li>Tu cédula de identidad.</li>
          <li>Tu receta oftalmológica vigente.</li>
          <li>La documentación de Asistencia Integral que acredita que sos beneficiario.</li>
        </ul>
        <p>Te asesoramos con la documentación y hacemos las verificaciones en el momento de la compra.</p>
      </Ventana>
    </section>
  );
}

type VentanaProps = {
  abierta: boolean;
  alCerrar: () => void;
  titulo: string;
  logo: string;
  mensaje: string;
  children: ReactNode;
};

function Ventana({ abierta, alCerrar, titulo, logo, mensaje, children }: VentanaProps) {
  const cerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierta) return;
    const previo = document.activeElement as HTMLElement | null;
    cerrar.current?.focus();
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflow;
      previo?.focus();
    };
  }, [abierta, alCerrar]);

  if (!abierta) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-4">
      <div className="animate-fade-in absolute inset-0 bg-tinta/50" onClick={alCerrar} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="animate-fade-in-up relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl sm:p-10"
      >
        <button
          ref={cerrar}
          type="button"
          onClick={alCerrar}
          className="absolute right-4 top-4 rounded-full p-2 text-pizarra transition-colors hover:bg-papel hover:text-tinta"
          aria-label="Cerrar"
        >
          <X size={22} />
        </button>

        <img src={logo} alt="" className="h-10 w-auto object-contain" />
        <h2 className="titular mt-6 text-3xl text-tinta">{titulo}</h2>

        <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-pizarra [&_h3]:pt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-tinta [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
          {children}
        </div>

        <a
          href={WHATSAPP + encodeURIComponent(mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-8 w-full sm:w-auto"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
