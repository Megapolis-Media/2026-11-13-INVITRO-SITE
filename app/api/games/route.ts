import {db,identity,hash,token,fail,sameOrigin,accountWithReward,issue,queueMail,responseError} from '@/lib/participant/server';
import {deliverUserTickets} from '@/lib/participant/ticket-mail';
import {playable,requiredIds} from '@/lib/games/catalog';

export const dynamic='force-dynamic';
type Studio=keyof typeof playable;
type Row={id:string,user:string,game:Studio,question:string,letters:string,attempts:number,solved:number,created:number,expires:number};
const totals={yak:requiredIds.yak.length,pelsh:requiredIds.pelsh.length};
export function GET(){return Response.json({totals},{headers:{'Cache-Control':'no-cache'}})}

function options(q:typeof playable.pelsh[number]) {
 return [q.title,...q.distractors].sort((a,b)=>a.localeCompare(b,'ru')).map((title,i)=>({id:'choice-'+i,title}));
}
function details(r:Row){
 const q=playable[r.game].find(q=>q.id===r.question);
 if(!q)throw fail('Задания обновлены. Начните новый раунд.',409);
 const finished=!!r.solved||r.attempts>=6;
 return {id:r.id,game:r.game,letters:r.letters,attempts:r.attempts,solved:!!r.solved,finished,guest:r.user.startsWith('guest:'),
  ...('answer' in q ? {category:q.category,hint:q.hint,mask:[...q.answer].map(c=>finished||r.letters.includes(c)||!/[А-Я]/.test(c)?c:'•').join(''),answer:finished?q.answer:undefined}
   : {category:'',hint:'Узнайте мелодию',mask:'',choices:options(q),audio:q.audio,answer:finished?q.title:undefined})};
}

export async function POST(req:Request){
 try{
  sameOrigin(req);
  const b=await req.json() as Record<string,unknown>,d=db(),now=Date.now();
  let user:string,guest=false;
  const headers:Record<string,string>={'Cache-Control':'no-store'};
  try{user=await identity(req)}catch(e){
   if((e as {status?:number}).status!==401)throw e;
   guest=true;
   const raw=req.headers.get('cookie')?.match(/(?:^|; )invitro_game=([a-f0-9-]{72})/)?.[1]||token();
   user='guest:'+await hash(raw);
   headers['Set-Cookie']=`invitro_game=${raw}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`;
  }
  if(b.action==='start'){
   const game=b.game;
   if(game!=='yak'&&game!=='pelsh')throw fail('Выберите игру.');
   const recent=await d.prepare('SELECT COUNT(*) AS n FROM game_rounds WHERE user=? AND created>?').bind(user,now-60000).first<{n:number}>();
   if((recent?.n||0)>=15)throw fail('Слишком быстро. Подождите минуту.',429);
   const bank=playable[game];
   if(!bank.length)throw fail('Задания готовятся к эфиру.',503);
   const history=await d.prepare(`SELECT question,MAX(solved) AS solved,MAX(created) AS last FROM (
     SELECT question,solved,created FROM game_rounds WHERE user=? AND game=?
     UNION ALL SELECT question,1,0 FROM game_completions WHERE user=? AND game=?
   ) GROUP BY question`).bind(user,game,user,game).all<{question:string,solved:number,last:number}>();
   const byId=new Map(history.results.map(h=>[h.question,h]));
   const pending=bank.filter(q=>!byId.get(q.id)?.solved);
   const candidates=pending.length?pending:bank;
   const oldest=Math.min(...candidates.map(q=>byId.get(q.id)?.last||0));
   const pool=candidates.filter(q=>(byId.get(q.id)?.last||0)===oldest);
   const question=pool[crypto.getRandomValues(new Uint32Array(1))[0]%pool.length].id;
   const r:Row={id:crypto.randomUUID(),user,game,question,letters:'',attempts:0,solved:0,created:now,expires:now+3600000};
   await d.prepare('INSERT INTO game_rounds(id,user,game,question,created,expires) VALUES(?,?,?,?,?,?)').bind(r.id,user,game,question,now,r.expires).run();
   return Response.json({round:details(r),totals},{headers});
  }
  const r=await d.prepare('SELECT * FROM game_rounds WHERE id=? AND user=? AND expires>?').bind(String(b.roundId||''),user,now).first<Row>();
  if(!r)throw fail('Раунд завершён. Начните следующий.',404);
  if(!r.solved&&r.attempts<6){
   let correct=false,wrong=0,letter='';
   if(b.action==='letter'&&r.game==='yak'){
    letter=String(b.letter||'').toUpperCase().replaceAll('Ё','Е');
    if(!/^[А-Я]$/.test(letter))throw fail('Выберите букву.');
    const q=playable.yak.find(q=>q.id===r.question);
    if(!q)throw fail('Задания обновлены. Начните новый раунд.',409);
    if(r.letters.includes(letter))letter='';
    wrong=letter&&!q.answer.includes(letter)?1:0;
    correct=[...q.answer].every(c=>!/[А-Я]/.test(c)||r.letters.includes(c)||c===letter);
   }else if(b.action==='answer'&&r.game==='pelsh'){
    const q=playable.pelsh.find(q=>q.id===r.question);
    if(!q)throw fail('Задания обновлены. Начните новый раунд.',409);
    const choice=options(q).find(o=>o.id===b.answer);
    if(!choice)throw fail('Обновите задание и выберите один из ответов.');
    correct=choice.title===q.title;wrong=correct?0:1;
   }else throw fail('Недопустимое действие.');
   const updates=[d.prepare('UPDATE game_rounds SET letters=letters||?,attempts=attempts+?,solved=? WHERE id=? AND user=? AND solved=0 AND attempts=? AND letters=?')
    .bind(letter,wrong,correct?1:0,r.id,user,r.attempts,r.letters)];
   if(!guest&&correct)updates.push(
    d.prepare('INSERT OR IGNORE INTO game_completions(user,game,question) SELECT user,game,question FROM game_rounds WHERE id=? AND user=? AND solved=1').bind(r.id,user),
    issue(user,'activity'),queueMail(user)
   );
   await d.batch(updates);
  }
  const updated=await d.prepare('SELECT * FROM game_rounds WHERE id=? AND user=?').bind(r.id,user).first<Row>();
  const profile=guest?undefined:await accountWithReward(user);
  if(profile?.tickets.some(t=>t.kind==='activity'))await deliverUserTickets(user);
  return Response.json({round:details(updated!),profile,totals},{headers});
 }catch(e){return responseError(e)}
}
