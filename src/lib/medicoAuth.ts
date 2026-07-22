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
export async function sesionDesdeRequest(request: Request): Promise<MedicoSesion | null> {
  const token = request.headers.get('x-medico-token');
  if (!token) return null;

  const res = await medicoPool.query(
    `SELECT id, usuario, rol, nombre FROM medico_usuarios
      WHERE token = $1 AND token_exp > NOW()`,
    [token]
  );
  return res.rows.length ? (res.rows[0] as MedicoSesion) : null;
}

/** El programa de escritorio se autentica con el mismo secreto que ya usa el sync. */
export function esSyncDelPrograma(request: Request): boolean {
  const secret = request.headers.get('x-sync-secret');
  return !!secret && secret === process.env.RABAQUINO_SYNC_SECRET;
}
