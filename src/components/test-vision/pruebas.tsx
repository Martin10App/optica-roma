'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { LetraE, type Direccion } from './dibujos';

// Las dos pruebas con respuesta (letra E y lectura de cerca) usan la misma
// escalera: un nivel se pasa con 2 aciertos y la prueba termina con 2 errores.
// "No la veo" cuenta como error. Devuelven el último nivel aprobado (-1 si ninguno).

function useEscalera(niveles: number, alTerminar: (nivelAprobado: number, llegoAlUltimo: boolean) => void) {
  const [nivel, setNivel] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [intento, setIntento] = useState(0);

  const responder = (bien: boolean) => {
    const a = aciertos + (bien ? 1 : 0);
    const e = errores + (bien ? 0 : 1);
    if (a >= 2) {
      if (nivel === niveles - 1) return alTerminar(nivel, true);
      setNivel(nivel + 1);
      setAciertos(0);
      setErrores(0);
    } else if (e >= 2) {
      return alTerminar(nivel - 1, false);
    } else {
      setAciertos(a);
      setErrores(e);
    }
    setIntento((n) => n + 1);
  };

  return { nivel, intento, responder };
}

/** Barra de niveles: se llena a medida que la letra se achica */
function Niveles({ total, actual, etiqueta }: { total: number; actual: number; etiqueta: string }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-5 rounded-full transition-colors duration-300 ${i < actual ? 'bg-cobalto' : i === actual ? 'bg-cobalto/40' : 'bg-linea'}`}
          />
        ))}
      </div>
      <span className="text-sm tabular-nums text-pizarra">{etiqueta}</span>
    </div>
  );
}

function BotonRespuesta({
  onClick,
  etiqueta,
  destello,
  className = '',
  children,
}: {
  onClick: () => void;
  etiqueta?: string;
  destello: number | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      className={`relative overflow-hidden rounded-full bg-white text-tinta ring-1 ring-linea transition duration-150 hover:ring-cobalto active:scale-95 ${className}`}
    >
      {/* se ilumina un instante al tocarlo: confirma que la respuesta entró */}
      {destello !== null && <span key={destello} className="tv-destello pointer-events-none absolute inset-0 rounded-full" />}
      <span className="relative flex h-full w-full items-center justify-center">{children}</span>
    </button>
  );
}

const DIRECCIONES: Direccion[] = ['arriba', 'derecha', 'abajo', 'izquierda'];
const PAUSA_RESPUESTA_MS = 220;
const azar = <T,>(lista: T[], salvo?: T) => {
  const opciones = lista.filter((x) => x !== salvo);
  return opciones[Math.floor(Math.random() * opciones.length)];
};

export function PruebaLetraE({
  tamanos,
  colores,
  etiquetaNivel,
  alTerminar,
}: {
  tamanos: number[];
  colores?: string[];
  etiquetaNivel: (i: number) => string;
  alTerminar: (nivelAprobado: number, llegoAlUltimo: boolean) => void;
}) {
  const { nivel, intento, responder } = useEscalera(tamanos.length, alTerminar);
  const [direccion, setDireccion] = useState<Direccion>(() => azar(DIRECCIONES));
  const [tocado, setTocado] = useState<{ cual: Direccion | 'nada'; n: number } | null>(null);

  // Se deja ver el destello del botón un instante antes de pasar a la letra siguiente
  const bloqueado = useRef(false);
  const elegir = (cual: Direccion | null) => {
    if (bloqueado.current) return;
    bloqueado.current = true;
    setTocado({ cual: cual ?? 'nada', n: Date.now() });
    const bien = cual === direccion;
    setTimeout(() => {
      bloqueado.current = false;
      responder(bien);
      setDireccion((d) => azar(DIRECCIONES, d));
    }, PAUSA_RESPUESTA_MS);
  };

  const elegirRef = useRef(elegir);
  elegirRef.current = elegir;
  useEffect(() => {
    const teclas: Record<string, Direccion> = { ArrowUp: 'arriba', ArrowDown: 'abajo', ArrowLeft: 'izquierda', ArrowRight: 'derecha' };
    const alTeclear = (e: KeyboardEvent) => {
      const d = teclas[e.key];
      if (!d) return;
      e.preventDefault();
      elegirRef.current(d);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, []);

  const destello = (cual: Direccion | 'nada') => (tocado?.cual === cual ? tocado.n : null);
  const clase = 'h-14 w-14 sm:h-16 sm:w-16';

  return (
    <div>
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-white ring-1 ring-linea sm:min-h-[260px]">
        <div key={intento} className="tv-pop">
          <LetraE tamano={tamanos[nivel]} direccion={direccion} color={colores?.[nivel]} />
        </div>
      </div>
      <Niveles total={tamanos.length} actual={nivel} etiqueta={etiquetaNivel(nivel)} />

      <p className="mt-6 text-center font-semibold text-tinta">¿Hacia dónde apuntan las patas de la E?</p>
      <div className="mx-auto mt-4 grid w-fit grid-cols-3 gap-3">
        <span />
        <BotonRespuesta etiqueta="Arriba" onClick={() => elegir('arriba')} destello={destello('arriba')} className={clase}>
          <ArrowUp size={24} />
        </BotonRespuesta>
        <span />
        <BotonRespuesta etiqueta="Izquierda" onClick={() => elegir('izquierda')} destello={destello('izquierda')} className={clase}>
          <ArrowLeft size={24} />
        </BotonRespuesta>
        <BotonRespuesta onClick={() => elegir(null)} destello={destello('nada')} className={`${clase} text-xs font-semibold text-pizarra`}>
          No la veo
        </BotonRespuesta>
        <BotonRespuesta etiqueta="Derecha" onClick={() => elegir('derecha')} destello={destello('derecha')} className={clase}>
          <ArrowRight size={24} />
        </BotonRespuesta>
        <span />
        <BotonRespuesta etiqueta="Abajo" onClick={() => elegir('abajo')} destello={destello('abajo')} className={clase}>
          <ArrowDown size={24} />
        </BotonRespuesta>
        <span />
      </div>
    </div>
  );
}

// Grupos de palabras que se parecen: para acertar hay que poder leerla, no adivinarla
const GRUPOS = [
  ['casa', 'cosa', 'caja', 'cama'],
  ['mesa', 'masa', 'misa', 'musa'],
  ['pato', 'palo', 'paso', 'pavo'],
  ['luna', 'lana', 'lona', 'lima'],
  ['vela', 'vena', 'velo', 'vale'],
  ['rosa', 'ropa', 'roca', 'rota'],
  ['mano', 'mago', 'malo', 'mapa'],
  ['pera', 'pena', 'pesa', 'peña'],
  ['nube', 'nuca', 'nudo', 'nulo'],
  ['sopa', 'soga', 'sola', 'soda'],
];

const mezclar = <T,>(lista: T[]) => [...lista].sort(() => Math.random() - 0.5);

/** Lectura de cerca: una palabra en letra chica y cuatro opciones parecidas */
export function PruebaLectura({
  tamanosPx,
  etiquetaNivel,
  alTerminar,
}: {
  tamanosPx: number[];
  etiquetaNivel: (i: number) => string;
  alTerminar: (nivelAprobado: number, llegoAlUltimo: boolean) => void;
}) {
  const { nivel, intento, responder } = useEscalera(tamanosPx.length, alTerminar);
  const [tocado, setTocado] = useState<{ cual: string; n: number } | null>(null);

  // Una palabra nueva en cada intento, sin repetir el grupo anterior
  const ultimoGrupo = useRef(-1);
  const pregunta = useMemo(() => {
    let g = Math.floor(Math.random() * GRUPOS.length);
    if (g === ultimoGrupo.current) g = (g + 1) % GRUPOS.length;
    ultimoGrupo.current = g;
    const palabras = GRUPOS[g];
    return { palabra: palabras[Math.floor(Math.random() * palabras.length)], opciones: mezclar(palabras) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intento]);

  const bloqueado = useRef(false);
  const elegir = (cual: string | null) => {
    if (bloqueado.current) return;
    bloqueado.current = true;
    setTocado({ cual: cual ?? 'nada', n: Date.now() });
    const bien = cual === pregunta.palabra;
    setTimeout(() => {
      bloqueado.current = false;
      responder(bien);
    }, PAUSA_RESPUESTA_MS);
  };

  return (
    <div>
      <div className="flex min-h-[160px] items-center justify-center rounded-2xl bg-white ring-1 ring-linea">
        <p key={intento} className="tv-pop select-none font-medium text-tinta" style={{ fontSize: tamanosPx[nivel], lineHeight: 1.2 }}>
          {pregunta.palabra}
        </p>
      </div>
      <Niveles total={tamanosPx.length} actual={nivel} etiqueta={etiquetaNivel(nivel)} />

      <p className="mt-6 text-center font-semibold text-tinta">¿Qué palabra dice?</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {pregunta.opciones.map((op) => (
          <BotonRespuesta key={`${intento}-${op}`} onClick={() => elegir(op)} destello={tocado?.cual === op ? tocado.n : null} className="h-14 text-lg">
            {op}
          </BotonRespuesta>
        ))}
      </div>
      <div className="mt-3 flex justify-center">
        <BotonRespuesta onClick={() => elegir(null)} destello={tocado?.cual === 'nada' ? tocado.n : null} className="h-12 px-6 text-sm font-semibold text-pizarra">
          No la puedo leer
        </BotonRespuesta>
      </div>
    </div>
  );
}
