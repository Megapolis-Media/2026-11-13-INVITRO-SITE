"""Verify the actual reward SQL, migrated database, and concurrent final awards."""
import pathlib,re,sqlite3,tempfile,concurrent.futures
root=pathlib.Path(__file__).resolve().parents[1]
source=(root/'app/api/games/route.ts').read_text()
award=re.search(r'd\.prepare\("(INSERT INTO achievements.*?)"\)\.bind',source).group(1)
issue=re.search(r'export const issue=.*?prepare\(`(.*?)`\)',(root/'lib/participant/server.ts').read_text(),re.S).group(1)
with tempfile.TemporaryDirectory() as tmp:
 path=tmp+'/games.db';c=sqlite3.connect(path)
 for f in sorted((root/'drizzle').glob('*.sql')):c.executescript(f.read_text())
 c.execute('INSERT INTO lottery_settings VALUES(1,1,16,0)')
 c.execute("INSERT INTO participants(id,email,first,last,agglomeration,created) VALUES('u','u@test.invalid','Имя','Фамилия','Юг',0)")
 c.execute(issue,('u','registration',0,'u','registration','u','registration','registration','u','u'))
 def reward(con,number,owner='u',guest=0,solved=1):
  rid=f'{owner}-{number}';key=f'yak:w{number:02}'
  con.execute('INSERT OR IGNORE INTO game_rounds(id,user,game,question,solved,created,expires) VALUES(?,?,?,?,?,0,9999999999999)',(rid,owner,'yak',key,solved))
  con.execute(award,(rid,owner,key,owner,0,guest,rid,owner,owner,owner,key,owner))
  con.execute(issue,(owner,'activity',0,owner,'activity',owner,'activity','activity',owner,owner))
 reward(c,1);reward(c,1)
 assert c.execute('SELECT SUM(points) FROM achievements').fetchone()[0]==10
 reward(c,98,solved=0);assert c.execute('SELECT SUM(points) FROM achievements').fetchone()[0]==10
 reward(c,99,owner='guest:x',guest=1);assert c.execute('SELECT SUM(points) FROM achievements').fetchone()[0]==10
 for n in range(2,10):reward(c,n)
 assert c.execute('SELECT SUM(points) FROM achievements').fetchone()[0]==90
 assert c.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]==1
 c.commit()
 def concurrent_award(n):
  con=sqlite3.connect(path,timeout=30)
  with con:reward(con,n)
  con.close()
 with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:list(pool.map(concurrent_award,[10]*24+list(range(11,35))))
 assert c.execute('SELECT SUM(points) FROM achievements').fetchone()[0]==100
 assert c.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]==2
 assert c.execute('SELECT COUNT(*) FROM achievements WHERE points<=0').fetchone()[0]==0
 print('PASS: per-question +10 once; unsolved/guest zero; 90→100 with 48 concurrent requests; cap100; exactly two tickets; replay no extra reward.')
