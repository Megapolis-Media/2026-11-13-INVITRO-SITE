import {state} from '@/lib/event/server';
import {activePhase} from '@/lib/event/config';
import {responseError} from '@/lib/participant/server';
export const dynamic='force-dynamic';
export async function GET(){try{const s=await state();return Response.json({config:s.published,mode:activePhase(s.published),revision:s.revision},{headers:{'Cache-Control':'no-store'}})}catch(e){return responseError(e)}}
