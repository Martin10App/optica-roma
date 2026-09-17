'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Glasses, Minus, Plus } from 'lucide-react';
import { AGUDEZAS, PUNTOS_CERCA, type Lentes, type Ojo, type Respuestas } from './analisis';
import { DistanciaCelular, OjoTapado, RejillaAmsler, RuedaAstigmatismo } from './dibujos';
import { PruebaLectura, PruebaLetraE } from './pruebas';
import Resultado from './Resultado';

// Test de visión orientativo, hecho por Óptica Roma con pruebas clásicas de uso
// libre: letra E girada (lejos), rueda de líneas (astigmatismo), rejilla de
// Amsler, contraste y lectura de cerca. Todo corre en el navegador: no se
// guarda ni se envía nada. La edad cambia la interpretación (presbicia a partir
// de los 40, hipermetropía antes): ver analisis.ts.
//
// Tamaños reales: la pantalla se mide con una tarjeta y la E de 10/10 ocupa 5
// minutos de arco a la distancia elegida. La letra de cerca se mide en puntos
// tipográficos (1 punto = 0,3528 mm) a 40 cm.

const ANCHO_TARJETA_MM = 85.6; // tarjetas de crédito, débito y la cédula uruguaya (formato ID-1)
const ALTO_TARJETA_MM = 53.98;
const MINUTO_RAD = Math.PI / (180 * 60);
const MM_POR_PUNTO = 0.3528;
const CONTRASTES = [0.5, 0.25, 0.125, 0.063, 0.031, 0.016];

type Etapa =
  | { tipo: 'inicio' }
  | { tipo: 'edad' }
  | { tipo: 'lentes' }
  | { tipo: 'calibrar' }
  | { tipo: 'distancia' }
  | { tipo: 'tapar'; ojo: Ojo }
  | { tipo: 'lejos'; ojo: Ojo }
  | { tipo: 'astigmatismo'; ojo: Ojo }
  | { tipo: 'amsler'; ojo: Ojo }
  | { tipo: 'ambos' }
  | { tipo: 'contraste' }
  | { tipo: 'acercar' }
  | { tipo: 'cerca' }
  | { tipo: 'resultado' };

const ETAPAS: Etapa[] = [
  { tipo: 'inicio' },
  { tipo: 'edad' },
  { tipo: 'lentes' },
  { tipo: 'calibrar' },
  { tipo: 'distancia' },
  { tipo: 'tapar', ojo: 'derecho' },
  { tipo: 'lejos', ojo: 'derecho' },
  { tipo: 'astigmatismo', ojo: 'derecho' },
  { tipo: 'amsler', ojo: 'derecho' },
  { tipo: 'tapar', ojo: 'izquierdo' },
  { tipo: 'lejos', ojo: 'izquierdo' },
  { tipo: 'astigmatismo', ojo: 'izquierdo' },
  { tipo: 'amsler', ojo: 'izquierdo' },
  { tipo: 'ambos' },
  { tipo: 'contraste' },
  { tipo: 'acercar' },
  { tipo: 'cerca' },
  { tipo: 'resultado' },
];

// Barra de etapas de arriba: agrupa los pasos para que se entienda dónde está
const TRAMOS: { nombre: string; tipos: Etapa['tipo'][] }[] = [
  { nombre: 'Datos', tipos: ['edad', 'lentes', 'calibrar', 'distancia'] },
  { nombre: 'Lejos', tipos: ['tapar', 'lejos'] },
  { nombre: 'Astigmatismo', tipos: ['astigmatismo'] },
  { nombre: 'Amsler', tipos: ['amsler'] },
  { nombre: 'Contraste', tipos: ['ambos', 'contraste'] },
  { nombre: 'Cerca', tipos: ['acercar', 'cerca'] },
];

const OPCIONES_LENTES: { valor: Lentes; titulo: string; texto: string }[] = [
  { valor: 'no', titulo: 'No uso lentes', texto: 'Ni para lejos ni para leer' },
  { valor: 'lejos', titulo: 'Para ver de lejos', texto: 'Manejar, la tele, carteles' },
  { valor: 'cerca', titulo: 'Para leer', texto: 'Celular, libros, de cerca' },
  { valor: 'multifocales', titulo: 'Multifocales', texto: 'Lejos y cerca en el mismo lente' },
];

function Tarjeta({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl bg-white p-6 ring-1 ring-linea sm:p-10">{children}</div>;
}

function Etiqueta({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold text-cobalto">{children}</p>;
}

function Titulo({ children }: { children: ReactNode }) {
  return <h2 className="titular mt-2 text-3xl text-tinta sm:text-4xl">{children}</h2>;
}

function Parrafo({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-lg leading-relaxed text-pizarra">{children}</p>;
}

function BotonesSiNo({ si, no, alResponder }: { si: string; no: string; alResponder: (bien: boolean) => void }) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <button type="button" className="btn-primary flex-1 active:scale-[0.98]" onClick={() => alResponder(true)}>
        {si}
      </button>
      <button type="button" className="btn-outline flex-1 active:scale-[0.98]" onClick={() => alResponder(false)}>
        {no}
      </button>
    </div>
  );
}

function grisDeContraste(contraste: number) {
  const lineal = 1 - contraste;
  const srgb = lineal <= 0.0031308 ? 12.92 * lineal : 1.055 * Math.pow(lineal, 1 / 2.4) - 0.055;
  const v = Math.round(srgb * 255);
  return `rgb(${v},${v},${v})`;
}

const retraso = (i: number) => ({ '--i': i }) as CSSProperties;

type Estado = Omit<Respuestas, 'maximoLejos'>;
const estadoInicial = (): Estado => ({ edad: 35, lentes: 'no', calibrada: false, lejos: {}, astigmatismo: {}, amsler: {} });

export default function TestVision() {
  const [paso, setPaso] = useState(0);
  const [estado, setEstado] = useState<Estado>(estadoInicial);
  const [anchoTarjeta, setAnchoTarjeta] = useState(320);
  const [pxPorMm, setPxPorMm] = useState<number | null>(null);
  const [distanciaMm, setDistanciaMm] = useState(400);
  const [anchoDisponible, setAnchoDisponible] = useState(600);
  const [dpr, setDpr] = useState(1);

  const etapa = ETAPAS[paso];
  const avanzar = () => {
    setPaso((p) => Math.min(p + 1, ETAPAS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const anotar = (cambio: Partial<Estado>) => setEstado((e) => ({ ...e, ...cambio }));

  useEffect(() => {
    const medir = () => setAnchoDisponible(Math.min(window.innerWidth - 80, 620));
    medir();
    setDpr(window.devicePixelRatio || 1);
    // Punto de partida de la tarjeta: 96 px por pulgada en computadora, más en celular
    const celular = window.matchMedia('(pointer: coarse)').matches;
    setAnchoTarjeta(Math.round((celular ? 6.2 : 96 / 25.4) * ANCHO_TARJETA_MM));
    setDistanciaMm(celular ? 400 : 1000);
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  const escala = pxPorMm ?? anchoTarjeta / ANCHO_TARJETA_MM;
  const tamanoLejos = (agudeza: number) => distanciaMm * Math.tan((5 * MINUTO_RAD) / agudeza) * escala;

  // Solo los niveles que la pantalla dibuja con nitidez (cada trazo de la E ≥ 1,2 píxeles reales)
  const agudezas = useMemo(
    () => AGUDEZAS.filter((a) => (tamanoLejos(a) / 5) * dpr >= 1.2),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [escala, distanciaMm, dpr]
  );
  // Letra de cerca a 40 cm; por debajo de ~6 píxeles reales no se lee en ninguna pantalla
  const puntosCerca = useMemo(() => PUNTOS_CERCA.filter((p) => p * MM_POR_PUNTO * escala * dpr >= 6), [escala, dpr]);

  const reiniciar = () => {
    setEstado(estadoInicial());
    setPxPorMm(null);
    setPaso(0);
  };

  const tramoActual = TRAMOS.findIndex((t) => t.tipos.includes(etapa.tipo));
  const distanciaTexto = distanciaMm === 400 ? '40 cm' : '1 metro';

  return (
    <div className="mx-auto max-w-2xl">
      {etapa.tipo !== 'inicio' && etapa.tipo !== 'resultado' && (
        <ol className="mb-6 grid grid-cols-6 gap-1.5" aria-label="Etapas del test">
          {TRAMOS.map((t, i) => (
            <li key={t.nombre}>
              <span
                className={`block h-1.5 rounded-full transition-colors duration-500 ${
                  i < tramoActual ? 'bg-cobalto' : i === tramoActual ? 'tv-tramo-actual bg-cobalto/50' : 'bg-linea'
                }`}
              />
              <span className={`mt-1.5 hidden truncate text-xs sm:block ${i === tramoActual ? 'font-semibold text-tinta' : 'text-pizarra'}`}>
                {t.nombre}
              </span>
            </li>
          ))}
        </ol>
      )}

      {/* key: cada paso entra con su animación */}
      <div key={paso} className="tv-paso">
        {etapa.tipo === 'inicio' && (
          <Tarjeta>
            <Etiqueta>Gratis · 4 minutos · sin registrarte</Etiqueta>
            <Titulo>¿Cómo está tu vista?</Titulo>
            <Parrafo>
              Cinco pruebas rápidas: de lejos, de cerca, astigmatismo, rejilla de Amsler y contraste. Al final te explicamos qué puede estar
              pasando y si conviene consultar con un médico oftalmólogo.
            </Parrafo>
            <ul className="mt-6 space-y-3 text-[15px] text-tinta">
              {[
                'Si usás lentes, dejátelos puestos.',
                'Buena luz, y el brillo de la pantalla alto.',
                'Tené a mano una tarjeta (de crédito, débito o la cédula) para medir la pantalla.',
              ].map((t, i) => (
                <li key={t} className="tv-aparece flex gap-3" style={retraso(i + 1)}>
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cobalto" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl bg-papel p-4 text-sm leading-relaxed text-pizarra">
              Es una prueba orientativa: no reemplaza el control con un médico oftalmólogo ni sirve para hacer una receta. No guardamos tus
              respuestas.
            </p>
            <button type="button" className="btn-cta mt-8 w-full sm:w-auto" onClick={avanzar}>
              Empezar el test
            </button>
          </Tarjeta>
        )}

        {etapa.tipo === 'edad' && (
          <Tarjeta>
            <Etiqueta>Antes de empezar</Etiqueta>
            <Titulo>¿Cuántos años tenés?</Titulo>
            <Parrafo>La vista de cerca cambia con la edad: con este dato te explicamos mejor el resultado.</Parrafo>
            <div className="mt-10 flex items-center justify-center gap-5">
              <button
                type="button"
                aria-label="Un año menos"
                onClick={() => anotar({ edad: Math.max(5, estado.edad - 1) })}
                className="flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-linea transition hover:ring-cobalto active:scale-90"
              >
                <Minus size={20} />
              </button>
              <p className="w-44 text-center" aria-live="polite">
                <span key={estado.edad} className="tv-numero titular inline-block text-7xl tabular-nums text-tinta">
                  {estado.edad}
                </span>
                <span className="mt-1 block text-pizarra">años</span>
              </p>
              <button
                type="button"
                aria-label="Un año más"
                onClick={() => anotar({ edad: Math.min(99, estado.edad + 1) })}
                className="flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-linea transition hover:ring-cobalto active:scale-90"
              >
                <Plus size={20} />
              </button>
            </div>
            <input
              type="range"
              min={5}
              max={99}
              value={estado.edad}
              onChange={(e) => anotar({ edad: Number(e.target.value) })}
              className="mt-8 w-full accent-[#0b2bd6]"
              aria-label="Edad"
            />
            {estado.edad < 14 && (
              <p className="tv-aparece mt-4 rounded-2xl bg-papel p-4 text-sm text-pizarra">
                Si es para un niño o una niña, que lo haga con un adulto al lado. En chicos el control con el oftalmólogo es muy importante
                aunque el test dé bien.
              </p>
            )}
            <button type="button" className="btn-cta mt-8" onClick={avanzar}>
              Seguir
            </button>
          </Tarjeta>
        )}

        {etapa.tipo === 'lentes' && (
          <Tarjeta>
            <Etiqueta>Antes de empezar</Etiqueta>
            <Titulo>¿Usás lentes hoy?</Titulo>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {OPCIONES_LENTES.map((op, i) => (
                <button
                  key={op.valor}
                  type="button"
                  onClick={() => {
                    anotar({ lentes: op.valor });
                    avanzar();
                  }}
                  className="tv-aparece flex items-start gap-4 rounded-2xl p-5 text-left ring-1 ring-linea transition hover:-translate-y-0.5 hover:ring-cobalto active:scale-[0.98]"
                  style={retraso(i)}
                >
                  <Glasses size={26} className={`mt-0.5 shrink-0 ${op.valor === 'no' ? 'text-linea' : 'text-cobalto'}`} aria-hidden />
                  <span>
                    <span className="block text-lg font-semibold text-tinta">{op.titulo}</span>
                    <span className="mt-0.5 block text-[15px] text-pizarra">{op.texto}</span>
                  </span>
                </button>
              ))}
            </div>
          </Tarjeta>
        )}

        {etapa.tipo === 'calibrar' && (
          <Tarjeta>
            <Etiqueta>Paso 1 de 2</Etiqueta>
            <Titulo>Medí tu pantalla</Titulo>
            <Parrafo>Apoyá una tarjeta sobre el rectángulo azul y ajustalo hasta que tenga el mismo ancho que la tarjeta.</Parrafo>
            <div className="mt-8 flex justify-center overflow-hidden">
              <div
                className="tv-tarjeta relative overflow-hidden rounded-[4%/6%] bg-cobalto"
                style={{ width: anchoTarjeta, height: anchoTarjeta * (ALTO_TARJETA_MM / ANCHO_TARJETA_MM) }}
              >
                <span className="absolute left-[8%] top-[30%] h-[18%] w-[14%] rounded bg-white/30" aria-hidden />
                <span className="absolute bottom-[14%] left-[8%] h-[6%] w-[50%] rounded bg-white/25" aria-hidden />
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                aria-label="Achicar"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ring-linea active:scale-90"
                onClick={() => setAnchoTarjeta((a) => Math.max(120, a - 1))}
              >
                <Minus size={18} />
              </button>
              <input
                type="range"
                min={120}
                max={Math.max(360, anchoDisponible)}
                value={anchoTarjeta}
                onChange={(e) => setAnchoTarjeta(Number(e.target.value))}
                className="w-full accent-[#0b2bd6]"
                aria-label="Ancho del rectángulo"
              />
              <button
                type="button"
                aria-label="Agrandar"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ring-linea active:scale-90"
                onClick={() => setAnchoTarjeta((a) => Math.min(900, a + 1))}
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() => {
                  setPxPorMm(anchoTarjeta / ANCHO_TARJETA_MM);
                  anotar({ calibrada: true });
                  avanzar();
                }}
              >
                Listo, coincide
              </button>
              <button type="button" className="btn-outline flex-1" onClick={avanzar}>
                No tengo tarjeta
              </button>
            </div>
          </Tarjeta>
        )}

        {etapa.tipo === 'distancia' && (
          <Tarjeta>
            <Etiqueta>Paso 2 de 2</Etiqueta>
            <Titulo>¿Desde dónde lo hacés?</Titulo>
            <Parrafo>Quedate a esa distancia de la pantalla en las pruebas de lejos.</Parrafo>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { mm: 400, titulo: 'Celular o tablet', texto: 'A unos 40 cm, con el brazo casi estirado' },
                { mm: 1000, titulo: 'Computadora', texto: 'A 1 metro de la pantalla, un paso largo' },
              ].map((op, i) => (
                <button
                  key={op.mm}
                  type="button"
                  onClick={() => {
                    setDistanciaMm(op.mm);
                    avanzar();
                  }}
                  className="tv-aparece rounded-2xl p-5 text-left ring-1 ring-linea transition hover:-translate-y-0.5 hover:ring-cobalto active:scale-[0.98]"
                  style={retraso(i)}
                >
                  <span className="block text-lg font-semibold text-tinta">{op.titulo}</span>
                  <span className="mt-1 block text-[15px] text-pizarra">{op.texto}</span>
                </button>
              ))}
            </div>
          </Tarjeta>
        )}

        {etapa.tipo === 'tapar' && (
          <Tarjeta>
            <div className="flex justify-center">
              <OjoTapado ojo={etapa.ojo} />
            </div>
            <Titulo>Ahora el ojo {etapa.ojo}</Titulo>
            <Parrafo>
              Tapate el ojo {etapa.ojo === 'derecho' ? 'izquierdo' : 'derecho'} con la palma de la mano, sin apretar, y mantenelo tapado en
              las próximas tres pruebas. Volvé a {distanciaTexto} de la pantalla.
            </Parrafo>
            <button type="button" className="btn-cta mt-8" onClick={avanzar}>
              Listo, lo tapé
            </button>
          </Tarjeta>
        )}

        {etapa.tipo === 'lejos' && (
          <Tarjeta>
            <Etiqueta>Ojo {etapa.ojo} · De lejos</Etiqueta>
            <Titulo>La E se va a ir achicando</Titulo>
            <Parrafo>
              A {distanciaTexto}. Si no estás seguro, elegí la que te parezca; si no la ves, tocá “No la veo”. En la computadora también
              podés usar las flechas del teclado.
            </Parrafo>
            <div className="mt-8">
              <PruebaLetraE
                tamanos={agudezas.map(tamanoLejos)}
                etiquetaNivel={(i) => `Tamaño ${i + 1} de ${agudezas.length}`}
                alTerminar={(nivel, tope) => {
                  anotar({ lejos: { ...estado.lejos, [etapa.ojo]: { valor: nivel >= 0 ? agudezas[nivel] : 0, tope } } });
                  avanzar();
                }}
              />
            </div>
          </Tarjeta>
        )}

        {etapa.tipo === 'astigmatismo' && (
          <Tarjeta>
            <Etiqueta>Ojo {etapa.ojo} · Astigmatismo</Etiqueta>
            <Titulo>¿Todas las líneas se ven iguales?</Titulo>
            <Parrafo>Mirá el centro de la rueda. Fijate si alguna línea se ve más negra, más gruesa o más borrosa que las otras.</Parrafo>
            <div className="mt-8 flex justify-center">
              <RuedaAstigmatismo tamano={Math.min(anchoDisponible, 70 * escala, 320)} />
            </div>
            <BotonesSiNo
              si="Sí, todas iguales"
              no="No, algunas se ven distintas"
              alResponder={(bien) => {
                anotar({ astigmatismo: { ...estado.astigmatismo, [etapa.ojo]: bien } });
                avanzar();
              }}
            />
          </Tarjeta>
        )}

        {etapa.tipo === 'amsler' && (
          <Tarjeta>
            <Etiqueta>Ojo {etapa.ojo} · Rejilla de Amsler</Etiqueta>
            <Titulo>Mirá fijo el punto azul</Titulo>
            <Parrafo>A unos 40 cm. Sin mover la vista del punto: ¿las líneas se ven rectas, sin partes torcidas, borrosas o que falten?</Parrafo>
            <div className="mt-8 flex justify-center">
              <RejillaAmsler tamano={Math.min(anchoDisponible, 100 * escala, 340)} />
            </div>
            <BotonesSiNo
              si="Sí, se ven bien"
              no="No, veo algo raro"
              alResponder={(bien) => {
                anotar({ amsler: { ...estado.amsler, [etapa.ojo]: bien } });
                avanzar();
              }}
            />
          </Tarjeta>
        )}

        {etapa.tipo === 'ambos' && (
          <Tarjeta>
            <div className="flex justify-center">
              <OjoTapado ojo="ambos" />
            </div>
            <Titulo>Destapate el ojo</Titulo>
            <Parrafo>
              Las dos últimas pruebas son con los dos ojos. Primero el contraste: la E queda del mismo tamaño pero cada vez más clara. A{' '}
              {distanciaTexto}.
            </Parrafo>
            <button type="button" className="btn-cta mt-8" onClick={avanzar}>
              Seguir
            </button>
          </Tarjeta>
        )}

        {etapa.tipo === 'contraste' && (
          <Tarjeta>
            <Etiqueta>Los dos ojos · Contraste</Etiqueta>
            <Titulo>La E se va a ir aclarando</Titulo>
            <div className="mt-8">
              <PruebaLetraE
                tamanos={CONTRASTES.map(() => Math.max(tamanoLejos(0.25), 40))}
                colores={CONTRASTES.map(grisDeContraste)}
                etiquetaNivel={(i) => `Contraste ${i + 1} de ${CONTRASTES.length}`}
                alTerminar={(nivel) => {
                  anotar({ contraste: nivel >= 0 ? CONTRASTES[nivel] : 1 });
                  avanzar();
                }}
              />
            </div>
          </Tarjeta>
        )}

        {etapa.tipo === 'acercar' && (
          <Tarjeta>
            <div className="flex justify-center">
              <DistanciaCelular texto="40 cm" />
            </div>
            <Etiqueta>Los dos ojos · De cerca</Etiqueta>
            <Titulo>Acercá la pantalla a 40 cm</Titulo>
            <Parrafo>
              Como cuando leés el celular. Si usás lentes para leer, ponételos. Vas a ver una palabra cada vez más chica y tenés que elegir
              cuál es.
            </Parrafo>
            <button type="button" className="btn-cta mt-8" onClick={avanzar}>
              Estoy a 40 cm
            </button>
          </Tarjeta>
        )}

        {etapa.tipo === 'cerca' && (
          <Tarjeta>
            <Etiqueta>Los dos ojos · De cerca</Etiqueta>
            <Titulo>¿Qué palabra dice?</Titulo>
            <div className="mt-8">
              <PruebaLectura
                tamanosPx={puntosCerca.map((p) => p * MM_POR_PUNTO * escala)}
                etiquetaNivel={(i) => `Letra ${i + 1} de ${puntosCerca.length}`}
                alTerminar={(nivel) => {
                  anotar({ cerca: nivel >= 0 ? puntosCerca[nivel] : null });
                  avanzar();
                }}
              />
            </div>
          </Tarjeta>
        )}

        {etapa.tipo === 'resultado' && (
          <Resultado respuestas={{ ...estado, maximoLejos: agudezas[agudezas.length - 1] ?? 1 }} alRepetir={reiniciar} />
        )}
      </div>
    </div>
  );
}
