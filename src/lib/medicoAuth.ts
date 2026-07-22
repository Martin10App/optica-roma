import { Pool } from 'pg';
import { randomBytes } from 'crypto';

// Pool compartido por todas las rutas de /api/medico
export const medicoPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export type MedicoSesion = {
  id: number;
  usuario: string;
  rol: string;
  nombre: string | null;
};

export function nuevoToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Valida el header X-Medico-Token contra medico_usuarios.
 * Devuelve la sesión o null. Estas rutas manejan cédulas, fechas de nacimiento
 * y recetas, así que ninguna responde datos sin token válido y sin vencer.
 */
export const DIAS_SESION = 60;

export async function sesionDesdeRequest(request: Request): Promise<MedicoSesion | null> {
  const token = request.headers.get('x-medico-token');
  if (!token) return null;

  const res = await medicoPool.query(
    `SELECT id, usuario, rol, nombre, token_exp FROM medico_usuarios
      WHERE token = $1::text AND token_exp > NOW()`,
    [token]
  );
  if (!res.rows.length) return null;

  // Sesión deslizante: mientras la usen, se renueva sola y no los echa nunca.
  // La renovación se dispara solo cuando falta poco, no en cada llamada: con
  // la página consultando cada minuto, escribir siempre sería puro desperdicio.
  const venceEn = new Date(res.rows[0].token_exp).getTime() - Date.now();
  if (venceEn < (DIAS_SESION - 5) * 86400000) {
    medicoPool
      .query(
        `UPDATE medico_usuarios SET token_exp = NOW() + INTERVAL '${DIAS_SESION} days'
          WHERE token = $1::text`,
        [token]
      )
      .catch(() => {});   // que no falle la petición por no poder renovar
  }

  const { id, usuario, rol, nombre } = res.rows[0];
  return { id, usuario, rol, nombre } as MedicoSesion;
}

/** El programa de escritorio se autentica con el mismo secreto que ya usa el sync. */
export function esSyncDelPrograma(request: Request): boolean {
  const secret = request.headers.get('x-sync-secret');
  return !!secret && secret === process.env.RABAQUINO_SYNC_SECRET;
}
