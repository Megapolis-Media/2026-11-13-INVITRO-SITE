"""Exercise actual migration and compare-and-swap SQL against isolated SQLite."""
import sqlite3,re,pathlib,json
root=pathlib.Path(__file__).resolve().parents[1]
db=sqlite3.connect(':memory:')
for p in sorted((root/'drizzle').glob('*.sql')): db.executescript(p.read_text())
route=(root/'app/api/control/route.ts').read_text()
sql=re.search(r"prepare\('(INSERT INTO event_control[^']+)'\)",route).group(1)
c=json.dumps({'mode':'before'})
assert db.execute(sql,(c,c,1,0)).rowcount==1
assert db.execute(sql,(c,c,2,0)).rowcount==0 # simultaneous first save cannot overwrite
assert db.execute(sql,(c,c,3,1)).rowcount==1
assert db.execute('SELECT revision FROM event_control').fetchone()[0]==2
sql=re.search(r"prepare\('(INSERT INTO overlay_state[^']+)'\)",route).group(1)
db.execute(sql,(1,1,4));db.execute(sql,(None,0,5))
assert db.execute('SELECT visible,revision FROM overlay_state').fetchone()==(0,2)
assert db.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]==0
print('PASS: migrations, optimistic concurrency, overlay show/hide, empty initial registry')
