import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(raiz, 'public', 'agenda.html'), 'utf8');
const api = fs.readFileSync(
  path.join(raiz, 'src', 'app', 'api', 'medico', 'agenda', 'route.ts'),
  'utf8'
);
const login = fs.readFileSync(
  path.join(raiz, 'src', 'app', 'api', 'medico', 'login', 'route.ts'),
  'utf8'
);
const mensajes = fs.readFileSync(
  path.join(raiz, 'src', 'app', 'api', 'medico', 'mensajes', 'route.ts'),
  'utf8'
);
const push = fs.readFileSync(path.join(raiz, 'src', 'lib', 'medicoPush.ts'), 'utf8');
const pushRoute = fs.readFileSync(
  path.join(raiz, 'src', 'app', 'api', 'medico', 'push', 'route.ts'),
  'utf8'
);
const serviceWorker = fs.readFileSync(path.join(raiz, 'public', 'sw-agenda.js'), 'utf8');

const script = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(script, 'agenda.html debe contener su script principal');
new Function(script[1]);

assert.ok(html.includes('PAGADO · PUEDE ATENDERSE'));
assert.ok(html.includes('SEÑÓ · PUEDE ATENDERSE'));
assert.ok(html.includes('onclick="marcarAtendido()"'));
assert.ok(html.includes('Guardar horario'));
assert.ok(!html.includes('Subir receta'));
assert.ok(html.includes('onclick="abrirAlta()"'));
assert.ok(html.includes('AGREGADO POR CONSULTORIO'));
assert.ok(html.includes("r.origen === 'consultorio' && !r.venta_id"));
assert.ok(html.includes('function avisoPaciente(r)'));
assert.ok(html.includes("r.ultimo_mensaje || ''"));
assert.ok(html.includes("r.nota || ''"));
assert.ok(html.includes("r.ultimo_mensaje = mensaje.texto"));

assert.match(api, /telefono, total, sena, saldo, fecha_sena/);
assert.ok(api.includes('LEFT JOIN LATERAL'));
assert.ok(api.includes('texto AS ultimo_mensaje'));
assert.ok(api.includes('ORDER BY creado_en DESC, id DESC'));
assert.ok(api.includes('El paciente debe tener seña o pago registrado'));
assert.ok(api.includes("origen: 'consultorio'"));
assert.ok(api.includes("sesion?.rol === 'consultorio'"));
assert.ok(api.includes("venta_id IS NULL"));
assert.ok(api.includes("origen = CASE WHEN $10::int IS NOT NULL THEN 'venta' ELSE origen END"));
assert.ok(api.includes("estado:'atendido'") || html.includes("estado:'atendido'"));

assert.ok(login.includes('tokenVigente'));
assert.ok(login.includes('tokenVigente ? res.rows[0].token : nuevoToken()'));

// Notificaciones: el navegador y Neon deben coincidir, sin agregar sondeo al reloj.
assert.ok(html.includes("api('/push?endpoint=' + encodeURIComponent(sub.endpoint))"));
assert.ok(html.includes('estado.success && estado.suscripto'));
assert.equal((html.match(/revisarNotificaciones\(\)/g) || []).length, 5);
assert.ok(!html.match(/async function refrescar\(\)[\s\S]{0,300}revisarNotificaciones\(\)/));

// Los chats marcan leído sólo si los datos devueltos muestran algo pendiente.
assert.ok(html.includes('function hayMensajesSinLeer(mensajes, clave)'));
assert.ok(html.includes("hayMensajesSinLeer(json.data, 'general')"));
assert.ok(mensajes.includes('ORDER BY creado_en DESC, id DESC'));
assert.ok(mensajes.includes('AS recientes'));
assert.ok(mensajes.includes('ORDER BY creado_en ASC, id ASC'));

// El aviso de prueba va únicamente al equipo recién activado y el estado de
// entrega se actualiza sólo para las suscripciones que respondieron bien.
assert.ok(pushRoute.includes('}, endpoint);'));
assert.ok(push.includes('const correctas: number[] = []'));
assert.ok(push.includes('WHERE id = ANY($1::int[])'));
assert.ok(!push.includes('id <> ALL'));

// /agendar (página pública) no debe confundirse con /agenda (aplicación privada).
assert.ok(serviceWorker.includes('function esVentanaDeAgenda(url)'));
assert.ok(serviceWorker.includes('pagina.pathname === RUTA'));
assert.ok(!serviceWorker.includes('cliente.url.includes(RUTA)'));
const crearMatcherAgenda = new Function(
  'self',
  serviceWorker + '\nreturn esVentanaDeAgenda;'
);
const esVentanaDeAgenda = crearMatcherAgenda({
  location: { origin: 'https://www.opticaroma.store' },
  addEventListener() {},
  skipWaiting() {},
  clients: { claim() {} },
  registration: { showNotification() {} },
});
assert.equal(esVentanaDeAgenda('https://www.opticaroma.store/agenda'), true);
assert.equal(esVentanaDeAgenda('https://www.opticaroma.store/agenda/'), true);
assert.equal(esVentanaDeAgenda('https://www.opticaroma.store/agendar'), false);
assert.equal(esVentanaDeAgenda('https://otro.example/agenda'), false);

console.log('Agenda del consultorio: pruebas OK');
