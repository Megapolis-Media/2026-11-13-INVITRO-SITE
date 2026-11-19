'use client';
import {useEffect,useRef,useState} from 'react';
import {Play,Pause,Radio} from 'lucide-react';
import {tracks} from '@/lib/broadcast/catalog';
import type {Participant} from '@/lib/participant/client';
import GuestGreeting from './guest-greeting';
export default function RadioDesk({profile}:{profile:Participant|null}){
 const [selected,setSelected]=useState(0),[playing,setPlaying]=useState(false),[message,setMessage]=useState('Добро пожаловать в «Стол заказов INVITRO»! Что поставим для вашей команды?');const audio=useRef<HTMLAudioElement>(null);
 useEffect(()=>{const a=audio.current;const stop=()=>{a?.pause();setPlaying(false)};const receive=(e:MessageEvent)=>{if(e.origin===location.origin&&e.source===window.parent&&e.data?.type==='invitro.audio.pause')stop()};addEventListener('message',receive);addEventListener('invitro.recording',stop);return()=>{a?.pause();removeEventListener('message',receive);removeEventListener('invitro.recording',stop)}},[]);
 async function choose(index:number){const a=audio.current;if(!a)return;if(index===selected&&playing){a.pause();setPlaying(false);return}window.parent.postMessage({type:'invitro.audio.focus'},location.origin);setSelected(index);a.src=tracks[index].src;try{await a.play();setPlaying(true);setMessage('Ставлю «'+tracks[index].title+'». А кому передадим привет? Напишите или запишите пару тёплых слов.')}catch{setPlaying(false);setMessage('Нажмите на песню ещё раз, чтобы начать воспроизведение.')}}
 return <div className="radio-desk"><audio ref={audio} preload="none" onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setMessage('Эта запись сейчас недоступна. Выберите другую песню.')}}/><div className="radio-host-bubble"><Radio/><p>{message}</p><span>ВЕДУЩИЙ / СТОЛ ЗАКАЗОВ</span></div><div className="radio-playlist">{tracks.map((t,i)=><button key={t.id} onClick={()=>void choose(i)} aria-pressed={selected===i&&playing}><img src={t.cover} alt=""/><span><b>{t.title}</b><small>{t.artist}</small></span>{selected===i&&playing?<Pause size={20}/>:<Play size={20}/>}</button>)}</div><GuestGreeting profile={profile} track={tracks[selected].title+' — '+tracks[selected].artist} allowPostcard={false}/></div>
}
