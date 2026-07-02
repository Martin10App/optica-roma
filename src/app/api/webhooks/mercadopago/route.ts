import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { Pool } from 'pg';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-dummy-token'
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    let id = url.searchParams.get('data.id') || url.searchParams.get('id');
    let type = url.searchParams.get('type') || url.searchParams.get('topic');

    if (!id || !type) {
      try {
        const body = await request.json();
        if (body) {
          type = type || body.type || body.action;
          id = id || body.data?.id;
        }
      } catch (e) {
        // Body could be empty or invalid JSON, ignore
      }
    }

    const isPaymentEvent = type === 'payment' || (type && type.startsWith('payment'));

    if (isPaymentEvent && id) {
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id });

      if (payment && payment.external_reference) {
        let estadoPedido = 'pendiente';
        const mpStatus = payment.status;

        if (mpStatus === 'approved') {
          estadoPedido = 'pagado';
        } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
          estadoPedido = 'rechazado';
        } else if (mpStatus === 'in_process' || mpStatus === 'pending') {
          estadoPedido = 'pendiente';
        }

        const orderId = parseInt(payment.external_reference, 10);
        if (!isNaN(orderId)) {
          await pool.query(
            'UPDATE pedidos SET estado = $1, pago_id = $2 WHERE id = $3',
            [estadoPedido, payment.id?.toString(), orderId]
          );
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    // MercadoPago reintenta si no es 200, pero si hay error interno que no se arreglará, mejor 200 para evitar spam
    return NextResponse.json({ success: true }, { status: 200 }); 
  }
}
