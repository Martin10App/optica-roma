import sqlite3
import os

paths = [
    r'\\Romalp2\datos_optica\ventas.db', 
    r'\\Romalp2\datos_optica\ventas_compartida.db', 
    r'C:\Users\OPTICA ROMA\AppData\Local\OpticaRomaData\ventas.db'
]

for p in paths:
    if os.path.exists(p):
        try:
            conn = sqlite3.connect(p)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM ventas_profesionales WHERE nombre LIKE '%garro%' OR cedula LIKE '%13177422%'")
            rows = cur.fetchall()
            print(f'--- IN {p} ---')
            if rows:
                for r in rows:
                    print(dict(r))
            else:
                print('Not found')
        except Exception as e:
            print(f'Error in {p}: {e}')
