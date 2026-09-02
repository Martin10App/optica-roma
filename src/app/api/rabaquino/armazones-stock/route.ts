import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { autorizado } from '@/lib/rabaquinoAuth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

const CAMPOS_ARMAZON = [
  'marca', 'codigo', 'material', 'color', 'stock',
  'precio_venta', 'precio_costo', 'proveedor', 'ubicacion',
  'k', 'a', 'd', 'p', 'notas', 'imagen', 'stock_rabaquino',
];

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM rabaquino_armazones_stock ORDER BY created_at DESC LIMIT 2000'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Rabaquino GET armazones-stock error:', error);
    return NextResponse.json({ success: false, error: 'Error al cargar stock de armazones' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Antes cualquiera con la URL podia cambiar el stock. Pasa el portal con
    // sesion iniciada o el programa con su X-Sync-Secret.
    if (!(await autorizado(request))) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Falta id' }, { status: 400 });
    }

    const body = await request.json();
    const campos = Object.keys(body).filter((k) => CAMPOS_ARMAZON.includes(k));
    if (campos.length === 0) {
      return NextResponse.json({ success: false, error: 'Sin campos válidos' }, { status: 400 });
    }

    const sets = campos.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const valores = campos.map((c) => body[c]);
    valores.push(id);

    const result = await pool.query(
      `UPDATE rabaquino_armazones_stock SET ${sets} WHERE id = $${valores.length} RETURNING *`,
      valores
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Armazón no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Rabaquino PATCH armazones-stock error:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar stock' }, { status: 500 });
  }
}

// Sincroniza rabaquino_armazones_stock con el inventario real del programa
// de escritorio (public.armazones). Se sincroniza junto con armazones_publico
// desde un único punto: ver POST /api/armazones/sync.
