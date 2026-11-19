export type Phase='before'|'live'|'after';
export const phases:Phase[]=['before','live','after'];
export const phaseNames={before:'До эфира',live:'В эфире',after:'После эфира'};
export type Block='hero'|'radio'|'promo'|'games'|'orders'|'tickets'|'winners';
export const blockNames:Record<Block,string>={hero:'Первый экран',radio:'Новогоднее радио',promo:'Телевизор и видео',games:'Игры',orders:'Стол заказов',tickets:'Билеты и участники',winners:'Победители'};
export type Scene={blocks:Record<Block,boolean>;title:string;intro:string;mediaTitle:string;mediaText:string;radioTitle:string;radioText:string;gamesTitle:string;ordersTitle:string;ordersText:string;ticketTitle:string;ticketText:string};
export type Winner={ticket:number;name:string;agglomeration:string;prize:string;avatar:string;place:number};
export type EventConfig={mode:Phase;scheduleEnabled:boolean;liveAt:string;afterAt:string;opener:string;liveUrl:string;replayUrl:string;radioUrl:string;scenes:Record<Phase,Scene>;winners:Winner[]};
const scene=(mode:Phase):Scene=>({blocks:{hero:true,radio:mode!=='live',promo:true,games:mode!=='live',orders:mode!=='live',tickets:true,winners:mode==='after'},title:'НОВОГОДНИЙ\nТЕЛЕЦЕНТР',intro:mode==='before'?'Вся команда на одной волне':mode==='live'?'Вы в эфире.\nМы вместе.':'Праздник продолжается.',mediaTitle:mode==='before'?'ВСТРЕТИМСЯ\n23 ДЕКАБРЯ':mode==='live'?'ПРЯМОЙ\nЭФИР':'ЭТО БЫЛО\nВМЕСТЕ',mediaText:mode==='before'?'Две студии. Один праздник.':mode==='live'?'Смотрите шоу и передавайте приветы.':'Смотрите повтор. Вспоминайте лучшие моменты.',radioTitle:'ИНВИТРО FM',radioText:'Слушайте. Поздравляйте. Заказывайте.',gamesTitle:'ЗИМНИЕ ИГРЫ',ordersTitle:'СТОЛ ЗАКАЗОВ',ordersText:'Закажите песню для коллег в эфире ИНВИТРО FM.',ticketTitle:'БИЛЕТ — ВАШ.\nДАЛЬШЕ — ШОУ.',ticketText:''});
export const defaultConfig:EventConfig={mode:'before',scheduleEnabled:false,liveAt:'2026-12-23T12:00:00+03:00',afterAt:'2026-12-23T15:00:00+03:00',opener:'https://d2ol7oe51mr4n9.cloudfront.net/user_3JjVf2L0YgtzquO5jhpkfXv0KBF/c5405509-6f3b-4177-aea1-3c4a814156c2.mp4',liveUrl:'',replayUrl:'',radioUrl:'https://m1m128.hostingradio.ru:8074/invitro.m1m128.mp3',scenes:{before:scene('before'),live:scene('live'),after:scene('after')},winners:[]};
// Saved drafts can still contain the original default copy.
export function updateSceneCopy(config: EventConfig): EventConfig {
  for (const phase of phases) {
    const current = config.scenes[phase];
    const defaults = defaultConfig.scenes[phase];
    if (phase === 'before' && current.intro === 'Вся команда.\nНа одной волне.') current.intro = defaults.intro;
    if (current.gamesTitle === 'ВАШ ВЫХОД.\nВАША ИГРА.') current.gamesTitle = defaults.gamesTitle;
    if (current.ordersTitle === 'ВАША ПЕСНЯ.\nНАШ ЭФИР.') current.ordersTitle = defaults.ordersTitle;
    if (current.ordersText === 'Сыграли? Выберите, что прозвучит дальше.') current.ordersText = defaults.ordersText;
    if (current.ticketText === 'После регистрации билет уже участвует.\nНичего печатать и отмечать не нужно.') current.ticketText = defaults.ticketText;
  }
  return config;
}
export function activePhase(c:EventConfig,now=Date.now()):Phase{if(!c.scheduleEnabled)return c.mode;if(now>=Date.parse(c.afterAt))return 'after';if(now>=Date.parse(c.liveAt))return 'live';return 'before'}
export function mediaURL(v:string){if(!v)return true;if(v.startsWith('/api/event/media/'))return true;try{return new URL(v).protocol==='https:'}catch{return false}}
