import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function requireAdmin(): Promise<boolean> {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return false;

    const payload = await verifyToken(token);
    if (payload && payload.rol === 'admin') {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
