import os
import sqlite3
import psycopg2

# Database connections
LOCAL_DB_VENTAS = r'\\Romalp2\datos_optica\ventas.db'
LOCAL_DB_VENTAS_FALLBACK = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'OpticaRoma', 'ventas.db')
CASINOS_DB = r'\\Romalp2\datos_optica\casinos.db'
CASINOS_DB_FALLBACK = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'OpticaRoma', 'casinos.db')

NEON_URL = "postgresql://neondb_owner:npg_gTbrcCaG6RQ0@ep-weathered-flower-ac86t77j.sa-east-1.aws.neon.tech/neondb?sslmode=require"

def get_db_path(primary, fallback):
    if os.path.exists(primary):
        return primary
    return fallback

def sync_data():
    ventas_path = get_db_path(LOCAL_DB_VENTAS, LOCAL_DB_VENTAS_FALLBACK)
    casinos_path = get_db_path(CASINOS_DB, CASINOS_DB_FALLBACK)
    
    # 1. Fetch current stock from armazones
    print(f"Leyendo stock de: {ventas_path}")
    stock_dict = {}
    try:
        conn = sqlite3.connect(ventas_path)
        cur = conn.cursor()
        # En el sistema original, armazones está en ventas.db
        cur.execute("SELECT modelo, stock FROM armazones WHERE eliminado IS NULL OR eliminado = 0")
        for row in cur.fetchall():
            modelo, stock = row
            try:
                stock_val = int(stock)
            except:
                stock_val = 0
            stock_dict[modelo] = stock_val
        conn.close()
    except Exception as e:
        print(f"Error leyendo stock: {e}")
        
    # 2. Fetch 'mas_vendidos' from casinos.db (o ventas.db)
    print(f"Calculando los más vendidos (Casinos/Ventas)...")
    sales_counts = {}
    try:
        # Intentamos usar casinos.db primero
        conn_c = sqlite3.connect(casinos_path)
        cur_c = conn_c.cursor()
        cur_c.execute("SELECT modelo, COUNT(*) as qty FROM armazones GROUP BY modelo ORDER BY qty DESC LIMIT 30")
        rows = cur_c.fetchall()
        for row in rows:
            modelo, qty = row
            sales_counts[modelo] = qty
        conn_c.close()
    except Exception as e:
        print(f"No se pudo usar casinos.db, intentando usar historial de ventas.db: {e}")
        try:
            conn = sqlite3.connect(ventas_path)
            cur = conn.cursor()
            # Alternativa si armazones no está en casinos
            cur.execute("SELECT modelo, COUNT(*) as qty FROM armazones GROUP BY modelo ORDER BY qty DESC LIMIT 30")
            for row in cur.fetchall():
                modelo, qty = row
                sales_counts[modelo] = qty
            conn.close()
        except Exception as e2:
             print(f"Error calculando ventas: {e2}")

    # Top 12 más vendidos
    sorted_sales = sorted(sales_counts.items(), key=lambda x: x[1], reverse=True)
    top_models = [m[0] for m in sorted_sales[:12]]
    print(f"Top más vendidos: {top_models}")

    # 3. Sincronizar a Neon Postgres
    print("Conectando a NEON...")
    try:
        conn_neon = psycopg2.connect(NEON_URL)
        cur_neon = conn_neon.cursor()
        
        # Crear columnas si no existen
        cur_neon.execute("""
            ALTER TABLE armazones_publico 
            ADD COLUMN IF NOT EXISTS ventas_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS mas_vendido BOOLEAN DEFAULT false;
        """)
        
        # Primero resetear los flags
        cur_neon.execute("UPDATE armazones_publico SET mas_vendido = false, ventas_count = 0, stock_visible = false")
        
        # Traer todos los modelos de neon
        cur_neon.execute("SELECT id, modelo FROM armazones_publico")
        neon_items = cur_neon.fetchall()
        
        updates = 0
        for neon_id, modelo in neon_items:
            # En SQLite puede ser que el modelo no coincida exacto, pero asumimos coincidencia exacta
            stock = stock_dict.get(modelo, 0)
            stock_vis = stock > 0
            is_best = modelo in top_models
            ventas = sales_counts.get(modelo, 0)
            
            cur_neon.execute("""
                UPDATE armazones_publico 
                SET stock_visible = %s, mas_vendido = %s, ventas_count = %s
                WHERE id = %s
            """, (stock_vis, is_best, ventas, neon_id))
            updates += 1
            
        conn_neon.commit()
        print(f"¡Sincronización exitosa! Se actualizaron {updates} armazones en la web.")
    except Exception as e:
        print("Error en Neon:", e)
    finally:
        if 'cur_neon' in locals():
            cur_neon.close()
        if 'conn_neon' in locals():
            conn_neon.close()

if __name__ == '__main__':
    sync_data()
