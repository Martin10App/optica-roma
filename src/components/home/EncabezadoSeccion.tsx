import type { ReactNode } from 'react';

type Props = {
  titulo: ReactNode;
  bajada?: ReactNode;
  /** Link o botón a la derecha del título (en el celular queda abajo) */
  accion?: ReactNode;
  idTitulo?: string;
  claro?: boolean;
};

// El mismo encabezado en todas las secciones de la portada: título grande a la
// izquierda, una línea de contexto y, si hace falta, un link a la derecha.
export default function EncabezadoSeccion({ titulo, bajada, accion, idTitulo, claro }: Props) {
  return (
    <div data-aparecer className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="max-w-2xl">
        <h2 id={idTitulo} className={`titular text-3xl md:text-5xl ${claro ? 'text-white' : 'text-tinta'}`}>
          {titulo}
        </h2>
        {bajada && (
          <p className={`mt-4 text-lg leading-relaxed ${claro ? 'text-white/70' : 'text-pizarra'}`}>{bajada}</p>
        )}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}
