import sys
import psycopg
import shutil
import os
import traceback

NEON_URL = "postgresql://neondb_owner:npg_gTbrcCaG6RQ0@ep-weathered-flower-ac86t77j.sa-east-1.aws.neon.tech/neondb?sslmode=require"
LOCAL_DB = {
    'host': '192.168.1.8',
    'port': 5432,
    'dbname': 'optica_roma',
    'user': 'optica_app',
    'password': 'Opticaroma0711'
}

IMG_SOURCE_DIR = r"C:\Users\OPTICA ROMA\Desktop\imagenes armazones\WEB"
IMG_DEST_DIR = r"C:\Users\OPTICA ROMA\Desktop\pagina nueva optica\public\armazones"

def sync():
    print("Conectando a local postgres...")
    try:
        conn_local = psycopg.connect(**LOCAL_DB, connect_timeout=10)
        cur_local = conn_local.cursor()
        cur_local.execute("SELECT marca, codigo, material, color, k, a, d, p, stock, precio_venta, imagen FROM public.armazones")
        rows = cur_local.fetchall()
        print(f"Leidos {len(rows)} armazones de local.")
    except Exception as e:
        print("Error conectando a local DB:", e)
        return
        
    print("Conectando a Neon...")
    try:
        conn_neon = psycopg.connect(NEON_URL, connect_timeout=15)
        cur_neon = conn_neon.cursor()
        
        updates = 0
        inserts = 0
        
        for r in rows:
            marca, codigo, material, color, k, a, d, p, stock_str, precio_venta, imagen = r
            
            try:
                stock = int(stock_str) if stock_str and str(stock_str).strip().isdigit() else 0
            except ValueError:
                stock = 0
                
            stock_vis = stock > 0
            
            # Format image url as /armazones/IMAGE_NAME.jpeg (same as sync_helper)
            img_name = ""
            if imagen:
                img_name = os.path.splitext(imagen.strip())[0] + ".jpeg"
            imagen_url = f"/armazones/{img_name}" if img_name else ""
            
            # Parse precio
            try:
                precio = float(precio_venta) if precio_venta else 0
            except:
                precio = 0
                
            # Upsert into neon
            cur_neon.execute("SELECT id FROM armazones_publico WHERE modelo = %s", (codigo,))
            existing = cur_neon.fetchone()
            
            if existing:
                cur_neon.execute("""
                    UPDATE armazones_publico 
                    SET marca = %s, precio = %s, imagen_url = %s, stock_visible = %s
                    WHERE id = %s
                """, (marca, precio, imagen_url, stock_vis, existing[0]))
                updates += 1
            else:
                cur_neon.execute("""
                    INSERT INTO armazones_publico (modelo, marca, categoria, precio, imagen_url, stock_visible, mas_vendido, ventas_count)
                    VALUES (%s, %s, %s, %s, %s, %s, false, 0)
                """, (codigo, marca, "Armazones de Receta", precio, imagen_url, stock_vis))
                inserts += 1
                
        conn_neon.commit()
        print(f"Sincronizacion completada en Neon! {inserts} insertados, {updates} actualizados.")
        
    except Exception as e:
        print("Error en Neon:", e)
        traceback.print_exc()
        
    print("Copiando nuevas imagenes...")
    try:
        if not os.path.exists(IMG_DEST_DIR):
            os.makedirs(IMG_DEST_DIR)
        
        copied = 0
        if os.path.exists(IMG_SOURCE_DIR):
            for file in os.listdir(IMG_SOURCE_DIR):
                if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    src_file = os.path.join(IMG_SOURCE_DIR, file)
                    dest_filename = os.path.splitext(file)[0] + ".jpeg"
                    dest_file = os.path.join(IMG_DEST_DIR, dest_filename)
                    
                    if not os.path.exists(dest_file) or os.path.getmtime(src_file) > os.path.getmtime(dest_file):
                        shutil.copy2(src_file, dest_file)
                        copied += 1
        print(f"Copiadas {copied} imagenes.")
    except Exception as e:
        print("Error copiando imagenes:", e)
        
with open('sync_log.txt', 'w') as f:
    sys.stdout = f
    sys.stderr = f
    sync()
