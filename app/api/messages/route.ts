import {db,settings,hash,identity,sameOrigin,fail,responseError,account} from '@/lib/participant/server';
import {postcards} from '@/lib/broadcast/catalog';
import {deliverPostcard} from '@/lib/broadcast/server';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 let objectKey:string|undefined,postId:string|undefined;
 try{
  sameOrigin(req);if(Number(req.headers.get('content-length')||0)>26*1024*1024)throw fail('Максимальный размер файла — 25 МБ.',413);
  const f=await req.formData(),get=(key:string)=>String(f.get(key)||'').trim();
  const id=get('id'),kind=get('kind'),recipient=get('recipient'),email=get('email').toLowerCase(),body=get('body'),template=get('template'),track=get('track');
  let user:string|null=null;try{user=await identity(req)}catch(e){if((e as any).status!==401)throw e}
  const owner=user?await account(user):null,name=owner?owner.name:get('name'),position=owner?owner.agglomeration:get('position');
  if(!/^[a-f0-9-]{36}$/.test(id)||!['greeting','postcard'].includes(kind))throw fail('Обновите форму и попробуйте ещё раз.');
  if(name.length<2||name.length>120||position.length>120||recipient.length<2||recipient.length>150||body.length>2000||track.length>200)throw fail('Проверьте имя, получателя и длину сообщения.');
  if(f.get('consent')!=='true')throw fail('Разрешите передать поздравление редактору эфира.');
  const file=f.get('file'),attachment=file instanceof File&&file.size>0?file:null,type=attachment?.type.split(';')[0];
  if(!body&&!attachment)throw fail('Добавьте текст или голосовое сообщение.');
  if(attachment&&(attachment.size>25*1024*1024||!['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/webm','audio/ogg','audio/wav','video/mp4','video/webm','video/quicktime'].includes(type!)))throw fail('Прикрепите изображение, аудио или видео до 25 МБ.');
  if(kind==='postcard'&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!postcards.some(t=>t.id===template)||!body||body.length>600||attachment))throw fail('Для открытки нужны адрес коллеги, шаблон и текст до 600 символов.');
  const d=db(),ip=await hash(req.headers.get('cf-connecting-ip')||'unknown'),now=Date.now();
  const existing=await d.prepare('SELECT state,delivery,ip,user FROM broadcast_posts WHERE id=?').bind(id).first<any>();
  if(existing){if(user?existing.user!==user:existing.user||existing.ip!==ip)throw fail('Создайте новое поздравление.',409);if(existing.state!=='saved')throw fail('Сообщение ещё сохраняется. Повторите через минуту.',409);return Response.json({saved:true,id,delivery:existing.delivery==='sending'?'queued':existing.delivery},{headers:{'Cache-Control':'no-store'}})}
  // The rate limit and reservation are one statement, including concurrent requests.
  const reserved=await d.prepare("INSERT INTO broadcast_posts(id,user,kind,sender_name,position,recipient,recipient_email,body,template,track,ip,state,delivery,created,attempted) SELECT ?,?,?,?,?,?,?,?,?,?,?,'saving',?,?,0 WHERE (SELECT COUNT(*) FROM broadcast_posts WHERE ((? IS NOT NULL AND user=?) OR (? IS NULL AND ip=?)) AND created>?)<5 RETURNING id").bind(id,user,kind,name,position,recipient,email,body,template,track,ip,kind==='postcard'?'queued':'editor',now,user,user,user,ip,now-3600000).first();
  if(!reserved)throw fail('Можно передать до пяти поздравлений в час. Попробуйте немного позже.',429);postId=id;
  let mediaId:string|null=null;
  const queries=[];
  if(attachment){mediaId=crypto.randomUUID();objectKey=`broadcast/${id}/${mediaId}`;await settings().MEDIA.put(objectKey,attachment.stream(),{httpMetadata:{contentType:type!}});queries.push(d.prepare('INSERT INTO media(id,user,key,name,type,kind,size,consent,created) VALUES(?,?,?,?,?,?,?,?,?)').bind(mediaId,user||'guest:'+id,objectKey,attachment.name.slice(0,150),type!,'greeting',attachment.size,1,now));}
  queries.push(d.prepare("UPDATE broadcast_posts SET state='saved',media_id=? WHERE id=?").bind(mediaId,id));await d.batch(queries);objectKey=undefined;postId=undefined;
  const delivery=kind==='postcard'?await deliverPostcard(id):'editor';return Response.json({saved:true,id,delivery},{headers:{'Cache-Control':'no-store'}});
 }catch(e){if(objectKey)await settings().MEDIA.delete(objectKey).catch(()=>{});if(postId)await db().prepare("DELETE FROM broadcast_posts WHERE id=? AND state='saving'").bind(postId).run().catch(()=>{});return responseError(e)}
}
