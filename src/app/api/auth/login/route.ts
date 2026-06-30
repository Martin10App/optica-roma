import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Faltan credenciales' }, { status: 400 });
    }

    // Support "martin" as a shortcut for the admin email
    const searchEmail = email.toLowerCase() === 'martin' ? 'martin@opticaroma.com.uy' : email;

    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [searchEmail]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    // Sign JWT
    const token = await signToken({
      id: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre
    });

    cookies().set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, user: { id: user.id, nombre: user.nombre, rol: user.rol } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Error processing login' }, { status: 500 });
  }
}
