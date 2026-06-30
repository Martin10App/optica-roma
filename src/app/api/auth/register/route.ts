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
    const { nombre, email, password } = await request.json();

    if (!nombre || !email || !password) {
      return NextResponse.json({ success: false, error: 'Faltan datos' }, { status: 400 });
    }

    // Check if user exists
    const checkRes = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (checkRes.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'El correo electrónico ya está registrado' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
      [nombre, email, hash, 'cliente']
    );

    const user = result.rows[0];

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

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ success: false, error: 'Error al registrar usuario' }, { status: 500 });
  }
}
