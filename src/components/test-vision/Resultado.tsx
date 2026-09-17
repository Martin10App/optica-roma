'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { RotateCcw } from 'lucide-react';
import { analizar, type Nivel, type Respuestas } from './analisis';
import { DiagramaEnfoque } from './dibujos';

const WHATSAPP = 'https://wa.me/598098871673?text=';

const COLOR: Record<Nivel, string> = {
  bien: 'bg-emerald-500',
  atencion: 'bg-amber-500',
  pronto: 'bg-red-500',
};

export default function Resultado({ respuestas, alRepetir }: { respuestas: Respuestas; alRepetir: () => void }) {
  const a = analizar(respuestas);

  // El mensaje lo manda la persona desde su WhatsApp: la web no guarda nada
  const resumen = a.hallazgos.map((h) => h.titulo.toLowerCase()).join('; ');
  const mensaje =
    a.nivel === 'bien'
      ? `Hola! Hice el test de visión en la web (tengo ${respuestas.edad} años) y quiero hacer una consulta.`
      : `Hola! Hice el test de visión en la web (tengo ${respuestas.edad} años) y me dio: ${resumen}. ¿Cómo coordino la consulta con el oftalmólogo?`;

  return (
    <div className="space-y-5">
      <div className="tv-aparece rounded-3xl bg-white p-6 ring-1 ring-linea sm:p-10" style={{ '--i': 0 } as CSSProperties}>
        <p className="flex items-center gap-2 text-sm font-semibold text-cobalto">
          <span className={`h-2.5 w-2.5 rounded-full ${COLOR[a.nivel]}`} aria-hidden />
          Resultado orientativo
        </p>
        <h2 className="titular mt-3 text-3xl text-tinta sm:text-4xl">{a.titular}</h2>
        <p className="mt-4 text-lg leading-relaxed text-pizarra">{a.bajada}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={WHATSAPP + encodeURIComponent(mensaje)} target="_blank" rel="noopener noreferrer" className="btn-cta">
            {a.nivel === 'bien' ? 'Consultanos por WhatsApp' : 'Coordinar la consulta'}
          </a>
          <button type="button" onClick={alRepetir} className="btn-outline">
            <RotateCcw size={16} aria-hidden />
            Repetir el test
          </button>
        </div>
      </div>

      {a.hallazgos.length > 0 ? (
        <section aria-labelledby="que-puede-ser">
          <h3 id="que-puede-ser" className="titular tv-aparece mt-10 px-1 text-2xl text-tinta" style={{ '--i': 1 } as CSSProperties}>
            Qué puede estar pasando
          </h3>
          <ul className="mt-4 space-y-4">
            {a.hallazgos.map((h, i) => (
              <li
                key={h.titulo}
                className="tv-aparece grid gap-5 rounded-3xl bg-white p-6 ring-1 ring-linea sm:grid-cols-[220px_1fr] sm:items-center"
                style={{ '--i': i + 2 } as CSSProperties}
              >
                <div className="rounded-2xl bg-papel p-3">
                  <DiagramaEnfoque tipo={h.diagrama} />
                </div>
                <div>
                  <p className="flex items-center gap-2 font-semibold text-tinta">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${COLOR[h.nivel]}`} aria-hidden />
                    {h.titulo}
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-pizarra">{h.explicacion}</p>
                  {h.enlace && (
                    <Link href={h.enlace.href} className="enlace mt-3 inline-block text-[15px]">
                      {h.enlace.texto}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div
          className="tv-aparece grid gap-5 rounded-3xl bg-white p-6 ring-1 ring-linea sm:grid-cols-[220px_1fr] sm:items-center"
          style={{ '--i': 1 } as CSSProperties}
        >
          <div className="rounded-2xl bg-papel p-3">
            <DiagramaEnfoque tipo="normal" />
          </div>
          <p className="text-[15px] leading-relaxed text-pizarra">
            Así enfoca un ojo que ve bien: la luz entra, el cristalino la desvía y los rayos se juntan justo en la retina.
          </p>
        </div>
      )}

      <section aria-labelledby="tus-resultados" className="tv-aparece rounded-3xl bg-white p-6 ring-1 ring-linea sm:p-8" style={{ '--i': a.hallazgos.length + 2 } as CSSProperties}>
        <h3 id="tus-resultados" className="titular text-2xl text-tinta">
          Prueba por prueba
        </h3>
        <ul className="mt-5 divide-y divide-linea">
          {a.medidas.map((m, i) => (
            <li key={m.prueba} className="py-4">
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${COLOR[m.nivel]}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-tinta">{m.prueba}</p>
                  <p className="text-[15px] text-pizarra">{m.detalle}</p>
                  {m.porcentaje !== undefined && (
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-papel" aria-hidden>
                      <div
                        className={`tv-barra h-full rounded-full ${m.nivel === 'bien' ? 'bg-cobalto' : 'bg-amber-500'}`}
                        style={{ '--ancho': `${Math.max(m.porcentaje, 4)}%`, '--i': i } as CSSProperties}
                      />
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {!respuestas.calibrada && (
          <p className="mt-4 text-sm text-pizarra">No mediste la pantalla con una tarjeta: los tamaños de letra son aproximados.</p>
        )}
        <p className="mt-6 rounded-2xl bg-papel p-4 text-sm leading-relaxed text-pizarra">
          Este test no reemplaza el control con un médico oftalmólogo ni sirve para hacer una receta. Depende de tu pantalla, de la luz
          y de la distancia. No guardamos tus respuestas.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/#chequeo" className="enlace">
            ¿No tenés receta? Te derivamos
          </Link>
          <Link href="/catalogo" className="enlace">
            Ver armazones
          </Link>
        </div>
      </section>
    </div>
  );
}
