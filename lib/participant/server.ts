import type {Participant} from './client';
import {gameProgress,requiredIds} from '../games/catalog';
import {env} from 'cloudflare:workers';
import {studioAuthorization} from '@/lib/event/studio-authorization';
export const settings=()=>env as unknown as {DB:D1Database,MEDIA:R2Bucket,RESEND_API_KEY?:string,MAIL_FROM?:string,EMPLOYEE_EMAIL_DOMAINS?:string,STUDIO_ACCESS_TOKEN?:string,STUDIO_LOGIN?:string,STUDIO_PASSWORD?:string};
export function hasStudioAccess(req:Request) {
  const {STUDIO_ACCESS_TOKEN,STUDIO_LOGIN,STUDIO_PASSWORD}=settings();
  const actual=req.headers.get('authorization');
  if(STUDIO_ACCESS_TOKEN && actual===studioAuthorization('',STUDIO_ACCESS_TOKEN))return true;
  return Boolean(STUDIO_LOGIN && STUDIO_PASSWORD && actual===studioAuthorization(STUDIO_LOGIN,STUDIO_PASSWORD));
}
export function db(){const d=settings().DB;if(!d)throw new Error('Сервис временно недоступен. Попробуйте позже.');return d}
export const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');
export const token=()=>crypto.randomUUID()+crypto.randomUUID();
export const fail=(message:string,status=400)=>Object.assign(new Error(message),{status});
export async function identity(req:Request){const raw=req.headers.get('cookie')?.match(/(?:^|; )invitro_session=([^;]+)/)?.[1];if(!raw)throw fail('Войдите в кабинет по коду из письма.',401);const s=await db().prepare('SELECT user FROM sessions WHERE hash=? AND expires>?').bind(await hash(raw),Date.now()).first<{user:string}>();if(!s)throw fail('Сессия завершена. Войдите ещё раз.',401);return s.user}
export function sameOrigin(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)throw fail('Недопустимый источник запроса.',403)}
export const ticketNumber=(id:number)=>`${String(Math.floor((id-1)/1000)+1).padStart(2,'0')}${String((id-1)%1000).padStart(3,'0')}`;
export async function account(user:string):Promise<Participant>{const d=db(),p=await d.prepare('SELECT id,email,first,last,position,agglomeration,seconds FROM participants WHERE id=?').bind(user).first<any>();if(!p)throw fail('Кабинет не найден.',404);const [t,a,m]=await Promise.all([d.prepare('SELECT id,kind,created FROM tickets WHERE user=? ORDER BY id').bind(user).all<any>(),d.prepare('SELECT game,question FROM game_completions WHERE user=?').bind(user).all<any>(),d.prepare('SELECT id,name,type,kind,size FROM media WHERE user=? ORDER BY created DESC').bind(user).all<any>()]);return{...p,name:[p.first,p.last].filter(Boolean).join(' '),number:t.results[0]?ticketNumber(t.results[0].id):'',tickets:t.results.map(v=>({...v,number:ticketNumber(v.id)})),gameProgress:gameProgress(a.results),media:m.results}}
export async function lotteryConfig(){return await db().prepare('SELECT open,groups FROM lottery_settings WHERE id=1').first<{open:number,groups:number}>()||{open:0,groups:13}}
export const issue=(user:string,kind:'registration'|'activity')=>db().prepare(`INSERT INTO tickets(user,kind,created) SELECT ?,?,? WHERE
(SELECT COALESCE(MAX(id),0) FROM tickets)<COALESCE((SELECT groups*1000 FROM lottery_settings WHERE id=1),13000)
AND NOT EXISTS(SELECT 1 FROM tickets WHERE user=? AND kind=?)
AND EXISTS(SELECT 1 FROM participants WHERE id=? AND first<>'' AND last<>'' AND agglomeration<>'')
AND ((?='registration' AND COALESCE((SELECT open FROM lottery_settings WHERE id=1),0)=1 AND (SELECT COUNT(*) FROM tickets WHERE kind='registration')<COALESCE((SELECT groups*500 FROM lottery_settings WHERE id=1),6500))
OR (?='activity' AND EXISTS(SELECT 1 FROM tickets WHERE user=? AND kind='registration') AND EXISTS (
 SELECT required.key FROM json_each(?) required
 JOIN json_each(required.value) task
 LEFT JOIN game_completions c ON c.user=? AND c.game=required.key AND c.question=task.value
 GROUP BY required.key HAVING COUNT(c.question)=COUNT(*)
)))`).bind(user,kind,Date.now(),user,kind,user,kind,kind,user,JSON.stringify(requiredIds),user);
export const queueMail=(user:string)=>db().prepare("INSERT INTO ticket_mail(ticket) SELECT id FROM tickets WHERE user=? AND NOT EXISTS(SELECT 1 FROM ticket_mail WHERE ticket=tickets.id)").bind(user);
export function responseError(e:unknown){const err=e as Error&{status?:number};console.error('Participant request failed:',err.status||500,err.status?err.message:'storage or upstream failure');return Response.json({error:err.status?err.message:'Не удалось сохранить изменения. Данные формы оставлены — попробуйте ещё раз.'},{status:err.status||503,headers:{'Cache-Control':'no-store'}})}

// Returning players may already have finished a studio before the rules changed.
export async function accountWithReward(user:string) {
 const profile=await account(user);
 if (!profile.tickets.length || profile.tickets.some(t=>t.kind==='activity')) return profile;
 if (!Object.values(profile.gameProgress).some(p=>p.total>0 && p.solved===p.total)) return profile;
 await db().batch([issue(user,'activity'),queueMail(user)]);
 return account(user);
}
