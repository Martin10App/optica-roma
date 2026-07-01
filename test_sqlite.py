import sys
import sqlite3
import traceback

def test_db():
    try:
        conn = sqlite3.connect(r'\\Romalp2\datos_optica\ventas.db')
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(armazones)")
        print("Columns:", cur.fetchall())
        cur.execute("SELECT * FROM armazones LIMIT 1")
        print("Data:", cur.fetchall())
    except Exception as e:
        print("Error:", repr(e))
        traceback.print_exc()

with open(r'C:\Users\OPTICA ROMA\Desktop\pagina nueva optica\db_test_log.txt', 'w') as f:
    sys.stdout = f
    sys.stderr = f
    test_db()
