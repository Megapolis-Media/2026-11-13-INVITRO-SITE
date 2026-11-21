"""Registration and number capacity use the real issuance statement."""
import sqlite3
from game_rewards_sql import issue, person, solve, root

db=sqlite3.connect(':memory:')
for f in sorted((root/'drizzle').glob('*.sql')):
    db.executescript(f.read_text())
person(db,'closed')
issue(db,'closed','registration')
assert db.execute('SELECT COUNT(*) FROM tickets').fetchone()[0] == 0
db.execute('INSERT INTO lottery_settings VALUES(1,1,16,0)')
for n in range(8000):
    user=str(n)
    person(db,user)
    issue(db,user,'registration')
    solve(db,user,'pelsh','m01')
    solve(db,user,'pelsh','m02')
    issue(db,user)
person(db,'overflow')
issue(db,'overflow','registration')
assert db.execute('SELECT COUNT(*), MAX(id) FROM tickets').fetchone() == (16000,16000)
assert db.execute("SELECT COUNT(*) FROM tickets WHERE kind='registration'").fetchone()[0] == 8000
assert db.execute('SELECT MAX(n) FROM (SELECT COUNT(*) n FROM tickets GROUP BY user)').fetchone()[0] == 2
print('PASS: registration closed, 8000 participants, 16000 unique ticket numbers, capacity.')
