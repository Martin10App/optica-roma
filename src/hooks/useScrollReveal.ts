'use client';

import { useEffect } from 'react';

const SELECTOR = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-heading, .stagger';

/**
 * Revela elementos cuando entran en pantalla, agregandoles la clase `visible`.
 * Los estilos de entrada viven en globals.css.
 *
 * Observa tambien el contenido que aparece despues del montaje. Esto no es un
 * detalle: las tarjetas del catalogo llegan de la API, y con la version
 * anterior (que consultaba el DOM una sola vez) se quedaban en opacity 0 para
 * siempre, porque nadie las llegaba a observar.
 */
export function useScrollReveal(options?: IntersectionObserverInit) {
  useEffect(() => {
    const mostrarTodo = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => el.classList.add('visible'));
    };

    // Si el navegador no soporta IntersectionObserver, se muestra todo de una.
    // Nunca se deja contenido invisible esperando una animacion que no va a correr.
    if (typeof IntersectionObserver === 'undefined') {
      mostrarTodo();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options,
      }
    );

    const observar = (raiz: ParentNode) => {
      raiz.querySelectorAll(SELECTOR).forEach((el) => {
        if (!el.classList.contains('visible')) observer.observe(el);
      });
    };

    observar(document);

    // Contenido que se monta despues (catalogo, cambios de pagina, filtros).
    const mutaciones = new MutationObserver((records) => {
      records.forEach((r) => {
        r.addedNodes.forEach((nodo) => {
          if (!(nodo instanceof Element)) return;
          if (nodo.matches(SELECTOR) && !nodo.classList.contains('visible')) {
            observer.observe(nodo);
          }
          observar(nodo);
        });
      });
    });

    mutaciones.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutaciones.disconnect();
    };
  }, [options]);
}
