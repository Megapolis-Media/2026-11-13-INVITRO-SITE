"""Exercise migration, either studio, ticket limits and concurrent issuance against actual SQL."""
import concurrent.futures
import json
from pathlib import Path
import re
import sqlite3
import tempfile

root = Path(__file__).resolve().parents[1]
source = (root / 'lib/participant/server.ts').read_text()
issue_sql = re.search(r'export const issue=.*?prepare\(`(.*?)`\)', source, re.S)[1]
required = {'yak': ['w11', 'w12'], 'pelsh': ['m01', 'm02']}


def issue(db, user, kind='activity', bank=required):
    db.execute(issue_sql, (user, kind, 1, user, kind, user, kind, kind, user, json.dumps(bank), user))


def person(db, user):
    db.execute("INSERT INTO participants(id,email,first,last,agglomeration,created) VALUES(?,?,'Имя','Фамилия','Юг',0)", (user, user+'@example.test'))


def solve(db, user, game, question):
    db.execute('INSERT OR IGNORE INTO game_completions VALUES(?,?,?)', (user, game, question))


def count(db, user):
    return db.execute('SELECT COUNT(*) FROM tickets WHERE user=?', (user,)).fetchone()[0]


if __name__ == '__main__':
    with tempfile.TemporaryDirectory() as tmp:
        db_path = tmp+'/lottery.db'
        db = sqlite3.connect(db_path)
        migrations = sorted((root / 'drizzle').glob('*.sql'))
        for f in migrations[:-1]:
            db.executescript(f.read_text())
        person(db, 'legacy')
        db.execute("INSERT INTO achievements VALUES('a','legacy','yak:w11',10,0)")
        db.execute("INSERT INTO achievements VALUES('b','legacy','yak',90,0)")
        db.execute("INSERT INTO game_rounds(id,user,game,question,solved,created,expires) VALUES('r','legacy','yak','w12',1,0,1)")
        db.executescript(migrations[-1].read_text())
        assert db.execute('SELECT COUNT(*) FROM game_completions').fetchone()[0] == 2
        db.execute('INSERT INTO lottery_settings VALUES(1,1,13,0)')
        for user in ('legacy', 'music', 'mixed', 'empty'):
            if user != 'legacy':
                person(db, user)
            issue(db, user, 'registration')
        issue(db,'legacy')
        assert count(db,'legacy') == 2
        solve(db,'mixed','yak','w11')
        solve(db,'mixed','pelsh','m02')
        solve(db,'mixed','yak','retired')
        issue(db,'mixed')
        assert count(db,'mixed') == 1
        issue(db,'empty', bank={'yak': [], 'pelsh': []})
        assert count(db,'empty') == 1
        for question in required['pelsh']:
            solve(db,'music','pelsh',question)
        db.commit()

        def claim(_):
            con=sqlite3.connect(db_path, timeout=30)
            with con:
                issue(con,'music')
            con.close()

        with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
            list(pool.map(claim,range(48)))
        assert count(db,'music') == 2
        for question in required['yak']:
            solve(db,'music','yak',question)
        issue(db,'music')
        assert count(db,'music') == 2
        print('PASS: migration, exact published tasks, empty/partial/mixed studios, either studio, 48 concurrent claims, max two tickets.')
