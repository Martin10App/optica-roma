import psycopg
try:
    conn = psycopg.connect('postgresql://neondb_owner:npg_gTbrcCaG6RQ0@ep-weathered-flower-ac86t77j.sa-east-1.aws.neon.tech/neondb?sslmode=require', connect_timeout=10)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM armazones_publico")
    print("Neon rows:", cur.fetchone()[0])
except Exception as e:
    print("Error:", e)
