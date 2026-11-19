/** Tests the real route handlers with SQLite and an in-memory R2/mail transport.
 * No production bindings, external messages, credentials or test accounts are used. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'invitro-tests-')),sql=new DatabaseSync(':memory:');
for(const name of (await fs.readdir('drizzle')).filter(n=>n.endsWith('.sql')).sort())sql.exec(await fs.readFile('drizzle/'+name,'utf8'));
function prepare(query){let args=[];const q={bind(...v){args=v;return q},async first(){return sql.prepare(query).get(...args)||null},async all(){return{results:sql.prepare(query).all(...args)}},async run(){return sql.prepare(query).run(...args)}};return q}
const objects=new Map();const bindings={DB:{prepare,async batch(list){sql.exec('BEGIN');try{const v=await Promise.all(list.map(q=>q.run()));sql.exec('COMMIT');return v}catch(e){sql.exec('ROLLBACK');throw e}}},MEDIA:{async put(key,data){objects.set(key,await new Response(data).arrayBuffer())},async get(key){return objects.has(key)?{body:objects.get(key)}:null},async delete(key){objects.delete(key)}}};
globalThis.__testEnv=bindings;
const compile=(src)=>ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
await fs.writeFile(path.join(dir,'server.mjs'),compile((await fs.readFile('lib/participant/server.ts','utf8')).replace('import {env} from \'cloudflare:workers\';','const env=globalThis.__testEnv;')));
await fs.writeFile(path.join(dir,'route.mjs'),compile((await fs.readFile('app/api/participant/route.ts','utf8')).replace("'@/lib/participant/server'","'./server.mjs'")));
for(const [source,target] of [['lib/broadcast/catalog.ts','catalog.mjs'],['lib/broadcast/server.ts','broadcast-server.mjs'],['app/api/messages/route.ts','messages.mjs'],['app/api/studio/route.ts','studio.mjs']])await fs.writeFile(path.join(dir,target),compile((await fs.readFile(source,'utf8')).replaceAll("'@/lib/participant/server'","'./server.mjs'").replaceAll("'@/lib/broadcast/catalog'","'./catalog.mjs'").replaceAll("'./catalog'","'./catalog.mjs'").replaceAll("'@/lib/broadcast/server'","'./broadcast-server.mjs'")));
const messagesRoute=await import(path.join(dir,'messages.mjs')),studioRoute=await import(path.join(dir,'studio.mjs'));
const {POST,GET}=await import(path.join(dir,'route.mjs'));let session='',lastCode='',clock=Date.now();const actualNow=Date.now,actualFetch=globalThis.fetch;Date.now=()=>clock;globalThis.fetch=async(url,init)=>{assert.equal(url,'https://api.resend.com/emails');lastCode=JSON.parse(init.body).text.match(/\d{6}/)[0];return new Response('{}',{status:200})};
async function call(action,data={},cookie=session,origin='https://test.invalid'){const r=await POST(new Request('https://test.invalid/api/participant',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie,'cf-connecting-ip':'test'},body:JSON.stringify({action,...data})}));return{status:r.status,value:await r.json(),cookie:r.headers.get('set-cookie')}}
try{
 assert.equal((await call('code',{email:'person@company.test'})).status,503,'Closed registration is explicit');
 Object.assign(bindings,{RESEND_API_KEY:'test-only-transport',MAIL_FROM:'test@company.test',EMPLOYEE_EMAIL_DOMAINS:'company.test'});
 assert.equal((await call('code',{email:'person@outside.test'})).status,400,'Employee domain gate');
 assert.equal((await call('code',{email:'person@company.test'},'','https://evil.invalid')).status,403,'CSRF origin');
 assert.equal((await call('code',{email:'person@company.test'})).status,200);
 assert.equal((await call('code',{email:'person@company.test'})).status,429,'Resend throttle');
 assert.equal((await call('verify',{email:'person@company.test',code:'xxxxxx'})).status,400);
 clock+=61000;await call('code',{email:'locked@company.test'});const lockedCode=lastCode;for(let i=0;i<5;i++)await call('verify',{email:'locked@company.test',code:lockedCode==='111111'?'222222':'111111'});assert.equal((await call('verify',{email:'locked@company.test',code:lockedCode})).status,400,'OTP locks after five failures');
 clock+=61000;await call('code',{email:'expired@company.test'});const expiredCode=lastCode;clock+=600001;assert.equal((await call('verify',{email:'expired@company.test',code:expiredCode})).status,400,'Expired code cannot sign in');
 await call('code',{email:'person@company.test'});
 const verified=await call('verify',{email:'person@company.test',code:lastCode});assert.equal(verified.status,200);session=verified.cookie.split(';')[0];assert.match(verified.cookie,/HttpOnly; Secure; SameSite=Lax/);
 assert.equal((await call('verify',{email:'person@company.test',code:lastCode})).status,400,'OTP single-use');
 const p=await call('profile',{first:'Тест',last:'Участник',position:'Проверка',consent:true});assert.equal(p.status,200);assert.equal(p.value.tickets.length,1);assert.equal(p.value.number,'01 — 000');
 const again=await call('profile',{first:'Тест',last:'Участник',position:'Проверка',consent:true});assert.equal(again.value.tickets[0].id,1);assert.equal(sql.prepare('SELECT seq FROM sqlite_sequence WHERE name=?').get('tickets').seq,1,'Retry must not burn ticket numbers');
 assert.equal((await call('reward')).status,400,'No unearned ticket');
 for(const game of ['yak','pelsh']){assert.equal((await call('challenge',{game})).status,200);clock+=6000;assert.equal((await call('answer',{game,answer:'wrong'})).status,400);const answer=game==='yak'?'ГИРЛЯНДА|СУФЛЕР|КУРАНТЫ':'Jingle Bells';assert.equal((await call('answer',{game,answer})).status,200);await call('answer',{game,answer})}
 assert.equal((await call('reward')).status,400,'Points alone are insufficient');
 await call('heartbeat');for(let i=0;i<20;i++){clock+=30000;await call('heartbeat');await call('heartbeat')}
 const reward=await call('reward');assert.equal(reward.status,200);assert.equal(reward.value.seconds,600,'Repeated heartbeat cannot inflate time');assert.equal(reward.value.points,100,'Each studio grants points once');assert.equal(reward.value.tickets.length,2);
 const repeat=await call('reward');assert.equal(repeat.value.tickets.length,2);assert.equal(sql.prepare('SELECT seq FROM sqlite_sequence WHERE name=?').get('tickets').seq,2,'Second ticket is idempotent');
 const form=new FormData();form.set('file',new File([new Uint8Array([137,80,78,71])],'photo.png',{type:'image/png'}));form.set('kind','photo');form.set('consent','true');const up=await POST(new Request('https://test.invalid/api/participant',{method:'POST',headers:{Origin:'https://test.invalid',Cookie:session},body:form}));assert.equal(up.status,200);const media=await up.json();assert.equal(objects.size,1);assert.equal((await GET(new Request('https://test.invalid/api/participant?media='+media.id,{headers:{Cookie:session}}))).status,200);assert.equal((await GET(new Request('https://test.invalid/api/participant?media='+media.id))).status,401,'Files are private');
 assert.equal((await call('message',{kind:'greeting',recipient:'Команда',body:'С Новым годом!',mediaId:media.id})).status,200);assert.equal((await call('deleteMedia',{id:media.id})).status,200);assert.equal(objects.size,0);
 assert.equal((await call('contact',{email:'reply@example.test',body:'Тест обращения',recipient:'Поддержка'},'')).status,200,'Support works before sign-in');
 await call('logout');assert.equal((await GET(new Request('https://test.invalid/api/participant',{headers:{Cookie:session}}))).status,401,'Logout revokes session');
 // Guests can send text or a recording without a participant session.
 let sentMail=[];globalThis.fetch=async(url,init)=>{assert.equal(url,'https://api.resend.com/emails');sentMail.push(JSON.parse(init.body));return new Response('{"id":"test-mail"}',{status:200})};
 async function broadcast(values={},origin='https://test.invalid',ip='broadcast-test') {const form=new FormData();const base={id:crypto.randomUUID(),kind:'greeting',name:'Тестовый коллега',position:'Редактор',recipient:'Команда',body:'С Новым годом!',consent:'true',...values};for(const [key,value] of Object.entries(base))form.set(key,value);const r=await messagesRoute.POST(new Request('https://test.invalid/api/messages',{method:'POST',headers:{Origin:origin,'cf-connecting-ip':ip},body:form}));return{status:r.status,value:await r.json()};}
 assert.equal((await broadcast({},'https://evil.invalid')).status,403,'Guest forms enforce origin');
 assert.equal((await broadcast({consent:'false'})).status,400,'Consent required');
 assert.equal((await broadcast({body:''})).status,400,'Empty greeting rejected');
 const guestId=crypto.randomUUID(),guest=await broadcast({id:guestId});assert.equal(guest.status,200);assert.equal(guest.value.delivery,'editor');assert.equal((await broadcast({id:guestId})).status,200);assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM broadcast_posts WHERE id=?').get(guestId).n,1,'Guest retry is idempotent');
 const recorded=await broadcast({body:'',file:new File([new Uint8Array([1,2,3,4])],'voice.webm',{type:'audio/webm'})});assert.equal(recorded.status,200);assert.equal(objects.size,1,'Guest recording saved privately');
 const rec=sql.prepare('SELECT media_id FROM broadcast_posts WHERE id=?').get(recorded.value.id);assert.equal((await GET(new Request('https://test.invalid/api/participant?media='+rec.media_id))).status,401);
 delete bindings.RESEND_API_KEY;const queued=await broadcast({kind:'postcard',template:'snow-mail',email:'colleague@company.test'});assert.equal(queued.status,200);assert.equal(queued.value.delivery,'queued','No false delivery without configured mail');assert.equal(sentMail.length,0);
 bindings.RESEND_API_KEY='test-only-transport';const cardId=crypto.randomUUID();const card=await broadcast({id:cardId,kind:'postcard',template:'warm-radio',email:'colleague@company.test',body:'<script>alert(1)</script> С праздником!'});assert.equal(card.value.delivery,'sent');assert.equal(sentMail.length,1);assert.ok(sentMail[0].html.includes('&lt;script&gt;'));assert.ok(!sentMail[0].html.includes('<script>'),'Mail escapes user HTML');
 await broadcast({id:cardId,kind:'postcard',template:'warm-radio',email:'colleague@company.test'});assert.equal(sentMail.length,1,'Retry cannot send a second mail');
 const failingId=crypto.randomUUID();globalThis.fetch=async()=>new Response('{}',{status:503});assert.equal((await broadcast({id:failingId,kind:'postcard',template:'space-new-year',email:'colleague@company.test'})).value.delivery,'queued','Transport failure preserves queued card');
 assert.equal((await broadcast()).status,429,'Guest rate limit includes recordings and postcards');
 assert.equal((await studioRoute.GET(new Request('https://test.invalid/api/studio'))).status,403,'Queue is not public');
 bindings.STUDIO_ACCESS_TOKEN='test-editor';const studio=await studioRoute.GET(new Request('https://test.invalid/api/studio',{headers:{Authorization:'Bearer test-editor'}}));assert.equal(studio.status,200);const studioData=await studio.json();assert.equal(studioData.posts.length,5);assert.ok(studioData.posts.every(p=>!('ip' in p)));
 globalThis.fetch=async()=>new Response('{}',{status:200});const retry=await studioRoute.POST(new Request('https://test.invalid/api/studio',{method:'POST',headers:{Authorization:'Bearer test-editor',Origin:'https://test.invalid','Content-Type':'application/json'},body:JSON.stringify({id:queued.value.id})}));assert.equal((await retry.json()).delivery,'sent','Editor can dispatch queued postcards');
 console.log('PASS: public text/voice, consent, idempotency, private files, postcard queue, escaped mail, delivery failures, editor dispatch and rate limit.');
 console.log('PASS: mail gate, domains, CSRF, OTP replay, sessions, profile, ticket idempotency, game rewards, heartbeat, private media, greetings, support and logout.');
}finally{Date.now=actualNow;globalThis.fetch=actualFetch;sql.close();await fs.rm(dir,{recursive:true,force:true});delete globalThis.__testEnv}
