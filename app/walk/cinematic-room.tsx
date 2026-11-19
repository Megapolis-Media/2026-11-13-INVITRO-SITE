'use client';
import {useState} from 'react';
export default function CinematicRoom({view,setView,puzzle,onPlay,onEvidence,clean}:{view:string;setView:(v:string)=>void;puzzle:any;onPlay:()=>void;onEvidence:(v:string)=>void;clean:boolean}){
 const [failed,setFailed]=useState(false);
 const host=view==='host';
 return <section className="cinema-room" aria-label="Кинематографическая версия студии">
  <div className={'cinema-stage '+(view==='wheel'?'at-wheel':'')}>
   <img className="cinema-bg" src={host?'/walk-assets/ab/cinematic-host.webp':'/walk-assets/ab/cinematic-wide.webp'} alt={host?'Якубович у стойки — фиксированный средний план':'Студия Якубовича — кинематографический общий план'} onLoad={()=>setFailed(false)} onError={()=>setFailed(true)}/>
   {failed&&<p className="cinema-error">Кадр не загрузился. Переключитесь на вариант A или обновите страницу.</p>}
   {!host&&!clean&&<><div className="cinema-board" aria-live="polite"><small>{puzzle?.chapter||'СПАСТИ НОВОГОДНИЙ ЭФИР'}</small><h2>{puzzle?.title||'Студия Якубовича'}</h2><p>{puzzle?.clue}</p><div className="cinema-letters">{[...(puzzle?.word||'ГИРЛЯНДА')].map((l,i)=><span key={i}>{puzzle?.reveal||puzzle?.letters?.includes(l)?l:'·'}</span>)}</div><button onClick={onPlay}>Ответить на вопрос →</button></div>
   <button className="cinema-hotspot hs-wheel" onClick={()=>{setView('wheel');onPlay()}}>Колесо · играть</button><button className="cinema-hotspot hs-host" onClick={()=>setView('host')}>К Якубовичу →</button><button className="cinema-hotspot hs-light" onClick={()=>onEvidence('light')}>Осмотреть пульт</button><button className="cinema-hotspot hs-clock" onClick={()=>onEvidence('clock')}>Осмотреть часы</button><button className="cinema-hotspot hs-script" onClick={()=>onEvidence('script')}>Режиссёрская папка</button></>}
   {host&&!clean&&<div className="cinema-greeting"><small>ЛЕОНИД ЯКУБОВИЧ · ИГРОВОЙ ПЕРСОНАЖ</small><h2>Ну что, начнём?</h2><p>До эфира осталось три задачи. Вернём студии свет, текст и бой новогодних часов.</p><button onClick={onPlay}>Начать игру →</button><button onClick={()=>setView('wide')}>Осмотреть студию</button></div>}
  </div>
  {!clean&&<nav className="cinema-views" aria-label="Ракурсы студии">{[['wide','Общий план'],['wheel','У колеса'],['host','Диалог']].map(([id,label])=><button key={id} aria-pressed={view===id} onClick={()=>setView(id)}>{label}</button>)}</nav>}
 </section>
}
