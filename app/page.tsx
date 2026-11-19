'use client';
import {useEffect,useRef,useState} from 'react';
import {Play,Square,Volume2,VolumeX,ArrowUpRight,Radio,Ticket,Mail,Music2,Box} from 'lucide-react';
import {useEvent} from '@/components/event/use-event';
import Television,{Winners} from '@/components/event/television';
import './event.css';
import PromoTelevision from '@/components/promo-television';
import ScrollWorld from '@/components/scroll-world';
import StudioDirector from '@/components/studio-director';
import {useBallMotion} from '@/components/use-ball-motion';
import {radioTuningCue,installRadioAudioUnlock,prepareRadioAudio} from '@/lib/radio-tuning';
import RegistrationCounter from '@/components/lottery/registration-counter';
import CinemaHero from '@/components/cinema-hero';
import InlineGames from '@/components/inline-games';
import RadioDial from '@/components/radio-dial';
import ParticipantPanel from '@/components/participant-panel';
import GuestGreeting from '@/components/guest-greeting';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {api,Participant} from '@/lib/participant/client';
import {sendBroadcast} from '@/lib/broadcast/catalog';
import {subscribeStats,Stats} from '@/lib/lottery/data';
import './participant.css';
import './broadcast-forms.css';
import './new-year.css';
import './cinema.css';
import './world-doctor.css';
import './motion-repair.css';
import './motion65.css';
import './motion68.css';
import './motion69.css';
import './motion70.css';
import './motion71.css';
import './motion72.css';
import './motion73.css';
import './kv-stage.css';
import './kv-studio.css';
import Ticket3D from '@/components/ticket-3d';
import ContactPanel from '@/components/contact-panel';
import SnowLayer from '@/components/snow-layer';
const RADIO_STREAM='https://m1m128.hostingradio.ru:8074/invitro.m1m128.mp3';
export default function Home(){const {config,mode,scene,preview}=useEvent();const [ballMotion,toggleBallMotion,motionReady]=useBallMotion();const dock=useRef<HTMLElement>(null),mixFrame=useRef(0),startingRadio=useRef(false);const [profile,setProfile]=useState<Participant|null>(null),[panel,setPanel]=useState(''),[playing,setPlaying]=useState(false),[sound,setSound]=useState(false),[radioBlocked,setRadioBlocked]=useState(false),[radioConnecting,setRadioConnecting]=useState(false),[notice,setNotice]=useState(''),[stats,setStats]=useState<Stats|null>(null),[requested,setRequested]=useState(false),[busy,setBusy]=useState(false);const audio=useRef<HTMLAudioElement>(null),video=useRef<HTMLVideoElement>(null),requestId=useRef(''),tuningTimer=useRef<ReturnType<typeof setTimeout>|null>(null),cancelTuning=useRef<(()=>void)|null>(null),audioGeneration=useRef(0);
useEffect(()=>installRadioAudioUnlock(),[]);
useEffect(()=>{
 const background=()=>{if(document.hidden&&audio.current&&!audio.current.paused){cancelAnimationFrame(mixFrame.current);audio.current.volume=1}};
 document.addEventListener('visibilitychange',background);return()=>document.removeEventListener('visibilitychange',background);
},[]);
useEffect(()=>{
 const el=dock.current,site=el?.closest<HTMLElement>('.ny-site');if(!el||!site)return;
 const measure=()=>{const reserve=el.getBoundingClientRect().height+(parseFloat(getComputedStyle(el).bottom)||0)+8;site.style.setProperty('--kv-dock-reserve',Math.ceil(reserve)+'px')};
 measure();const observer=new ResizeObserver(measure);observer.observe(el);window.addEventListener('resize',measure);
 return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
},[]);
useEffect(()=>{void api().then(setProfile).catch(()=>{});return subscribeStats(setStats,()=>{})},[]);

useEffect(()=>{if(mode==='live'||!scene.blocks.radio)stop()},[mode,scene.blocks.radio]);
function endTuning(){if(tuningTimer.current)clearTimeout(tuningTimer.current);tuningTimer.current=null;cancelTuning.current?.();cancelTuning.current=null;window.dispatchEvent(new CustomEvent('telecenter:radio-tuning',{detail:false}))}
useEffect(()=>()=>{if(tuningTimer.current)clearTimeout(tuningTimer.current);cancelTuning.current?.();cancelAnimationFrame(mixFrame.current)},[]);
function stop(){startingRadio.current=false;cancelAnimationFrame(mixFrame.current);setRadioConnecting(false);setRadioBlocked(false);audioGeneration.current++;endTuning();audio.current?.pause();if(audio.current){audio.current.removeAttribute('src');audio.current.load();}setPlaying(false)}
function focusAudio(){stop();if(video.current)video.current.muted=true;setSound(false)}
function tuneReceiver(player:HTMLAudioElement,generation:number,ready:Promise<boolean>){
 const startedAt=performance.now();
 void ready.then(allowed=>{
  if(!allowed||generation!==audioGeneration.current||performance.now()-startedAt>320)return;
  const receiver=document.querySelector<HTMLElement>('#radio .kv-radio');player.volume=.12;
  window.dispatchEvent(new CustomEvent('telecenter:radio-tuning',{detail:true}));
  cancelTuning.current=radioTuningCue(level=>receiver?.style.setProperty('--tuning-signal',level.toFixed(3)));
  tuningTimer.current=setTimeout(()=>{
    endTuning();receiver?.style.removeProperty('--tuning-signal');
    if(document.hidden){player.volume=1;return}
    const at=performance.now();const rise=(now:number)=>{if(generation!==audioGeneration.current)return;const p=Math.max(0,Math.min(1,(now-at)/110));player.volume=.12+.88*p;if(p<1)mixFrame.current=requestAnimationFrame(rise);};mixFrame.current=requestAnimationFrame(rise);
  },280);
 });
}
function startRadio(){
 if(mode==='live'||!scene.blocks.radio||startingRadio.current)return;
 const player=audio.current;if(!player)return;
 const generation=++audioGeneration.current;startingRadio.current=true;endTuning();cancelAnimationFrame(mixFrame.current);setRadioConnecting(true);setRadioBlocked(false);setNotice('');
 const ready=prepareRadioAudio(); // resume Web Audio inside the gesture, alongside HTML playback
 document.querySelectorAll('audio').forEach(a=>{if(a!==player)a.pause()});if(video.current)video.current.muted=true;setSound(false);
 const stream=config.radioUrl||RADIO_STREAM;
 if(player.getAttribute('src')!==stream||player.error){player.src=stream;player.load()}
 player.muted=false;player.volume=1;
 const attempt=player.play(); // Keep the media call inside the listener's gesture.
 tuneReceiver(player,generation,ready);
 void attempt.then(()=>{if(generation!==audioGeneration.current)return;startingRadio.current=false;setPlaying(true);setRadioConnecting(false);setRadioBlocked(false)})
 .catch((err:unknown)=>{if(generation!==audioGeneration.current)return;audioGeneration.current++;startingRadio.current=false;endTuning();cancelAnimationFrame(mixFrame.current);player.volume=1;setPlaying(false);setRadioConnecting(false);
  const denied=(err as {name?:string}|null)?.name==='NotAllowedError';setRadioBlocked(denied);
  if(!denied)setNotice('Не удалось подключиться к ИНВИТРО FM. Попробуйте включить радио ещё раз.');
 });
}
function toggleRadio(){if(playing||radioConnecting||startingRadio.current){stop();return}startRadio()}

function filmSound(){const on=!sound;if(on)stop();if(video.current)video.current.muted=!on;setSound(on)}
function toOrders(){document.getElementById('orders')?.scrollIntoView({behavior:'smooth'})}
return <div className={'ny-site '+(!scene.blocks.hero?'without-hero':'')} data-ball-motion={ballMotion?'on':'off'}><audio ref={audio} preload="none" onPause={()=>setPlaying(false)} onError={e=>{if(!e.currentTarget.getAttribute('src')||!e.currentTarget.error)return;startingRadio.current=false;setRadioConnecting(false);setPlaying(false);setNotice('Не удалось подключиться к ИНВИТРО FM. Попробуйте включить радио ещё раз.')}}/><StudioDirector motion={ballMotion} radio={mode!=='live'&&scene.blocks.radio} tv={mode==='before'&&scene.blocks.promo}/><ScrollWorld active={motionReady} effects={ballMotion} radioPlaying={playing} filmJourney={mode==='before'}/>{preview&&<div className="event-preview-note">Предпросмотр · изменения не опубликованы</div>}
<header className="ny-header"><a href="#home" className="ny-brand" aria-label="Новогодний телецентр INVITRO"><img src="/favicon.svg" width="48" height="44" alt=""/><b>INVITRO</b></a><nav>{scene.blocks.promo&&<a href="#promo">{mode==='live'?'Прямой эфир':mode==='after'?'Повтор':'Анонс'}</a>}{scene.blocks.radio&&mode!=='live'&&<a href="#radio">Радио</a>}{scene.blocks.orders&&<a href="#orders">Стол заказов</a>}{scene.blocks.games&&<a href="#games">Зимние игры</a>}</nav>{profile&&<button data-ui-action="secondary" className="ny-header-ticket" onClick={()=>setPanel('account')}>Мой билет</button>}</header>
<SnowLayer/><main>{scene.blocks.hero&&<CinemaHero allowFullMotion={ballMotion} title={scene.title} intro={scene.intro} mode={mode} onTicket={()=>mode==='before'?setPanel('account'):document.getElementById('promo')?.scrollIntoView({behavior:'smooth'})}/>}
{scene.blocks.radio&&mode!=='live'&&<div className="receiver-rail"><section className="ny-section ny-radio" id="radio" aria-labelledby="radio-section-title">
 <div className="ny-section-heading"><h2 id="radio-section-title">{/^ИНВИТРО\s*FM$/i.test(scene.radioTitle.trim())?'Новогоднее радио':scene.radioTitle}</h2><p>{scene.radioText}</p></div>
 <div className="ny-radio-object"><RadioDial playing={playing}/>
  <div className="receiver-controls" role="group" aria-label="Управление ИНВИТРО FM">
   <button data-ui-action="solid" type="button" className="receiver-play" title={playing?'Остановить радио':'Включить радио'} onClick={toggleRadio} aria-pressed={playing}>{playing?<Square/>:<Play/>}<span>{radioConnecting?'Настройка':playing?'Стоп':radioBlocked?'Включить звук':'Слушать'}</span></button>
   <button data-ui-action="secondary" type="button" aria-label="Передать привет" title="Передать привет" onClick={()=>setPanel('greeting')}><Mail/><span className="ui-full-label">Передать привет</span><span className="ui-short-label" aria-hidden="true">Привет</span></button>
   {scene.blocks.orders&&<button data-ui-action="secondary" type="button" aria-label="Заказать песню" title="Заказать песню" onClick={toOrders}><Music2/><span className="ui-full-label">Заказать песню</span><span className="ui-short-label" aria-hidden="true">Песня</span></button>}
  </div>
  <div className="receiver-status" role="status">{radioBlocked?'Нажмите «Включить звук», чтобы услышать эфир.':radioConnecting?'Подключаем эфир…':playing?'В эфире':''}</div>
 </div>
</section></div>}
{scene.blocks.promo&&<section className="ny-section ny-promo" id="promo"><div className="ny-promo-head"><div><span className="ny-kicker">{mode==='before'?'':mode==='live'?'МЫ В ЭФИРЕ':'ПОВТОР ШОУ'}</span><h2 style={{whiteSpace:'pre-line'}}>{scene.mediaTitle}</h2></div><div><p>{scene.mediaText}</p></div></div>{mode==='before'?<PromoTelevision src={config.opener} videoRef={video} sound={sound} onSound={filmSound}/>:<Television config={config} mode={mode} onAudio={focusAudio} onGreeting={()=>setPanel('greeting')}/>}</section>}
{scene.blocks.winners&&<Winners config={config}/>}
{scene.blocks.orders&&<section className="ny-section ny-orders" id="orders" aria-labelledby="orders-title"><header className="orders-heading"><h2 id="orders-title" style={{whiteSpace:'pre-line'}}>{scene.ordersTitle}</h2><p>{scene.ordersText}</p></header><div className="orders-art"><div className="ny-record kv-order-deck" aria-hidden="true"><img src="/games-v2/pelsh.webp" alt=""/><div className="order-grooves"/></div>{scene.blocks.radio&&mode!=='live'&&<button data-ui-action="secondary" className="ny-text-button" onClick={()=>{document.getElementById('radio')?.scrollIntoView({behavior:'smooth'})}}>К радио</button>}</div><div className="ny-request">{requested?<div role="status"><span className="ny-kicker">ЗАЯВКА ПРИНЯТА</span><h3>Песня — у редактора.</h3><p>Команда радио выберет заявки для эфира.</p><button data-ui-action="solid" className="ny-button" onClick={()=>{setRequested(false);requestId.current=''}}>Заказать ещё</button></div>:<form onSubmit={async e=>{e.preventDefault();setBusy(true);setNotice('');const form=new FormData(e.currentTarget);form.set('id',requestId.current ||=crypto.randomUUID());form.set('kind','greeting');form.set('recipient','Редактор радио');form.set('body',String(form.get('body')||'Заказ песни'));try{await sendBroadcast(form);setRequested(true)}catch(e){setNotice((e as Error).message)}finally{setBusy(false)}}}><label>Исполнитель и песня<input name="track" placeholder="Что поставить для Вас?" required maxLength={200}/></label><label>Ваше имя<input name="name" defaultValue={profile?.name||''} placeholder="Имя и фамилия" required minLength={2} maxLength={120}/></label><label>Кому посвящаете?<input name="body" placeholder="Коллеге, команде или всем сразу" maxLength={600}/></label><label className="ny-consent"><input type="checkbox" name="consent" value="true" required/>Разрешаю использовать заявку в корпоративном эфире.</label><button data-ui-action="accent" className="ny-button orange" disabled={busy}>{busy?'Отправляем…':'Заказать песню'} <Music2 size={18}/></button></form>}</div></section>}
{scene.blocks.games&&<InlineGames title={scene.gamesTitle} profile={profile} onProfile={setProfile} onAudio={focusAudio}/>}
{scene.blocks.tickets&&<section className="ny-section ny-ticket-section" id="tickets" aria-labelledby="ticket-title">
  <div className="ny-counter ticket-count">
    <RegistrationCounter count={stats?.registeredTickets??null} ticketDisplay/>
    <div className="ticket-count-status">{stats
      ? <><span>{stats.registeredParticipants?.toLocaleString('ru-RU')??'—'} сотрудников · {stats.registeredTickets.toLocaleString('ru-RU')} билетов</span><span>{stats.registrationOpen?'Регистрация открыта':'Регистрация пока закрыта'}</span></>
      : <span>Подключаем счётчик…</span>}
    </div>
  </div>
  <div className="ticket-info">
    <h2 id="ticket-title">ВАШ БИЛЕТ</h2>
    {scene.ticketText&&<p style={{whiteSpace:'pre-line'}}>{scene.ticketText}</p>}
    <div className="ticket-actions">
      <button data-ui-action="accent" className="ny-button" onClick={()=>setPanel('account')}>{profile?'Открыть мой билет':'Получить билет'} <Ticket size={18}/></button>
      <details><summary data-ui-action="disclosure">Как выберут победителя?</summary><p>У каждого билета одинаковый шанс на выигрыш. В отдельной рубрике прямого эфира ведущий и один из топ-менеджеров ИНВИТРО вместе определят выигрышный номер.</p></details>
    </div>
  </div>
  <figure className="ticket-print">
    {!profile?.number&&<figcaption>Пример билета</figcaption>}
    <Ticket3D number={profile?.number||'07428'} name={profile?.number ? profile.name : ''}/>
  </figure>
</section>}
<footer id="contacts" className="ny-footer"><b>INVITRO</b><span>НОВОГОДНИЙ ТЕЛЕЦЕНТР<br/>23 декабря · 12:00 МСК</span><div className="footer-contacts"><button data-ui-action="secondary" onClick={()=>setPanel('support')}>Техническая поддержка</button><button data-ui-action="secondary" onClick={()=>setPanel('organizers')}>Команда организаторов</button><a data-ui-action="secondary" href="#home">Наверх</a></div></footer></main>
<aside ref={dock} className="ny-dock" aria-label="Управление эфиром">{mode!=='live'&&scene.blocks.radio&&<button data-ui-action="solid" onClick={()=>void toggleRadio()} aria-label={playing?'Остановить радио':radioBlocked?'Включить звук радио':'Включить радио'}>{playing?<Square size={19}/>:<Play size={19}/>}<span className="ui-full-label">{radioConnecting?'Настройка':playing?'Стоп':radioBlocked?'Включить звук':'Радио'}</span><span className="ui-short-label" aria-hidden="true">{playing?'Стоп':radioBlocked?'Звук':'Радио'}</span></button>}{mode==='live'&&<button data-ui-action="secondary" onClick={()=>document.getElementById('promo')?.scrollIntoView({behavior:'smooth'})}><Play size={19}/><span>Смотреть эфир</span></button>}{(playing||radioConnecting)&&scene.blocks.radio&&mode!=='live'&&<div className="ny-dock-track"><img src="/favicon.svg" alt=""/><span>ИНВИТРО FM<small>{radioConnecting?'Подключение…':'В эфире'}</small></span></div>}<button data-ui-action="secondary" aria-label="Передать привет" onClick={()=>setPanel('greeting')}><Mail size={19}/><span className="ui-full-label">Передать привет</span><span className="ui-short-label" aria-hidden="true">Привет</span></button>{scene.blocks.orders&&<button data-ui-action="secondary" aria-label="Заказать песню" onClick={toOrders}><Music2 size={19}/><span className="ui-full-label">Заказать песню</span><span className="ui-short-label" aria-hidden="true">Песня</span></button>}<button data-ui-action="secondary" aria-label="Мой билет" onClick={()=>setPanel('account')}><Ticket size={19}/><span className="ui-full-label">Мой билет</span><span className="ui-short-label" aria-hidden="true">Билет</span></button><button data-ui-action="secondary" type="button" className="ball-switch" disabled={!motionReady} onClick={toggleBallMotion} aria-label="Объёмные эффекты шара" aria-pressed={ballMotion} aria-controls="ball-journey" title={ballMotion?'Уменьшить эффекты движения':'Включить объёмные эффекты'}><span className="switch-glyph" aria-hidden="true"><Box size={20}/></span><span>3D</span></button></aside>
{notice&&<div className="ny-notice" role="status">{notice}<button data-ui-action="icon" aria-label="Закрыть уведомление" onClick={()=>setNotice('')}>×</button></div>}
<Dialog open={!!panel} onOpenChange={o=>{if(!o)setPanel('')}}><DialogContent className="ny-modal"><DialogTitle>{panel==='support'?'Техническая поддержка':panel==='organizers'?'Команда организаторов':panel==='greeting'?'Привет в эфир':'Ваш билет'}</DialogTitle><DialogDescription>{['support','organizers'].includes(panel)?'Оставьте вопрос и почту для ответа.':panel==='greeting'?'Поздравьте коллег — редактор передаст Ваши слова в эфир.':'Пройдите регистрацию по корпоративной почте. Билет сохранится в вашем личном кабинете.'}</DialogDescription>{['support','organizers'].includes(panel)?<ContactPanel kind={panel}/>:panel==='greeting'?<GuestGreeting profile={profile} allowPostcard={false}/>:<ParticipantPanel profile={profile} onChange={setProfile} onWalk={()=>{setPanel('');document.getElementById('games')?.scrollIntoView({behavior:'smooth'})}}/>}</DialogContent></Dialog>
</div>}
