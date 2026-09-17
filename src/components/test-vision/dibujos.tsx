import type { CSSProperties } from 'react';
import type { Diagrama, Ojo } from './analisis';

// Dibujos del test de visión. Todos son SVG propios; las animaciones están en
// globals.css (sección "Test de visión") y se apagan con "reducir movimiento".

const TINTA = '#10152b';
const COBALTO = '#0b2bd6';
const LINEA = '#dde1ea';
const PIZARRA = '#5b6177';

export type Direccion = 'arriba' | 'abajo' | 'izquierda' | 'derecha';

/** Letra E de 5×5 módulos con las patas hacia la derecha, girada según la dirección */
export function LetraE({ tamano, direccion, color = TINTA }: { tamano: number; direccion: Direccion; color?: string }) {
  const giro = { derecha: 0, abajo: 90, izquierda: 180, arriba: 270 }[direccion];
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 5 5" style={{ transform: `rotate(${giro}deg)` }} aria-label="Letra E" role="img">
      <path d="M0 0H5V1H1V2H5V3H1V4H5V5H0Z" fill={color} />
    </svg>
  );
}

/** Rueda de líneas: se dibuja línea por línea al aparecer */
export function RuedaAstigmatismo({ tamano }: { tamano: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="-50 -50 100 100" role="img" aria-label="Rueda de líneas para astigmatismo">
      {Array.from({ length: 12 }, (_, i) => {
        const angulo = (i * 15 * Math.PI) / 180;
        const x = Math.cos(angulo) * 46;
        const y = Math.sin(angulo) * 46;
        return (
          <line
            key={i}
            x1={-x}
            y1={-y}
            x2={x}
            y2={y}
            stroke={TINTA}
            strokeWidth={1.6}
            pathLength={1}
            className="tv-trazo"
            style={{ '--i': i } as CSSProperties}
          />
        );
      })}
      <circle r={5} fill="white" />
    </svg>
  );
}

/** Rejilla de Amsler con el punto central latiendo */
export function RejillaAmsler({ tamano }: { tamano: number }) {
  const celdas = 20;
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 100 100" role="img" aria-label="Rejilla de Amsler">
      <rect width="100" height="100" fill="white" stroke={TINTA} strokeWidth="0.8" />
      {Array.from({ length: celdas - 1 }, (_, i) => {
        const p = ((i + 1) * 100) / celdas;
        const estilo = { '--i': i } as CSSProperties;
        return (
          <g key={i}>
            <line x1={p} y1={0} x2={p} y2={100} stroke={TINTA} strokeWidth="0.35" pathLength={1} className="tv-trazo" style={estilo} />
            <line x1={0} y1={p} x2={100} y2={p} stroke={TINTA} strokeWidth="0.35" pathLength={1} className="tv-trazo" style={estilo} />
          </g>
        );
      })}
      <circle cx="50" cy="50" r="1.8" fill={COBALTO} className="tv-latido" />
    </svg>
  );
}

/** Dos ojos, como en un espejo; una mano entra a tapar el que no se prueba ("ambos": ninguno tapado) */
export function OjoTapado({ ojo }: { ojo: Ojo | 'ambos' }) {
  const ojos: Ojo[] = ['izquierdo', 'derecho'];
  return (
    <svg width="240" height="120" viewBox="0 0 240 120" aria-hidden>
      {ojos.map((cual, i) => {
        const cx = 60 + i * 120;
        const tapado = ojo !== 'ambos' && cual !== ojo;
        return (
          <g key={cual}>
            <ellipse cx={cx} cy="46" rx="38" ry="23" fill="white" stroke={TINTA} strokeWidth="2.5" />
            <circle cx={cx} cy="46" r="11" fill={COBALTO} className={tapado ? '' : 'tv-mirada'} />
            <circle cx={cx + 3} cy="42" r="3" fill="white" className={tapado ? '' : 'tv-mirada'} />
            {tapado && (
              <g className={i === 0 ? 'tv-mano-izq' : 'tv-mano-der'}>
                <rect x={cx - 46} y="12" width="92" height="68" rx="30" fill="#f1d9c6" stroke="#b98d70" strokeWidth="2" />
                {[0, 1, 2].map((d) => (
                  <line key={d} x1={cx - 30 + d * 20} y1="24" x2={cx - 30 + d * 20} y2="46" stroke="#b98d70" strokeWidth="1.6" strokeLinecap="round" />
                ))}
              </g>
            )}
            <text x={cx} y="110" textAnchor="middle" fontSize="14" fill={tapado ? PIZARRA : TINTA} fontWeight={tapado ? 400 : 700}>
              {tapado ? 'tapado' : ojo === 'ambos' ? 'abierto' : `ojo ${cual}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Celular que se aleja o se acerca hasta la distancia indicada */
export function DistanciaCelular({ texto }: { texto: string }) {
  return (
    <svg width="260" height="90" viewBox="0 0 260 90" aria-hidden>
      <ellipse cx="30" cy="45" rx="18" ry="11" fill="white" stroke={TINTA} strokeWidth="2" />
      <circle cx="30" cy="45" r="5" fill={COBALTO} />
      <line x1="55" y1="70" x2="215" y2="70" stroke={LINEA} strokeWidth="2" strokeDasharray="4 5" />
      <text x="135" y="86" textAnchor="middle" fontSize="13" fill={PIZARRA}>
        {texto}
      </text>
      <g className="tv-celular">
        <rect x="200" y="18" width="30" height="52" rx="6" fill="white" stroke={TINTA} strokeWidth="2.5" />
        <rect x="205" y="26" width="20" height="30" rx="2" fill="#eaefff" />
      </g>
    </svg>
  );
}

/**
 * Cómo enfoca el ojo: la luz entra por la izquierda, el cristalino la desvía
 * y los rayos se juntan en la retina (atrás, a la derecha). Cada caso mueve el
 * punto de enfoque o marca la parte del ojo afectada.
 */
export function DiagramaEnfoque({ tipo }: { tipo: Diagrama }) {
  const retinaX = 214; // borde de atrás del ojo, a la altura del eje
  const foco: Record<Diagrama, number> = {
    normal: retinaX,
    miopia: 184,
    hipermetropia: 246,
    presbicia: 246,
    astigmatismo: 190,
    retina: retinaX,
    contraste: retinaX,
  };
  const fx = foco[tipo];
  const rayos = [58, 76, 94];
  const colorRayo = COBALTO;

  return (
    <svg viewBox="0 0 270 150" className="h-auto w-full" role="img" aria-label="Esquema de cómo enfoca el ojo">
      {/* ojo */}
      <circle cx="160" cy="76" r="54" fill="white" stroke={TINTA} strokeWidth="2.5" />
      {/* retina */}
      <path d="M 196 36 A 54 54 0 0 1 196 116" fill="none" stroke={tipo === 'retina' ? '#e8a13a' : '#e57373'} strokeWidth="4" />
      {tipo === 'retina' && <circle cx="213" cy="76" r="7" fill="#e8a13a" className="tv-latido" />}
      {/* cristalino */}
      <ellipse
        cx="112"
        cy="76"
        rx={tipo === 'presbicia' ? 7 : 10}
        ry="24"
        fill="#eaefff"
        stroke={COBALTO}
        strokeWidth="2"
        className={tipo === 'presbicia' ? 'tv-cristalino-rigido' : ''}
      />
      {/* objeto: de cerca en presbicia e hipermetropía, lejos en el resto */}
      {tipo === 'presbicia' || tipo === 'hipermetropia' ? (
        <g>
          <rect x="18" y="62" width="20" height="28" rx="3" fill="white" stroke={TINTA} strokeWidth="2" />
          <line x1="23" y1="71" x2="33" y2="71" stroke={TINTA} strokeWidth="1.5" />
          <line x1="23" y1="77" x2="33" y2="77" stroke={TINTA} strokeWidth="1.5" />
          <line x1="23" y1="83" x2="30" y2="83" stroke={TINTA} strokeWidth="1.5" />
        </g>
      ) : (
        <text x="18" y="84" fontSize="22" fontWeight="700" fill={tipo === 'contraste' ? '#b8bdca' : TINTA}>
          E
        </text>
      )}

      {tipo === 'astigmatismo' ? (
        <>
          {rayos.map((y, i) => (
            <polyline
              key={`a${i}`}
              points={`44,${y} 112,${y} 190,76`}
              fill="none"
              stroke={colorRayo}
              strokeWidth="1.8"
              pathLength={1}
              className="tv-rayo"
              style={{ '--i': i } as CSSProperties}
            />
          ))}
          {rayos.map((y, i) => (
            <polyline
              key={`b${i}`}
              points={`44,${y + 2} 112,${y + 2} 240,76`}
              fill="none"
              stroke="#e8a13a"
              strokeWidth="1.8"
              pathLength={1}
              className="tv-rayo"
              style={{ '--i': i + 3 } as CSSProperties}
            />
          ))}
          <circle cx="190" cy="76" r="4" fill={COBALTO} className="tv-latido" />
          <circle cx="240" cy="76" r="4" fill="#e8a13a" className="tv-latido" />
        </>
      ) : (
        <>
          {rayos.map((y, i) => (
            <polyline
              key={i}
              // En la miopía los rayos se cruzan antes y siguen abriéndose hasta la retina
              points={`44,${y} 112,${y} ${fx},76${fx < retinaX ? ` ${retinaX},${76 + ((76 - y) * (retinaX - fx)) / (fx - 112)}` : ''}`}
              fill="none"
              stroke={colorRayo}
              strokeWidth="1.8"
              pathLength={1}
              className="tv-rayo"
              style={{ '--i': i } as CSSProperties}
            />
          ))}
          <circle cx={fx} cy="76" r="4.5" fill={fx === retinaX ? '#2e9e6a' : '#e8a13a'} className="tv-latido" />
        </>
      )}

      <text x="214" y="144" textAnchor="middle" fontSize="11" fill={PIZARRA}>
        retina
      </text>
      <text x="112" y="144" textAnchor="middle" fontSize="11" fill={PIZARRA}>
        cristalino
      </text>
    </svg>
  );
}
