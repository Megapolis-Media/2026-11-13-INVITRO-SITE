'use client';
import {useEffect,useRef} from 'react';
import {ballContact,measureStop} from './studio-crossing';
import {downChute,legClock,line,mix,reboundClock,unit,type Point} from './hero-launch';
import {antennaEntry} from './cabinet-flight';
import {rockCabinet} from './cabinet-volume';
import './journey.css';

type Props={active:boolean;effects:boolean;filmJourney?:boolean;radioPlaying?:boolean};
type Phase='ready'|'opening'|'transfer'|'finished';

export default function ScrollWorld({active,effects,filmJourney=true,radioPlaying=false}:Props){
 const host=useRef<HTMLDivElement>(null),motion=useRef(effects),playing=useRef(radioPlaying);
 useEffect(()=>{motion.current=effects},[effects]);
 useEffect(()=>{
  playing.current=radioPlaying;
  const radio=document.getElementById('radio');
  if(radio){radio.dataset.flightLit=String(radioPlaying);radio.style.setProperty('--journey-power',radioPlaying?'1':'0')}
 },[radioPlaying]);
 useEffect(()=>{
  if(!active||!host.current)return;
  const root=host.current,stage=document.querySelector<HTMLElement>('.solo-hero');
  const aperture=stage?.querySelector<HTMLElement>('.hero-outlet'),lip=stage?.querySelector<HTMLElement>('.hero-lip');
  const gauge=stage?.querySelector<HTMLElement>('[data-orb-gauge]'),radio=document.querySelector<HTMLElement>('#radio');
  const receiverBody=radio?.querySelector<HTMLElement>('.rigonda-object'),cabinet=document.querySelector<HTMLElement>('.promo-tv-object');
  const orb=root.querySelector<HTMLElement>('.flight-orb')!,surface=root.querySelector<HTMLElement>('.film-ball-surface')!;
  const speech=root.querySelector<HTMLElement>('.flight-speech')!,streak=root.querySelector<HTMLElement>('.flight-streak')!;
  const intent=document.documentElement.dataset;
  const strip=new Image();strip.onload=()=>{orb.dataset.filmReady='true'};strip.src='/hero-v84/orb23-turn.webp';
  let phase:Phase='ready',raf=0,dirty=true,w=1,h=1,dock=0,r=20,small=8;
  let outlet:Point={x:0,y:0},chute=outlet,receiver:Point|null=null,entry:Point|null=null,bagY=0;
  let initial=scrollY,previous=scrollY,farthest=scrollY,started=0,landed=0,landScroll=0;
  let opening=0,travel=0,tuning=false,receiverAnimation:Animation|null=null,lampTimer:ReturnType<typeof setTimeout>|undefined;
  function layout(){
   w=document.documentElement.clientWidth;h=innerHeight;
   const dockTop=document.querySelector('.ny-dock')?.getBoundingClientRect().top;
   dock=dockTop===undefined?72:Math.max(0,h-dockTop);
   r=Math.min(29,Math.max(11,w*.035),h*.033);small=Math.min(r,(gauge?.getBoundingClientRect().width||r*.7)/2);
   const point=(el:HTMLElement)=>{const q=el.getBoundingClientRect();return {x:q.left,y:q.top+scrollY-small}};
   if(aperture&&lip){outlet=point(aperture);chute=point(lip)}
   receiver=measureStop('radio',r);entry=filmJourney?measureStop('tv',r):null;
   const tube=cabinet?.querySelector('video')?.getBoundingClientRect();
   bagY=tube?tube.top+scrollY+tube.height*.89:entry?.y??0;
   dirty=false;
  }
  function hide(){
   root.style.visibility='hidden';root.dataset.radius='0';orb.hidden=speech.hidden=streak.hidden=true;
  }
  function finish(){
   phase='finished';root.dataset.phase='inside-tv';root.dataset.ownsContacts='false';hide();
   radio?.style.removeProperty('--ball-near');cabinet?.style.removeProperty('--ingress');cancelAnimationFrame(raf);raf=0;
  }
  function light(lit:boolean){
   if(!radio)return;radio.dataset.flightLit=String(lit);radio.style.setProperty('--journey-power',lit?'1':'0');
  }
  function receiverImpulse(){
   light(true);clearTimeout(lampTimer);lampTimer=setTimeout(()=>light(playing.current),1250);
   receiverAnimation?.cancel();
   if(receiverBody&&motion.current)receiverAnimation=rockCabinet(receiverBody,'radio');
  }
  function rearm(raw:number){
   phase='ready';initial=farthest=raw;opening=travel=0;tuning=false;dirty=true;
   hide();root.dataset.phase='drum-ready';root.dataset.ownsContacts='true';delete intent.heroSwipe;
   if(stage){delete stage.dataset.actor;delete stage.dataset.impulse}
   radio?.style.removeProperty('--ball-near');cabinet?.style.removeProperty('--ingress');clearTimeout(lampTimer);receiverAnimation?.cancel();light(playing.current);
   window.dispatchEvent(new Event('telecenter:journey-reset'));
  }
  function onScroll(){
   const raw=Math.max(0,scrollY),zone=Math.min(h*.32,(stage?.offsetHeight??0)*.32);
   if(stage&&phase!=='ready'&&raw<previous&&raw<=zone&&(farthest>zone+24||(raw<=2&&farthest>12)))rearm(raw);
   farthest=Math.max(raw,farthest);previous=raw;
   // Use the actual scroll sample in this paint, including momentum events
   // that arrive between two animation callbacks in an embedded browser.
   if(phase!=='finished'){cancelAnimationFrame(raf);raf=0;render(performance.now())}
  }
  function render(now:number){
   raf=0;if(document.hidden||phase==='finished')return;
   if(dirty)layout();
   const raw=Math.max(0,scrollY),safeBottom=h-dock-16;
   const goal=receiver??entry;
   if(!goal){root.dataset.ownsContacts='false';return}
   if(cabinet&&filmJourney&&cabinet.getBoundingClientRect().bottom<0){finish();return}
   if(phase==='ready'){
    const hero=stage?.getBoundingClientRect(),queued=intent.heroSwipe==='queued';
    root.dataset.ownsContacts=String(!!hero&&(hero.bottom>h*.15||queued));
    if(!stage||(!queued&&(intent.heroAwaitInput||raw<=initial+2||!hero||hero.bottom<h*.15)))return;
    phase='opening';started=queued&&Number(intent.heroSwipeAt)>0?Math.min(now,Number(intent.heroSwipeAt)):now;
    if(queued&&Number.isFinite(Number(intent.heroSwipeY)))initial=Number(intent.heroSwipeY);
    opening=0;intent.heroSwipe='playing';root.dataset.ownsContacts='true';
    if(motion.current)stage.dataset.impulse='true';
   }
   let tag='',position:Point=chute,radius=r,clip=0,drawAgain=false,spin=6;
   if(phase==='opening'){
    const age=Math.max(0,now-started);
    const chuteMs=motion.current?150:65;
    if(age<chuteMs){
     position=downChute(outlet,chute,age/chuteMs);radius=small;tag='chute';drawAgain=true;
    }else{
     const elapsed=age-chuteMs;
     // Frame both contact points before the bounce so its entire second stroke
     // and the first frame of the film can be seen without another swipe.
     const roomForFilm=entry?Math.max(h*.14,safeBottom-(bagY-goal.y)-r):safeBottom;
     const firstLimit=Math.min(h*.64,safeBottom-2*r,roomForFilm);
     const duration=motion.current?650:440;
     opening=Math.max(opening,legClock(elapsed,duration,raw,initial,chute.y,goal.y,firstLimit,h));
     radius=mix(small,r,unit(opening*2));position=line(chute,goal,opening);
     tag='receiver-flight';spin=6-3*opening;
     radio?.style.setProperty('--ball-near',String(unit((opening-.81)/.19)));
     drawAgain=elapsed<duration;
     if(opening>=1){
      if(receiver)ballContact('radio');
      if(!entry){finish();return}
      if(!receiver){ballContact('tv');finish();return}
      tag='receiver-contact';phase='transfer';landed=now;landScroll=raw;drawAgain=true;
     }
    }
   }else if(phase==='transfer'&&entry&&receiver){
    const length=Math.hypot(entry.x-receiver.x,entry.y-receiver.y);
    travel=Math.max(travel,reboundClock(now-landed,raw-landScroll,length,motion.current));
    const pose=antennaEntry(receiver,entry,r,travel);
    position=pose;clip=pose.hidden;tag=clip>0?'tv-entry':'tv-flight';spin=3+4*travel;
    radio?.style.setProperty('--ball-near',String(1-unit(travel/.13)));
    if(travel>=.83&&!tuning){tuning=true;window.dispatchEvent(new Event('telecenter:tv-approach'))}
    cabinet?.style.setProperty('--ingress',String(Math.sin(Math.PI*clip)));
    if(clip>=1||travel>=1){ballContact('tv');finish();return}
    drawAgain=true;
   }
   const pos={x:position.x,y:position.y-raw};
   const unobscured=!document.querySelector('dialog:modal,[role="dialog"][data-state="open"]')&&!document.activeElement?.matches('input,textarea,select,[contenteditable=true]');
   root.style.visibility=unobscured?'visible':'hidden';orb.hidden=false;if(stage)stage.dataset.actor='visible';
   root.dataset.phase=tag;root.dataset.radius=radius.toFixed(2);root.dataset.ballX=pos.x.toFixed(2);root.dataset.worldY=(pos.y+raw).toFixed(2);
   const scale=radius/192;
   orb.style.transform='translate3d('+(pos.x-radius)+'px,'+(pos.y-radius)+'px,0) scale('+scale+')';
   orb.style.clipPath=clip?'inset(0 0 '+(clip*100)+'% 0)':'none';
   surface.style.backgroundPositionX=(Math.round(spin)/12*100)+'%';
   const origin=tag==='receiver-flight'?chute:tag==='tv-flight'?receiver:null;
   streak.hidden=!origin||!motion.current;
   if(origin&&!streak.hidden){
    const dx=position.x-origin.x,dy=position.y-origin.y,length=Math.hypot(dx,dy);
    const tail=Math.min(radius*2.7,Math.max(0,length-radius));
    const angle=Math.atan2(dy,dx),back=radius+tail;
    streak.style.width=tail+'px';
    streak.style.transform='translate3d('+(pos.x-Math.cos(angle)*back)+'px,'+(pos.y-Math.sin(angle)*back)+'px,0) rotate('+angle+'rad)';
   }
   speech.hidden=phase!=='opening'||!motion.current||opening>.45;
   if(!speech.hidden){
    const x=Math.max(8,Math.min(w-speech.offsetWidth-8,pos.x-speech.offsetWidth-radius-7));
    speech.style.transform='translate3d('+x+'px,'+(pos.y-speech.offsetHeight-radius-4)+'px,0)';
   }
   if(drawAgain)schedule();
  }
  function schedule(){if(!raf&&phase!=='finished')raf=requestAnimationFrame(render)}
  function resize(){dirty=true;schedule()}
  function launchFromGesture(){if(phase!=='ready')return;cancelAnimationFrame(raf);raf=0;render(performance.now())}
  const observer=new ResizeObserver(resize);observer.observe(document.body);if(cabinet)observer.observe(cabinet);if(receiverBody)observer.observe(receiverBody);
  addEventListener('telecenter:receiver-impact',receiverImpulse);addEventListener('telecenter:tv-impact',finish);addEventListener('telecenter:tv-manual',finish);
  addEventListener('telecenter:first-swipe',launchFromGesture);addEventListener('pageshow',resize);
  addEventListener('telecenter:geometry',resize);addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',resize);
  document.addEventListener('visibilitychange',resize);root.dataset.phase='drum-ready';schedule();
  return()=>{strip.onload=null;clearTimeout(lampTimer);receiverAnimation?.cancel();cancelAnimationFrame(raf);observer.disconnect();delete root.dataset.ownsContacts;
   removeEventListener('telecenter:receiver-impact',receiverImpulse);removeEventListener('telecenter:tv-impact',finish);removeEventListener('telecenter:tv-manual',finish);
   removeEventListener('telecenter:first-swipe',launchFromGesture);removeEventListener('pageshow',resize);removeEventListener('telecenter:geometry',resize);
   removeEventListener('scroll',onScroll);removeEventListener('resize',resize);document.removeEventListener('visibilitychange',resize);
   hide();if(stage){delete stage.dataset.actor;delete stage.dataset.impulse}if(intent.heroSwipe==='playing')delete intent.heroSwipe;
   cabinet?.style.removeProperty('--ingress');radio?.style.removeProperty('--ball-near');radio?.style.removeProperty('--journey-power');radio?.removeAttribute('data-flight-lit');
  };
 },[active,filmJourney]);
 return <div ref={host} id="ball-journey" hidden={!active} className="flight-world" aria-hidden="true">
  <i className="flight-streak" hidden/><div className="flight-orb" hidden><div className="film-ball-surface"/></div>
  <span className="flight-speech" hidden>{'Кручу-верчу,\nпоздравить хочу'}</span>
 </div>;
}
