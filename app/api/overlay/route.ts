import {overlayAuthorized,lookup} from '@/lib/event/server';
import {db,responseError,ticketNumber} from '@/lib/participant/server';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{await overlayAuthorized(req);const s=await db().prepare('SELECT * FROM overlay_state WHERE id=1').first<any>();if(!s?.visible)return Response.json({visible:false,revision:s?.revision||0},{headers:{'Cache-Control':'no-store'}});const p=await lookup(s.ticket);return Response.json({...p,number:ticketNumber(p.id),visible:true,revision:s.revision},{headers:{'Cache-Control':'no-store'}})}catch(e){return responseError(e)}}
