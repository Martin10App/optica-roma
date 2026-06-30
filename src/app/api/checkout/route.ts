import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { Pool } from 'pg';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

// Agregar el token en el archivo .env.local: MP_ACCESS_TOKEN=APP_USR-...
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-dummy-token'
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    // Verificar usuario
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized', requiresLogin: true }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, error: 'Invalid token', requiresLogin: true }, { status: 401 });
    }

    const userId = payload.id;
    const total = items.reduce((acc: number, item: any) => acc + (item.precio * item.cantidad), 0);

    // Guardar pedido en DB
    const orderResult = await pool.query(
      'INSERT INTO pedidos (usuario_id, total, estado) VALUES ($1, $2, $3) RETURNING id',
      [userId, total, 'pendiente']
    );
    const orderId = orderResult.rows[0].id;

    // Guardar items
    for (const item of items) {
      await pool.query(
        'INSERT INTO pedido_items (pedido_id, producto_id, modelo, marca, cantidad, precio) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, item.id, item.modelo, item.marca, item.cantidad, item.precio]
      );
    }

    // Preparar ítems para Mercado Pago
    const mpItems = items.map((item: any) => ({
      id: item.id.toString(),
      title: `${item.marca} - ${item.modelo}`,
      quantity: item.cantidad,
      unit_price: item.precio,
      currency_id: 'UYU'
    }));

    const preference = new Preference(client);
    
    // Obtener la URL base dinámicamente
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const response = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${origin}/checkout/success?orderId=${orderId}`,
          failure: `${origin}/checkout/failure`,
          pending: `${origin}/checkout/pending`
        },
        auto_return: 'approved',
        external_reference: orderId.toString(),
      }
    });

    // Actualizar pedido con el ID de preferencia
    await pool.query('UPDATE pedidos SET preferencia_mp_id = $1 WHERE id = $2', [response.id, orderId]);

    return NextResponse.json({ 
      success: true, 
      init_point: response.init_point 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create preference' }, { status: 500 });
  }
}
