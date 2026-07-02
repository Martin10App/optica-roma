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

    if (!items || !Array.isArray(items) || items.length === 0) {
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

    // 1 & 2: Validar items del cliente (solo id y cantidad)
    const validItems: { id: number, cantidad: number }[] = [];
    const itemIds: number[] = [];
    for (const item of items) {
      const id = parseInt(item.id, 10);
      const cantidad = parseInt(item.cantidad, 10);
      if (isNaN(id) || isNaN(cantidad) || cantidad < 1) {
        return NextResponse.json({ success: false, error: 'Invalid item quantity or id' }, { status: 400 });
      }
      validItems.push({ id, cantidad });
      itemIds.push(id);
    }

    // 3: Consultar los productos reales en la DB
    const { rows: dbProducts } = await pool.query(
      'SELECT id, modelo, marca, precio, stock_visible FROM armazones_publico WHERE id = ANY($1)',
      [itemIds]
    );

    // 4 & 5: Validar y construir items procesados
    let total = 0;
    const processedItems = [];

    for (const vItem of validItems) {
      const dbProduct = dbProducts.find((p: any) => p.id === vItem.id);
      
      if (!dbProduct) {
        return NextResponse.json({ success: false, error: `Producto no encontrado: ${vItem.id}` }, { status: 400 });
      }
      
      if (dbProduct.stock_visible !== true) {
        return NextResponse.json({ success: false, error: `Producto no disponible: ${vItem.id}` }, { status: 400 });
      }
      
      const realPrice = parseFloat(dbProduct.precio);
      if (isNaN(realPrice) || realPrice <= 0) {
        return NextResponse.json({ success: false, error: `Precio inválido para producto: ${vItem.id}` }, { status: 400 });
      }

      total += realPrice * vItem.cantidad;
      
      processedItems.push({
        id: dbProduct.id,
        modelo: dbProduct.modelo,
        marca: dbProduct.marca,
        precio: realPrice,
        cantidad: vItem.cantidad
      });
    }

    // Guardar pedido en DB
    const orderResult = await pool.query(
      'INSERT INTO pedidos (usuario_id, total, estado) VALUES ($1, $2, $3) RETURNING id',
      [userId, total, 'pendiente']
    );
    const orderId = orderResult.rows[0].id;

    // Guardar items
    for (const item of processedItems) {
      await pool.query(
        'INSERT INTO pedido_items (pedido_id, producto_id, modelo, marca, cantidad, precio) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, item.id, item.modelo, item.marca, item.cantidad, item.precio]
      );
    }

    // Preparar ítems para Mercado Pago
    const mpItems = processedItems.map((item) => ({
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
        notification_url: `${origin}/api/webhooks/mercadopago`,
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
