'use client';
import {useEffect,useRef,useState,type RefObject} from 'react';
import {Play,Volume2,VolumeX,Maximize,Minimize} from 'lucide-react';
import {defaultConfig} from '@/lib/event/config';
import {tvStaticCue} from '@/lib/radio-tuning';
import './promo-television.css';
import CabinetVolume,{rockCabinet} from './cabinet-volume';

type Phase='idle'|'impact'|'testcard'|'noise'|'loading'|'playing'|'blocked'|'error'|'ended';
const mediaPhase=(s:Phase)=>s==='loading'||s==='playing'||s==='blocked';
const excerpt='/hero-v88/bag-match.mp4',master='/hero-v76/opener-master.mp4',handCue=121/24;

export default function PromoTelevision({src,videoRef,sound,onSound}:{src:string;videoRef:RefObject<HTMLVideoElement|null>;sound:boolean;onSound:()=>void}){
 const body=useRef<HTMLDivElement>(null),rig=useRef<HTMLDivElement>(null);
 const screen=useRef<HTMLDialogElement>(null),expandButton=useRef<HTMLButtonElement>(null),ownsFullscreen=useRef(false);
 const [expanded,setExpanded]=useState(false),[phase,setPhase]=useState<Phase>('idle');
 const state=useRef<Phase>('idle'),visible=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const animation=useRef<Animation|null>(null),attempt=useRef(0),cue=useRef(0),automatic=useRef(true);
 const approved=src===defaultConfig.opener,initialSource=approved?excerpt:src;
 function enter(s:Phase){state.current=s;setPhase(s)}
 function play(){
  const v=videoRef.current;
  if(!v||document.hidden||!mediaPhase(state.current)||cue.current>0)return;
  const id=++attempt.current;
  void v.play().catch((e:Error)=>{if(attempt.current!==id||e.name==='AbortError')return;enter(e.name==='NotAllowedError'?'blocked':'error')});
 }
 function cancelCues(){clearTimeout(timer.current);animation.current?.cancel();animation.current=null}
 function knock(motion:boolean){
  const cabinet=rig.current;
  if(cabinet&&motion)animation.current=rockCabinet(cabinet,'tv');
  // The encoded first frame and the poster are the same bag reveal. Both
  // become visible in the paint that removes the external sphere.
  clearTimeout(timer.current);
  if(body.current)body.current.dataset.matchCut='true';
  enter('loading');
  if(!document.hidden)play();
 }
 useEffect(()=>{
  const v=videoRef.current;automatic.current=true;cue.current=0;enter('idle');if(v&&v.getAttribute('src')!==initialSource)v.src=initialSource;
  if(body.current)delete body.current.dataset.matchCut;
  const reset=()=>{
   if(body.current)delete body.current.dataset.matchCut;
   attempt.current++;cancelCues();automatic.current=true;cue.current=0;enter('idle');
   if(v){v.pause();if(v.getAttribute('src')!==initialSource||v.error){v.src=initialSource;v.load()}
    else if(v.readyState>=1)v.currentTime=0}
  };
  const warmFilm=()=>{if(v&&state.current==='idle'&&v.preload!=='auto'){v.preload='auto';if(v.readyState<2)v.load()}};
  window.addEventListener('telecenter:receiver-impact',warmFilm);
  const approach=()=>{
   if(state.current!=='idle')return;
   enter('testcard');
   timer.current=setTimeout(()=>{
    if(state.current!=='testcard')return;enter('noise');
    const radio=document.querySelector<HTMLAudioElement>('.ny-site>audio');
    if(!document.hidden&&(v?.muted===false||(radio&&!radio.paused&&!radio.muted)))tvStaticCue();
   },42);
  };
  window.addEventListener('telecenter:tv-approach',approach);
  const hit=(event:Event)=>{
   if(!['idle','testcard','noise'].includes(state.current))return;
   knock((event as CustomEvent).detail?.motion!==false);
  };
  const smart=()=>{const shown=(visible.current||!!screen.current?.matches(':modal'))&&!document.hidden;
   if(shown){if(mediaPhase(state.current)&&state.current!=='blocked'&&v?.paused)play()}
   else {attempt.current++;v?.pause()}};
  const observer=new IntersectionObserver(([entry])=>{visible.current=entry.isIntersecting;smart()});
  if(body.current)observer.observe(body.current);
  window.addEventListener('telecenter:journey-reset',reset);window.addEventListener('telecenter:tv-impact',hit);document.addEventListener('visibilitychange',smart);
  return()=>{attempt.current++;cancelCues();observer.disconnect();window.removeEventListener('telecenter:tv-approach',approach);window.removeEventListener('telecenter:receiver-impact',warmFilm);window.removeEventListener('telecenter:journey-reset',reset);window.removeEventListener('telecenter:tv-impact',hit);document.removeEventListener('visibilitychange',smart)};
 },[initialSource,videoRef]);
 function metadata(){
  const v=videoRef.current;if(!v)return;
  if(cue.current){v.currentTime=cue.current;cue.current=0}
  if(mediaPhase(state.current)&&visible.current)play();
 }
 function fallback(){
  const v=videoRef.current;if(!v)return;
  const url=v.getAttribute('src');
  if(approved&&url!==src){cue.current=automatic.current?handCue:0;v.src=url===excerpt?master:src;v.load()}
  else enter('error');
 }
 function start(restart=true){
  const v=videoRef.current;if(!v)return;
  cancelCues();window.dispatchEvent(new Event('telecenter:tv-manual'));enter('loading');
  if(restart||(!automatic.current&&v.ended)){
   automatic.current=false;cue.current=0;
   const target=approved?master:src;
   if(v.getAttribute('src')!==target){v.src=target;v.load()}else if(v.readyState>=1)v.currentTime=0;
  }
  if(v.error)v.load();play();
 }
 function expand() {
  const tube=screen.current;
  if(!tube||tube.matches(':modal'))return;
  if(!mediaPhase(state.current)||videoRef.current?.paused)start(false);
  tube.close();
  tube.showModal();
  setExpanded(true);
  tube.querySelector<HTMLButtonElement>('.tv-close')?.focus({preventScroll:true});
  if(document.fullscreenEnabled && !document.fullscreenElement){
   void document.documentElement.requestFullscreen().then(()=>{
    ownsFullscreen.current=true;
    if(!tube.matches(':modal')){ownsFullscreen.current=false;void document.exitFullscreen().catch(()=>{})}
   }).catch(()=>{}); // Embedded browsers can still expand the same playing video in the dialog.
  }
 }
 function collapse() {
  const tube=screen.current;
  if(!tube?.matches(':modal'))return;
  tube.close();
  tube.show();
  setExpanded(false);
  expandButton.current?.focus({preventScroll:true});
  if(ownsFullscreen.current&&document.fullscreenElement){ownsFullscreen.current=false;void document.exitFullscreen().catch(()=>{})}
 }
 useEffect(()=>{
  const exit=()=>{if(ownsFullscreen.current&&!document.fullscreenElement){ownsFullscreen.current=false;collapse()}};
  document.addEventListener('fullscreenchange',exit);
  return()=>document.removeEventListener('fullscreenchange',exit);
 },[]);
 return <div className="promo-tv-stage"><div ref={body} className={'promo-tv-object '+phase} data-state={phase}>
  <div className="cabinet-floor-shadow" aria-hidden="true"/><div ref={rig} className="promo-tv-rig"><CabinetVolume instrument="tv"/><img className="promo-tv-shell" src="/media/tv-kv-poster.webp" width="1920" height="1080" alt="" decoding="async"/>
  <dialog open ref={screen} className="promo-tv-screen" role={expanded?'dialog':'group'} aria-label="Анонс Новогоднего телецентра" onCancel={event=>{event.preventDefault();collapse()}}>
   <video ref={videoRef} src={initialSource} poster={approved?'/hero-v88/bag-match.webp':undefined} muted={!sound} playsInline preload={approved?'auto':'metadata'}
    onLoadedMetadata={metadata} onPlaying={()=>{if(mediaPhase(state.current))enter('playing');else videoRef.current?.pause()}}
    onEnded={()=>enter('ended')} onError={fallback} aria-label="Анонс Новогоднего телецентра"/>
   <div className="promo-signal" aria-hidden="true"><div className="signal-card"><i/></div><div className="signal-noise"/></div>
   <div className="promo-tv-glass" aria-hidden="true"/>
   <div className="tv-expanded-controls"><button data-ui-action="secondary" type="button" onClick={onSound}>{sound?<Volume2 size={18}/>:<VolumeX size={18}/>} {sound?'Без звука':'Со звуком'}</button><button data-ui-action="secondary" type="button" className="tv-close" onClick={collapse}><Minimize size={18}/>Свернуть</button></div>
  </dialog><i className="cabinet-entry-light" aria-hidden="true"/><i className="promo-tv-lamp" aria-hidden="true"/>
  <i className="promo-tv-contact" aria-hidden="true"/></div>
 </div><div className="promo-tv-controls"><button data-ui-action="solid" title={phase==='playing'||phase==='ended'?'Сначала':'Смотреть анонс'} className="ny-button" onClick={()=>start(phase!=='blocked')}><Play size={18}/><span>{phase==='blocked'?'Продолжить':phase==='playing'||phase==='ended'?'Сначала':'Смотреть анонс'}</span></button>
 <button data-ui-action="secondary" title={sound?'Без звука':'Со звуком'} className="ny-text-button" onClick={()=>{onSound();if(phase==='idle'||phase==='blocked'||phase==='ended')start(false)}}>{sound?<Volume2 size={18}/>:<VolumeX size={18}/>}<span>{sound?'Без звука':'Со звуком'}</span></button>
 <button data-ui-action="secondary" ref={expandButton} title="Развернуть" className="ny-text-button" onClick={expand}><Maximize size={18}/><span>Развернуть</span></button></div>
 {phase==='error'&&<p className="tv-retry" role="status">Анонс не загрузился. Нажмите «Смотреть анонс», чтобы повторить.</p>}</div>
}
