'use client';

import { useEffect, useRef } from 'react';

// React no escribe el atributo `muted` en el HTML que sale del servidor, y sin
// él Chrome y Safari bloquean la reproducción automática: el video de la
// portada anterior podía quedar quieto en la primera imagen. Acá se silencia y
// se le da play desde el navegador.
export default function VideoLocal() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    v.play().catch(() => {
      // modo ahorro de datos o de batería: queda la foto de portada
    });
  }, []);

  return (
    <video
      ref={video}
      className="absolute inset-0 h-full w-full object-cover"
      poster="/media/local/local-las-piedras-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="Recorrido por la vidriera y el interior de Óptica Roma en Las Piedras"
    >
      <source src="/media/local/local-las-piedras.mp4" type="video/mp4" />
    </video>
  );
}
