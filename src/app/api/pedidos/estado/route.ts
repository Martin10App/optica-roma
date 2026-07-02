import { NextResponse, NextRequest } from 'next/server';
import { Pool } from 'pg';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = parseInt(searchParams.get('orderId') || '', 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 });
    }

    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const result = await pool.query('SELECT estado, usuario_id, pago_id FROM pedidos WHERE id = $1', [orderId]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const pedido = result.rows[0];

    // Verificar si el usuario es dueño del pedido o es admin
    if (pedido.usuario_id !== payload.id && payload.rol !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      estado: pedido.estado,
      pago_id: pedido.pago_id 
    });

  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
