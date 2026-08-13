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

const script = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(script, 'agenda.html debe contener su script principal');
new Function(script[1]);

assert.ok(html.includes('PAGADO · PUEDE ATENDERSE'));
assert.ok(html.includes('SEÑÓ · PUEDE ATENDERSE'));
assert.ok(html.includes('onclick="marcarAtendido()"'));
assert.ok(html.includes('Guardar horario'));
assert.ok(!html.includes('Subir receta'));
assert.ok(!html.includes('onclick="abrirAlta()"'));

assert.match(api, /telefono, total, sena, saldo, fecha_sena/);
assert.ok(api.includes('El paciente debe tener seña o pago registrado'));
assert.ok(api.includes('Las altas se realizan desde la óptica'));
assert.ok(api.includes("estado:'atendido'") || html.includes("estado:'atendido'"));

console.log('Agenda del consultorio: pruebas OK');
