'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Minus, Plus, RotateCcw } from 'lucide-react';

// Test de visión orientativo, hecho por Óptica Roma con pruebas clásicas de uso
// libre: letra E girada (agudeza), rueda de líneas (astigmatismo), rejilla de
// Amsler y contraste. Todo corre en el navegador: no se guarda ni se envía nada.
//
// Los tamaños salen de la medida real de la pantalla (se calibra con una
// tarjeta) y de la distancia elegida: la E de una agudeza 10/10 ocupa 5 minutos
// de arco a esa distancia.

const WHATSAPP = 'https://wa.me/598098871673?text=';
const ANCHO_TARJETA_MM = 85.6; // tarjetas de crédito, débito y la cédula uruguaya (formato ID-1)
const ALTO_TARJETA_MM = 53.98;
const MINUTO_RAD = Math.PI / (180 * 60);

const AGUDEZAS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0];
const CONTRASTES = [0.5, 0.25, 0.125, 0.063, 0.031, 0.016];

type Ojo = 'derecho' | 'izquierdo';
type Direccion = 'arriba' | 'abajo' | 'izquierda' | 'derecha';

type Etapa =
  | { tipo: 'inicio' }
  | { tipo: 'calibrar' }
  | { tipo: 'distancia' }
  | { tipo: 'tapar'; ojo: Ojo }
  | { tipo: 'agudeza'; ojo: Ojo }
  | { tipo: 'astigmatismo'; ojo: Ojo }
  | { tipo: 'amsler'; ojo: Ojo }
  | { tipo: 'ambos' }
  | { tipo: 'contraste' }
  | { tipo: 'resultado' };

const ETAPAS: Etapa[] = [
  { tipo: 'inicio' },
  { tipo: 'calibrar' },
  { tipo: 'distancia' },
  { tipo: 'tapar', ojo: 'derecho' },
  { tipo: 'agudeza', ojo: 'derecho' },
  { tipo: 'astigmatismo', ojo: 'derecho' },
  { tipo: 'amsler', ojo: 'derecho' },
  { tipo: 'tapar', ojo: 'izquierdo' },
  { tipo: 'agudeza', ojo: 'izquierdo' },
  { tipo: 'astigmatismo', ojo: 'izquierdo' },
  { tipo: 'amsler', ojo: 'izquierdo' },
  { tipo: 'ambos' },
  { tipo: 'contraste' },
  { tipo: 'resultado' },
];

type Resultados = {
  agudeza: Partial<Record<Ojo, { valor: number; tope: boolean }>>;
  astigmatismo: Partial<Record<Ojo, boolean>>;
  amsler: Partial<Record<Ojo, boolean>>;
  contraste?: number;
  calibrada: boolean;
};

const DIRECCIONES: Direccion[] = ['arriba', 'derecha', 'abajo', 'izquierda'];

function direccionAlAzar(anterior?: Direccion): Direccion {
  const opciones = DIRECCIONES.filter((d) => d !== anterior);
  return opciones[Math.floor(Math.random() * opciones.length)];
}

const decimo = (a: number) => `${Math.round(a * 10)}/10`;

/** Letra E de 5×5 módulos con las patas hacia la derecha, girada según la dirección */
function LetraE({ tamano, direccion, color = '#10152b' }: { tamano: number; direccion: Direccion; color?: string }) {
  const giro = { derecha: 0, abajo: 90, izquierda: 180, arriba: 270 }[direccion];
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 5 5"
      style={{ transform: `rotate(${giro}deg)` }}
      aria-label="Letra E"
      role="img"
    >
      <path d="M0 0H5V1H1V2H5V3H1V4H5V5H0Z" fill={color} />
    </svg>
  );
}

function Tarjeta({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl bg-white p-6 ring-1 ring-linea sm:p-10">{children}</div>;
}

function Titulo({ children }: { children: ReactNode }) {
  return <h2 className="titular text-3xl text-tinta sm:text-4xl">{children}</h2>;
}

function Parrafo({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-lg leading-relaxed text-pizarra">{children}</p>;
}

// ───────────────────────── pruebas con la letra E ─────────────────────────

type PruebaE = {
  /** tamaño en px de cada nivel */
  tamanos: number[];
  colores?: string[];
  alTerminar: (nivelAprobado: number, llegoAlUltimo: boolean) => void;
  etiquetaNivel: (i: number) => string;
};

/**
 * Escalera simple: se pasa un nivel con 2 aciertos y se corta con 2 errores.
 * "No la veo" cuenta como error. Devuelve el último nivel aprobado (-1 si ninguno).
 */
function PruebaLetraE({ tamanos, colores, alTerminar, etiquetaNivel }: PruebaE) {
  const [nivel, setNivel] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [direccion, setDireccion] = useState<Direccion>(() => direccionAlAzar());
  const [parpadeo, setParpadeo] = useState(0);

  const responder = (respuesta: Direccion | null) => {
    const bien = respuesta === direccion;
    const nuevosAciertos = aciertos + (bien ? 1 : 0);
    const nuevosErrores = errores + (bien ? 0 : 1);
    if (nuevosAciertos >= 2) {
      if (nivel === tamanos.length - 1) return alTerminar(nivel, true);
      setNivel(nivel + 1);
      setAciertos(0);
      setErrores(0);
    } else if (nuevosErrores >= 2) {
      return alTerminar(nivel - 1, false);
    } else {
      setAciertos(nuevosAciertos);
      setErrores(nuevosErrores);
    }
    setDireccion(direccionAlAzar(direccion));
    setParpadeo((p) => p + 1);
  };

  useEffect(() => {
    const teclas: Record<string, Direccion> = {
      ArrowUp: 'arriba',
      ArrowDown: 'abajo',
      ArrowLeft: 'izquierda',
      ArrowRight: 'derecha',
    };
    const alTeclear = (e: KeyboardEvent) => {
      const d = teclas[e.key];
      if (!d) return;
      e.preventDefault();
      responder(d);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  });

  const boton = 'flex h-14 w-14 items-center justify-center rounded-full bg-white text-tinta ring-1 ring-linea transition hover:ring-cobalto active:bg-vidrio sm:h-16 sm:w-16';

  return (
    <div>
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-white ring-1 ring-linea sm:min-h-[260px]">
        {/* key: cada letra nueva aparece de cero, así se nota que cambió */}
        <div key={parpadeo} className="animate-fade-in">
          <LetraE tamano={tamanos[nivel]} direccion={direccion} color={colores?.[nivel]} />
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-pizarra">{etiquetaNivel(nivel)}</p>

      <p className="mt-6 text-center font-semibold text-tinta">¿Hacia dónde apuntan las patas de la E?</p>
      <div className="mx-auto mt-4 grid w-fit grid-cols-3 gap-3">
        <span />
        <button type="button" className={boton} onClick={() => responder('arriba')} aria-label="Arriba">
          <ArrowUp size={24} />
        </button>
        <span />
        <button type="button" className={boton} onClick={() => responder('izquierda')} aria-label="Izquierda">
          <ArrowLeft size={24} />
        </button>
        <button
          type="button"
          onClick={() => responder(null)}
          className="flex h-14 w-14 items-center justify-center rounded-full text-xs font-semibold text-pizarra ring-1 ring-linea transition hover:text-tinta sm:h-16 sm:w-16"
        >
          No la veo
        </button>
        <button type="button" className={boton} onClick={() => responder('derecha')} aria-label="Derecha">
          <ArrowRight size={24} />
        </button>
        <span />
        <button type="button" className={boton} onClick={() => responder('abajo')} aria-label="Abajo">
          <ArrowDown size={24} />
        </button>
        <span />
      </div>
    </div>
  );
}

// ───────────────────────── dibujos ─────────────────────────

function RuedaAstigmatismo({ tamano }: { tamano: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="-50 -50 100 100" role="img" aria-label="Rueda de líneas para astigmatismo">
      {Array.from({ length: 12 }, (_, i) => {
        const angulo = (i * 15 * Math.PI) / 180;
        const x = Math.cos(angulo) * 46;
        const y = Math.sin(angulo) * 46;
        return <line key={i} x1={-x} y1={-y} x2={x} y2={y} stroke="#10152b" strokeWidth={1.6} />;
      })}
      <circle r={5} fill="white" />
    </svg>
  );
}

function RejillaAmsler({ tamano }: { tamano: number }) {
  const celdas = 20;
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 100 100" role="img" aria-label="Rejilla de Amsler">
      <rect width="100" height="100" fill="white" stroke="#10152b" strokeWidth="0.8" />
      {Array.from({ length: celdas - 1 }, (_, i) => {
        const p = ((i + 1) * 100) / celdas;
        return (
          <g key={i}>
            <line x1={p} y1={0} x2={p} y2={100} stroke="#10152b" strokeWidth="0.35" />
            <line x1={0} y1={p} x2={100} y2={p} stroke="#10152b" strokeWidth="0.35" />
          </g>
        );
      })}
      <circle cx="50" cy="50" r="1.6" fill="#0b2bd6" />
    </svg>
  );
}

function OjoTapado({ ojo }: { ojo: Ojo }) {
  // Como en un espejo: a la izquierda del dibujo el ojo izquierdo. El que no se prueba queda tapado.
  const ojos: Ojo[] = ['izquierdo', 'derecho'];
  return (
    <svg width="200" height="96" viewBox="0 0 200 96" aria-hidden>
      {ojos.map((cual, i) => {
        const cx = 50 + i * 100;
        const tapado = cual !== ojo;
        return (
          <g key={cual}>
            <ellipse cx={cx} cy="36" rx="32" ry="19" fill="white" stroke="#10152b" strokeWidth="2.5" />
            <circle cx={cx} cy="36" r="9" fill="#0b2bd6" />
            {tapado && <rect x={cx - 38} y="8" width="76" height="56" rx="24" fill="#dde1ea" stroke="#5b6177" strokeWidth="2" />}
            <text x={cx} y="88" textAnchor="middle" fontSize="13" fill={tapado ? '#5b6177' : '#10152b'} fontWeight={tapado ? 400 : 700}>
              {tapado ? 'tapado' : cual}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function BotonesSiNo({ si, no, alResponder }: { si: string; no: string; alResponder: (bien: boolean) => void }) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <button type="button" className="btn-primary flex-1" onClick={() => alResponder(true)}>
        {si}
      </button>
      <button type="button" className="btn-outline flex-1" onClick={() => alResponder(false)}>
        {no}
      </button>
    </div>
  );
}

// ───────────────────────── test completo ─────────────────────────

const resultadosVacios = (): Resultados => ({ agudeza: {}, astigmatismo: {}, amsler: {}, calibrada: false });

export default function TestVision() {
  const [paso, setPaso] = useState(0);
  const [pxPorMm, setPxPorMm] = useState<number | null>(null);
  const [anchoTarjeta, setAnchoTarjeta] = useState(320);
  const [distanciaMm, setDistanciaMm] = useState(400);
  const [resultados, setResultados] = useState<Resultados>(resultadosVacios);
  const [anchoDisponible, setAnchoDisponible] = useState(600);

  const etapa = ETAPAS[paso];
  const avanzar = () => {
    setPaso((p) => Math.min(p + 1, ETAPAS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const medir = () => setAnchoDisponible(Math.min(window.innerWidth - 80, 620));
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  // Punto de partida de la tarjeta: 96 px por pulgada en computadora, más en celular
  useEffect(() => {
    const celular = window.matchMedia('(pointer: coarse)').matches;
    const estimado = celular ? 6.2 : 96 / 25.4;
    setAnchoTarjeta(Math.round(estimado * ANCHO_TARJETA_MM));
    setDistanciaMm(celular ? 400 : 1000);
  }, []);

  const escala = pxPorMm ?? anchoTarjeta / ANCHO_TARJETA_MM;

  const tamanoDeAgudeza = (agudeza: number) => distanciaMm * Math.tan((5 * MINUTO_RAD) / agudeza) * escala;

  // Solo los niveles que la pantalla puede dibujar con nitidez (cada trazo de la E ≥ 1,2 píxeles reales)
  const agudezas = useMemo(() => {
    const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
    return AGUDEZAS.filter((a) => (tamanoDeAgudeza(a) / 5) * dpr >= 1.2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escala, distanciaMm]);

  const reiniciar = () => {
    setResultados(resultadosVacios());
    setPxPorMm(null);
    setPaso(0);
  };

  return (
    <div className="mx-auto max-w-2xl">
      {paso > 0 && etapa.tipo !== 'resultado' && (
        <div className="mb-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-linea">
            <div
              className="h-full rounded-full bg-cobalto transition-[width] duration-500"
              style={{ width: `${(paso / (ETAPAS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {etapa.tipo === 'inicio' && (
        <Tarjeta>
          <p className="text-sm font-semibold text-cobalto">Gratis · 3 minutos · sin registrarte</p>
          <Titulo>¿Cómo está tu vista?</Titulo>
          <Parrafo>
            Cuatro pruebas rápidas para saber si conviene consultar con un médico oftalmólogo: letras, astigmatismo, rejilla
            de Amsler y contraste.
          </Parrafo>
          <ul className="mt-6 space-y-2 text-[15px] text-tinta">
            <li>• Si usás lentes para ver de lejos, dejátelos puestos.</li>
            <li>• Buena luz, y el brillo de la pantalla alto.</li>
            <li>• Vas a necesitar una tarjeta (de crédito, débito o la cédula) para medir la pantalla.</li>
          </ul>
          <p className="mt-6 rounded-2xl bg-papel p-4 text-sm leading-relaxed text-pizarra">
            Es una prueba orientativa: no reemplaza el control con un médico oftalmólogo ni sirve para hacer una receta. No
            guardamos tus respuestas.
          </p>
          <button type="button" className="btn-cta mt-8 w-full sm:w-auto" onClick={avanzar}>
            Empezar el test
          </button>
        </Tarjeta>
      )}

      {etapa.tipo === 'calibrar' && (
        <Tarjeta>
          <Titulo>Medí tu pantalla</Titulo>
          <Parrafo>
            Apoyá una tarjeta sobre la pantalla, encima del rectángulo azul, y ajustalo hasta que tenga el mismo ancho que la
            tarjeta.
          </Parrafo>
          <div className="mt-8 flex justify-center overflow-hidden">
            <div
              className="rounded-[4%/6%] bg-cobalto shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)]"
              style={{ width: anchoTarjeta, height: anchoTarjeta * (ALTO_TARJETA_MM / ANCHO_TARJETA_MM) }}
            />
          </div>
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              aria-label="Achicar"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ring-linea"
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
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ring-linea"
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
                setResultados((r) => ({ ...r, calibrada: true }));
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
          <Titulo>¿Desde dónde lo hacés?</Titulo>
          <Parrafo>Quedate a esa distancia de la pantalla durante las pruebas de letras.</Parrafo>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              { mm: 400, titulo: 'Celular o tablet', texto: 'A unos 40 cm, con el brazo casi estirado' },
              { mm: 1000, titulo: 'Computadora', texto: 'A 1 metro de la pantalla, un paso largo' },
            ].map((op) => (
              <button
                key={op.mm}
                type="button"
                onClick={() => {
                  setDistanciaMm(op.mm);
                  avanzar();
                }}
                className="rounded-2xl p-5 text-left ring-1 ring-linea transition hover:ring-cobalto"
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
            Tapate el ojo {etapa.ojo === 'derecho' ? 'izquierdo' : 'derecho'} con la palma de la mano, sin apretar, y mantenelo
            tapado en las próximas tres pruebas.
          </Parrafo>
          <button type="button" className="btn-cta mt-8" onClick={avanzar}>
            Seguir
          </button>
        </Tarjeta>
      )}

      {etapa.tipo === 'agudeza' && (
        <Tarjeta key={`agudeza-${etapa.ojo}`}>
          <p className="text-sm font-semibold text-cobalto">Ojo {etapa.ojo} · Letras</p>
          <Titulo>La E se va a ir achicando</Titulo>
          <Parrafo>
            A {distanciaMm === 400 ? '40 cm' : '1 metro'} de la pantalla. Si no estás seguro, elegí igual la que te parezca; si
            no la ves, tocá “No la veo”.
          </Parrafo>
          <div className="mt-8">
            <PruebaLetraE
              tamanos={agudezas.map(tamanoDeAgudeza)}
              etiquetaNivel={(i) => `Tamaño ${i + 1} de ${agudezas.length}`}
              alTerminar={(nivel, tope) => {
                setResultados((r) => ({
                  ...r,
                  agudeza: { ...r.agudeza, [etapa.ojo]: { valor: nivel >= 0 ? agudezas[nivel] : 0, tope } },
                }));
                avanzar();
              }}
            />
          </div>
        </Tarjeta>
      )}

      {etapa.tipo === 'astigmatismo' && (
        <Tarjeta key={`astig-${etapa.ojo}`}>
          <p className="text-sm font-semibold text-cobalto">Ojo {etapa.ojo} · Astigmatismo</p>
          <Titulo>¿Todas las líneas se ven iguales?</Titulo>
          <Parrafo>Mirá el centro de la rueda. Fijate si alguna línea se ve más negra, más gruesa o más borrosa que las otras.</Parrafo>
          <div className="mt-8 flex justify-center">
            <RuedaAstigmatismo tamano={Math.min(anchoDisponible, 70 * escala, 320)} />
          </div>
          <BotonesSiNo
            si="Sí, todas iguales"
            no="No, algunas se ven distintas"
            alResponder={(bien) => {
              setResultados((r) => ({ ...r, astigmatismo: { ...r.astigmatismo, [etapa.ojo]: bien } }));
              avanzar();
            }}
          />
        </Tarjeta>
      )}

      {etapa.tipo === 'amsler' && (
        <Tarjeta key={`amsler-${etapa.ojo}`}>
          <p className="text-sm font-semibold text-cobalto">Ojo {etapa.ojo} · Rejilla de Amsler</p>
          <Titulo>Mirá fijo el punto azul</Titulo>
          <Parrafo>
            A unos 40 cm. Sin mover la vista del punto: ¿las líneas se ven rectas, sin partes torcidas, borrosas o que falten?
          </Parrafo>
          <div className="mt-8 flex justify-center">
            <RejillaAmsler tamano={Math.min(anchoDisponible, 100 * escala, 340)} />
          </div>
          <BotonesSiNo
            si="Sí, se ven bien"
            no="No, veo algo raro"
            alResponder={(bien) => {
              setResultados((r) => ({ ...r, amsler: { ...r.amsler, [etapa.ojo]: bien } }));
              avanzar();
            }}
          />
        </Tarjeta>
      )}

      {etapa.tipo === 'ambos' && (
        <Tarjeta>
          <Titulo>Destapate el ojo</Titulo>
          <Parrafo>
            La última prueba es con los dos ojos: la E queda del mismo tamaño pero cada vez más clara. Volvé a la distancia de
            antes ({distanciaMm === 400 ? '40 cm' : '1 metro'}).
          </Parrafo>
          <button type="button" className="btn-cta mt-8" onClick={avanzar}>
            Seguir
          </button>
        </Tarjeta>
      )}

      {etapa.tipo === 'contraste' && (
        <Tarjeta>
          <p className="text-sm font-semibold text-cobalto">Los dos ojos · Contraste</p>
          <Titulo>La E se va a ir aclarando</Titulo>
          <div className="mt-8">
            <PruebaLetraE
              tamanos={CONTRASTES.map(() => Math.max(tamanoDeAgudeza(0.25), 40))}
              colores={CONTRASTES.map(grisDeContraste)}
              etiquetaNivel={(i) => `Contraste ${i + 1} de ${CONTRASTES.length}`}
              alTerminar={(nivel) => {
                setResultados((r) => ({ ...r, contraste: nivel >= 0 ? CONTRASTES[nivel] : 1 }));
                avanzar();
              }}
            />
          </div>
        </Tarjeta>
      )}

      {etapa.tipo === 'resultado' && <Resultado resultados={resultados} maximo={agudezas[agudezas.length - 1]} alRepetir={reiniciar} />}
    </div>
  );
}

/** Gris sRGB de una letra con ese contraste sobre fondo blanco */
function grisDeContraste(contraste: number) {
  const lineal = 1 - contraste;
  const srgb = lineal <= 0.0031308 ? 12.92 * lineal : 1.055 * Math.pow(lineal, 1 / 2.4) - 0.055;
  const v = Math.round(srgb * 255);
  return `rgb(${v},${v},${v})`;
}

// ───────────────────────── resultado ─────────────────────────

type Fila = { prueba: string; detalle: string; bien: boolean };

function Resultado({ resultados, maximo, alRepetir }: { resultados: Resultados; maximo: number; alRepetir: () => void }) {
  const filas: Fila[] = [];

  (['derecho', 'izquierdo'] as Ojo[]).forEach((ojo) => {
    const a = resultados.agudeza[ojo];
    if (!a) return;
    const bien = a.valor >= 0.8 || (a.tope && a.valor >= maximo);
    filas.push({
      prueba: `Letras, ojo ${ojo}`,
      detalle:
        a.valor === 0
          ? 'No llegaste a ver la letra más grande.'
          : `Viste hasta ${decimo(a.valor)}${a.tope && maximo < 1 ? ', el tamaño más chico que permite tu pantalla a esa distancia' : ''}.`,
      bien,
    });
  });

  const d = resultados.agudeza.derecho?.valor ?? 0;
  const i = resultados.agudeza.izquierdo?.valor ?? 0;
  if (Math.abs(AGUDEZAS.indexOf(d) - AGUDEZAS.indexOf(i)) >= 2) {
    filas.push({ prueba: 'Diferencia entre ojos', detalle: 'Un ojo vio bastante menos que el otro.', bien: false });
  }

  (['derecho', 'izquierdo'] as Ojo[]).forEach((ojo) => {
    const valor = resultados.astigmatismo[ojo];
    if (valor === undefined) return;
    filas.push({
      prueba: `Astigmatismo, ojo ${ojo}`,
      detalle: valor ? 'Todas las líneas se vieron iguales.' : 'Algunas líneas se vieron distintas: puede ser astigmatismo.',
      bien: valor,
    });
  });

  (['derecho', 'izquierdo'] as Ojo[]).forEach((ojo) => {
    const valor = resultados.amsler[ojo];
    if (valor === undefined) return;
    filas.push({
      prueba: `Rejilla de Amsler, ojo ${ojo}`,
      detalle: valor ? 'Las líneas se vieron rectas.' : 'Viste líneas torcidas, borrosas o que faltaban.',
      bien: valor,
    });
  });

  if (resultados.contraste !== undefined) {
    const c = resultados.contraste;
    filas.push({
      prueba: 'Contraste',
      detalle: c >= 1 ? 'No llegaste a ver la primera letra clara.' : `Viste letras hasta un ${Math.round(c * 1000) / 10}% de contraste.`,
      bien: c <= 0.063,
    });
  }

  const todoBien = filas.every((f) => f.bien);
  const amslerMal = resultados.amsler.derecho === false || resultados.amsler.izquierdo === false;
  const mensaje = encodeURIComponent(
    todoBien
      ? 'Hola! Hice el test de visión en la web y quiero hacer una consulta.'
      : 'Hola! Hice el test de visión en la web y me recomendó consultar con un oftalmólogo. ¿Cómo coordino la consulta?'
  );

  return (
    <Tarjeta>
      <p className="text-sm font-semibold text-cobalto">Resultado orientativo</p>
      <Titulo>{todoBien ? 'Tu vista respondió bien en este test' : 'Te recomendamos consultar con un oftalmólogo'}</Titulo>
      <Parrafo>
        {todoBien
          ? 'Igual es bueno hacerse un control con el médico oftalmólogo cada tanto, y antes si notás cambios en tu vista.'
          : amslerMal
            ? 'Algunas respuestas conviene revisarlas con un médico oftalmólogo, sobre todo lo que viste en la rejilla. Si no tenés receta, te derivamos.'
            : 'Algunas respuestas conviene revisarlas con un médico oftalmólogo. Si no tenés receta, te derivamos.'}
      </Parrafo>

      <ul className="mt-8 divide-y divide-linea rounded-2xl ring-1 ring-linea">
        {filas.map((f) => (
          <li key={f.prueba} className="flex items-start gap-4 p-4">
            <span
              aria-hidden
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${f.bien ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
            <span>
              <span className="block font-semibold text-tinta">{f.prueba}</span>
              <span className="text-[15px] text-pizarra">{f.detalle}</span>
            </span>
          </li>
        ))}
      </ul>

      {!resultados.calibrada && (
        <p className="mt-4 text-sm text-pizarra">
          No mediste la pantalla con una tarjeta: el resultado de las letras es aproximado.
        </p>
      )}

      <p className="mt-6 rounded-2xl bg-papel p-4 text-sm leading-relaxed text-pizarra">
        Este test no reemplaza el control con un médico oftalmólogo ni sirve para hacer una receta. Depende de tu pantalla, de la
        luz y de la distancia. No guardamos tus respuestas.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a href={WHATSAPP + mensaje} target="_blank" rel="noopener noreferrer" className="btn-cta">
          {todoBien ? 'Consultanos por WhatsApp' : 'Coordinar la consulta'}
        </a>
        <Link href="/catalogo" className="btn-outline">
          Ver armazones
        </Link>
        <button type="button" onClick={alRepetir} className="btn-outline">
          <RotateCcw size={16} aria-hidden />
          Repetir el test
        </button>
      </div>
    </Tarjeta>
  );
}
