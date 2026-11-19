import {settings,db} from '@/lib/participant/server';
import {postcards} from './catalog';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
/** Persist first; mail success is only claimed after the transport accepts it. */
export async function deliverPostcard(id:string){
 const cfg=settings(),d=db();
 if(!cfg.RESEND_API_KEY||!cfg.MAIL_FROM)return 'queued';
 const p=await d.prepare("UPDATE broadcast_posts SET delivery='sending',attempted=? WHERE id=? AND kind='postcard' AND state='saved' AND (delivery='queued' OR (delivery='sending' AND attempted<?)) RETURNING *").bind(Date.now(),id,Date.now()-60000).first<any>();
 if(!p)return (await d.prepare('SELECT delivery FROM broadcast_posts WHERE id=?').bind(id).first<{delivery:string}>())?.delivery||'queued';
 try{
  const art=postcards.find(t=>t.id===p.template)!;
  const html=`<!doctype html><html lang="ru"><body style="margin:0;background:#e9f8fa;font-family:Arial,sans-serif;color:#005564"><table role="presentation" width="100%"><tr><td align="center" style="padding:28px 14px"><table role="presentation" width="560" style="max-width:100%;background:white;border-radius:20px;overflow:hidden"><tr><td><img width="560" style="width:100%;display:block" src="https://invitro-telecenter.megapolismedia.chatgpt.site${art.image}" alt="${art.title}"></td></tr><tr><td style="padding:30px"><p style="font-size:12px;letter-spacing:2px">УТРЕННЯЯ ПОЧТА · INVITRO</p><h1 style="font-size:28px">${escape(p.recipient)}, с Новым годом!</h1><p style="font-size:18px;line-height:1.65;white-space:pre-wrap">${escape(p.body)}</p><p style="border-top:1px solid #c9e9ee;padding-top:20px">С теплом, ${escape(p.sender_name)}<br><small>${escape(p.position)}</small></p><p style="font-size:12px">Открытка отправлена коллегой через Телецентр INVITRO. Копия поздравления сохранена для редактора радио; выход в эфир — по выбору редакции.</p></td></tr></table></td></tr></table></body></html>`;
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${cfg.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':'postcard-'+p.id},body:JSON.stringify({from:cfg.MAIL_FROM,to:[p.recipient_email],subject:'Новогодняя открытка от '+p.sender_name,html,text:`${p.recipient}, с Новым годом!\n\n${p.body}\n\nС теплом, ${p.sender_name}\n${p.position}\nУтренняя почта — Телецентр INVITRO`}),signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw new Error('Mail not accepted');
  await d.prepare("UPDATE broadcast_posts SET delivery='sent' WHERE id=?").bind(id).run();return 'sent';
 }catch{await d.prepare("UPDATE broadcast_posts SET delivery='queued' WHERE id=?").bind(id).run();return 'queued';}
}
