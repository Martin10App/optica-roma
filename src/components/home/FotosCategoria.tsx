'use client';

import { useEffect, useRef, useState } from 'react';
import { nombreMarca, type Producto } from '@/lib/catalogoTipos';

const PAUSA_MS = 4200;
const TRANSICION_MS = 1100;

type Props = {
  productos: Producto[];
  /** Para que dos recuadros vecinos no cambien de foto al mismo tiempo */
  desfaseMs?: number;
};

// Las fotos de una categoría van pasando dentro de su recuadro: la nueva entra
// con un fundido y un leve acercamiento, la anterior se retira. Solo corre
// mientras el recuadro se ve en pantalla, con la pestaña abierta y sin el mouse
// encima. La siguiente foto se descarga antes de mostrarla, así nunca aparece un
// recuadro vacío. Con "reducir movimiento" queda la primera foto quieta.
export default function FotosCategoria({ productos, desfaseMs = 0 }: Props) {
  const marco = useRef<HTMLDivElement>(null);
  const indice = useRef(0);
  const [actual, setActual] = useState(0);
  const [anterior, setAnterior] = useState<number | null>(null);

  useEffect(() => {
    indice.current = 0;
    setActual(0);
    setAnterior(null);

    const el = marco.current;
    const cantidad = productos.length;
    if (!el || cantidad < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let enPantalla = false;
    let encima = false;
    let cancelado = false;
    let fallidas = 0;
    let espera: ReturnType<typeof setTimeout> | undefined;
    let fin: ReturnType<typeof setTimeout> | undefined;

    const puedeAvanzar = () => enPantalla && !encima && !document.hidden && !cancelado;

    const programar = (ms: number) => {
      clearTimeout(espera);
      if (puedeAvanzar()) espera = setTimeout(avanzar, ms);
    };

    const precargar = (i: number) => {
      const img = new window.Image();
      img.src = productos[i].imagen_url!;
      return img.decode();
    };

    async function avanzar() {
      if (!puedeAvanzar()) return;
      const siguiente = (indice.current + 1) % cantidad;
      try {
        await precargar(siguiente);
      } catch {
        // Foto que no carga: se saltea sin mostrarla
        indice.current = siguiente;
        if (++fallidas < cantidad) programar(0);
        return;
      }
      if (!puedeAvanzar()) return;
      fallidas = 0;
      setAnterior(indice.current);
      indice.current = siguiente;
      setActual(siguiente);
      clearTimeout(fin);
      fin = setTimeout(() => setAnterior(null), TRANSICION_MS);
      precargar((siguiente + 1) % cantidad).catch(() => {});
      programar(PAUSA_MS);
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        const antes = enPantalla;
        enPantalla = entrada.isIntersecting;
        if (enPantalla && !antes) programar(PAUSA_MS / 2 + desfaseMs);
        if (!enPantalla) clearTimeout(espera);
      },
      { threshold: 0.35 }
    );
    observador.observe(el);

    const alCambiarPestana = () => programar(PAUSA_MS / 2);
    const alEntrar = () => {
      encima = true;
      clearTimeout(espera);
    };
    const alSalir = () => {
      encima = false;
      programar(PAUSA_MS / 2);
    };
    document.addEventListener('visibilitychange', alCambiarPestana);
    el.addEventListener('mouseenter', alEntrar);
    el.addEventListener('mouseleave', alSalir);

    return () => {
      cancelado = true;
      clearTimeout(espera);
      clearTimeout(fin);
      observador.disconnect();
      document.removeEventListener('visibilitychange', alCambiarPestana);
      el.removeEventListener('mouseenter', alEntrar);
      el.removeEventListener('mouseleave', alSalir);
    };
  }, [productos, desfaseMs]);

  if (productos.length === 0) return null;

  const producto = productos[Math.min(actual, productos.length - 1)];
  const saliente = anterior != null ? productos[anterior] : null;

  return (
    <div ref={marco} className="absolute inset-0" aria-hidden>
      <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
        {saliente && (
          <div key={`sale-${saliente.id}`} className="foto-sale absolute inset-0">
            <img src={saliente.imagen_url!} alt="" className="h-full w-full object-contain mix-blend-multiply" />
          </div>
        )}
        <div key={`entra-${producto.id}`} className={`absolute inset-0 ${anterior != null ? 'foto-entra' : ''}`}>
          <img
            src={producto.imagen_url!}
            alt=""
            decoding="async"
            className="foto-deriva h-full w-full object-contain mix-blend-multiply"
          />
        </div>
      </div>

      {productos.length > 1 && (
        <p
          key={`texto-${producto.id}`}
          className="foto-texto absolute inset-x-4 bottom-3 truncate text-[12px] text-pizarra"
        >
          {nombreMarca(producto.marca)} · {producto.modelo}
        </p>
      )}
    </div>
  );
}
