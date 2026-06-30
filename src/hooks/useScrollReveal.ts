'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook que activa animaciones de scroll con IntersectionObserver.
 * Agrega la clase 'visible' a los elementos con clase 'reveal', 'reveal-left', 'reveal-right' o 'reveal-scale'
 * cuando entran al viewport.
 */
export function useScrollReveal(options?: IntersectionObserverInit) {
  useEffect(() => {
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

    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [options]);
}

