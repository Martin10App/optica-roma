/* Service worker de la agenda.
 *
 * Hace dos cosas y nada más:
 *   1. Recibe los avisos push y los muestra como notificación del sistema.
 *   2. Al tocar la notificación, abre la agenda (o trae al frente la que ya
 *      estaba abierta, en vez de abrir otra pestaña).
 *
 * A propósito NO cachea nada: la agenda tiene que mostrar datos frescos
 * siempre, y una copia vieja en caché sería peor que un error de conexión.
 */

const RUTA = '/agenda';

function esVentanaDeAgenda(url) {
  try {
    const pagina = new URL(url);
    return pagina.origin === self.location.origin &&
           (pagina.pathname === RUTA || pagina.pathname.startsWith(RUTA + '/'));
  } catch (e) {
    return false;
  }
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch (e) {
    d = { titulo: 'Agenda', cuerpo: event.data ? event.data.text() : '' };
  }

  const titulo = d.titulo || 'Agenda';
  const opciones = {
    body: d.cuerpo || '',
    icon: '/icons/agenda-192.png',
    badge: '/icons/agenda-192.png',
    lang: 'es',
    dir: 'ltr',
    // Agrupa por tipo: varios avisos del mismo tipo no apilan 10 notificaciones
    tag: d.tag || 'agenda',
    renotify: true,
    requireInteraction: !!d.importante,
    vibrate: [90, 45, 90],
    data: { url: d.url || RUTA },
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destino = (event.notification.data && event.notification.data.url) || RUTA;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      for (const cliente of lista) {
        if (esVentanaDeAgenda(cliente.url) && 'focus' in cliente) {
          cliente.postMessage({ tipo: 'refrescar' });
          return cliente.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(destino);
    })
  );
});
