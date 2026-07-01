import sys
import traceback

def test_db():
    try:
        import psycopg
        conn = psycopg.connect(host='192.168.1.8', port=5432, dbname='optica_roma', user='optica_app', password='Opticaroma0711', connect_timeout=5)
        cur = conn.cursor()
        cur.execute("SELECT marca, codigo, material, color, k, a, d, p, stock, precio_venta, imagen FROM public.armazones LIMIT 1")
        print("Success:", cur.fetchall())
    except Exception as e:
        print("Error:", repr(e))
        traceback.print_exc()

with open('db_test_log.txt', 'w') as f:
    sys.stdout = f
    sys.stderr = f
    test_db()
