'use client';
import {useEffect,useRef,useState,type MutableRefObject} from 'react';
import {Play,Pause,Volume2,VolumeX,RotateCcw,ArrowLeft,Maximize2,Armchair,ArrowUpRight} from 'lucide-react';
import {SHOW_DURATION,lookAtTime} from './fashion-timeline.mjs';
const collection=[
 ['crew','Носи свою роль','Куртка «Съёмочная группа», поло, шарф и шапка.'],
 ['accessories','Прибавь себя','Брелок-телевизор, пин-фейдер, подвески и органайзер.'],
 ['footwear','Твой выход','Телеобувь и телекеды: фирменные детали с головы до ног.'],
 ['home','Домашний эфир','Светильник «Пауза», плед, новогодний шар и подарочный набор.'],
 ['frequency','Настройся на себя','Радио-брелок с собственной частотой.'],
];
export function FashionCollection(){return <div className="fashion-collection">{collection.map(([image,title,detail],i)=><article key={image}><img src={'/merch/'+image+'.webp'} alt={detail} width={1600} height={900} loading="lazy"/><div><span>0{i+1} / НОВЫЙ СЕЗОН 2026</span><h3>{title}</h3><p>{detail}</p></div></article>)}</div>}
const clock=(t:number)=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
export default function FashionShow({engine,onPlaying,onCollection,onExit,blocked}:{engine:MutableRefObject<any>,onPlaying:(v:boolean)=>void,onCollection:()=>void,onExit:()=>void,blocked:boolean}){
 const audio=useRef<HTMLAudioElement>(null),[playing,setPlaying]=useState(false),[muted,setMuted]=useState(false),[time,setTime]=useState(0),[duration,setDuration]=useState(SHOW_DURATION),[wide,setWide]=useState(false),[error,setError]=useState(''),[started,setStarted]=useState(false);
 const look=lookAtTime(time);
 useEffect(()=>{const a=audio.current!;let frame=0;const sync=()=>{engine.current?.setFashionPlayback(a.currentTime,!a.paused);frame=requestAnimationFrame(sync)};frame=requestAnimationFrame(sync);const stop=()=>a.pause();const hidden=()=>{if(document.hidden)stop()};const receive=(e:MessageEvent)=>{if(e.origin===location.origin&&e.source===window.parent&&e.data?.type==='invitro.audio.pause')stop()};document.addEventListener('visibilitychange',hidden);addEventListener('message',receive);addEventListener('invitro.recording',stop);return()=>{a.pause();cancelAnimationFrame(frame);engine.current?.setFashionPlayback(0,false);onPlaying(false);document.removeEventListener('visibilitychange',hidden);removeEventListener('message',receive);removeEventListener('invitro.recording',stop)}},[engine,onPlaying]);
 useEffect(()=>{if(blocked)audio.current?.pause()},[blocked]);
 async function toggle(){const a=audio.current!;if(!a.paused){a.pause();return}if(a.ended)a.currentTime=0;window.parent.postMessage({type:'invitro.audio.focus'},location.origin);setError('');try{await a.play();setStarted(true)}catch{setError('Не удалось включить трек. Нажмите «Презентация под музыку» ещё раз.')}}
 function state(v:boolean){setPlaying(v);onPlaying(v)}
 function view(){const next=!wide;setWide(next);engine.current?.setFashionCamera(next)}
 return <section className={'fashion-show'+(playing?' is-playing':'')} aria-label="Показ коллекции Новый сезон 2026">
  <audio ref={audio} src="/merch/runway-show.mp3" preload="metadata" onPlay={()=>state(true)} onPause={()=>state(false)} onEnded={()=>state(false)} onLoadedMetadata={()=>{const d=audio.current!.duration;if(Number.isFinite(d))setDuration(d)}} onTimeUpdate={()=>setTime(audio.current!.currentTime)} onError={()=>setError('Трек пока не загрузился. Проверьте подключение и повторите запуск.')}/>
  <div className="fashion-masthead"><button onClick={onExit}><ArrowLeft size={16}/>В телецентр</button><span>INVITRO <b>/</b> НОВЫЙ СЕЗОН 2026</span><button onClick={view}>{wide?<Armchair size={17}/>:<Maximize2 size={17}/>}<span>{wide?'Первый ряд':'Общий план'}</span></button></div>
  {!started&&<div className="fashion-intro"><span>МОДНЫЙ ПРИГОВОР / АЛЕКСАНДР ВАСИЛЬЕВ</span><h2>Ваш выход.</h2><p>Новый сезон начинается с вас.<br/>Займите место в первом ряду.</p></div>}
  <div className="fashion-console">
   <div className="fashion-look"><span>{look.index===5?'ФИНАЛ':String(look.index+1).padStart(2,'0')+' / 05'} <i/> КОЛЛЕКЦИЯ INVITRO</span><h3>{look.title}</h3><p>{look.detail}</p></div>
   <div className="fashion-actions"><button className="fashion-play" onClick={toggle}>{playing?<Pause size={19}/>:<Play size={19}/>}<span>{playing?'Пауза':time>=duration-1?'Посмотреть ещё раз':started?'Продолжить показ':'Презентация под музыку'}</span></button><button className="fashion-catalog" onClick={()=>{audio.current?.pause();onCollection()}}>Коллекция<ArrowUpRight size={16}/></button></div>
   {started&&<div className="fashion-timeline"><button aria-label="Начать показ заново" onClick={()=>{audio.current!.currentTime=0;setTime(0)}}><RotateCcw size={15}/></button><span>{clock(time)}</span><input type="range" min="0" max={duration} step="0.1" value={time} aria-label="Время показа" aria-valuetext={clock(time)+' из '+clock(duration)} onChange={e=>{const t=Number(e.target.value);audio.current!.currentTime=t;setTime(t);engine.current?.setFashionPlayback(t,playing)}}/><span>{clock(duration)}</span><button aria-label={muted?'Включить звук показа':'Выключить звук показа'} aria-pressed={muted} onClick={()=>{audio.current!.muted=!muted;setMuted(!muted)}}>{muted?<VolumeX size={17}/>:<Volume2 size={17}/>}</button></div>}
   <div className="fashion-soundtrack"><span>IT’S MY LIFE / DJ BAUR RAP EDIT</span><span>{playing?'ПОКАЗ ИДЁТ':started?'ПОКАЗ НА ПАУЗЕ':'2:54 · ПЯТЬ ВЫХОДОВ И ФИНАЛ'}</span></div>
   {error&&<p className="fashion-error" role="alert">{error}</p>}
  </div>
 </section>
}
