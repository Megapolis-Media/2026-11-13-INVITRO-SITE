"""Run actual migration + issuance SQL against SQLite. No outbound email."""
import sqlite3,re,pathlib,tempfile,concurrent.futures
root=pathlib.Path(__file__).resolve().parents[1]
sql=re.search(r'export const issue=.*?prepare\(`(.*?)`\)',(root/'lib/participant/server.ts').read_text(),re.S).group(1)
def issue(c,u,kind):
 c.execute(sql,(u,kind,1,u,kind,u,kind,kind,u,u))
def person(c,u):
 c.execute('INSERT INTO participants(id,email,first,last,agglomeration,created) VALUES(?,?,?,?,?,0)',(u,u+'@test.invalid','Имя','Фамилия','Юг'))
with tempfile.TemporaryDirectory() as tmp:
 path=tmp+'/test.db';c=sqlite3.connect(path)
 for f in sorted((root/'drizzle').glob('*.sql')):c.executescript(f.read_text())
 assert c.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]==0
 person(c,'a');issue(c,'a','registration');assert c.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]==0
 c.execute('INSERT INTO lottery_settings VALUES(1,1,13,0)');issue(c,'a','registration');issue(c,'a','registration')
 assert c.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]==1
 issue(c,'a','activity');assert c.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]==1
 c.execute("INSERT INTO achievements VALUES('x','a','yak',50,0)");issue(c,'a','activity');assert c.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]==1
 c.execute("INSERT INTO achievements VALUES('y','a','pelsh',50,0)");c.commit()
 def simultaneous(_):
  con=sqlite3.connect(path,timeout=30)
  with con:issue(con,'a','activity')
  con.close()
 with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:list(pool.map(simultaneous,range(48)))
 assert c.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]==2
 assert c.execute("SELECT COUNT(*) FROM tickets WHERE kind='registration'").fetchone()[0]==1
 assert c.execute("SELECT COUNT(*) FROM tickets WHERE id=1 AND user='other'").fetchone()[0]==0
 c.execute('UPDATE lottery_settings SET open=0');person(c,'b');issue(c,'b','registration');assert c.execute("SELECT COUNT(*) FROM tickets WHERE user='b'").fetchone()[0]==0
 c.execute('UPDATE lottery_settings SET open=1,groups=16')
 for n in range(1,8000):
  u='u'+str(n);person(c,u);issue(c,u,'registration')
 assert c.execute("SELECT COUNT(*) FROM tickets WHERE kind='registration'").fetchone()[0]==8000
 person(c,'overflow');issue(c,'overflow','registration');assert c.execute("SELECT COUNT(*) FROM tickets WHERE user='overflow'").fetchone()[0]==0
 for n in range(1,8000):
  u='u'+str(n);c.execute('INSERT INTO achievements VALUES(?,?,?,100,0)',('r'+str(n),u,'test'));issue(c,u,'activity')
 assert c.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]==16000
 assert c.execute('SELECT MAX(id) FROM tickets').fetchone()[0]==16000
 assert c.execute('SELECT MAX(n) FROM (SELECT COUNT(*) n FROM tickets GROUP BY user)').fetchone()[0]==2
 print('PASS: zero start; closed registration; idempotency; 50/100 thresholds; 48 concurrent reward requests; ownership; 8,000 people / 16,000 tickets; capacity; max two.')
