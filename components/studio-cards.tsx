"use client";

const studios = [
  {id:'yak', label:'01 / ИГРА', title:'Поле чудес', copy:'Крутите колесо, открывайте буквы и зарабатывайте баллы.', action:'Играть', object:'Бирюзовое игровое колесо и объёмные буквы'},
  {id:'pelsh', label:'02 / ИГРА', title:'Угадай мелодию', copy:'Узнайте песню с первых нот. Каждая победа приносит баллы.', action:'Угадать песню', object:'Виниловая пластинка с бирюзовой нотой'},
  {id:'fashion', label:'03 / КОЛЛЕКЦИЯ', title:'Модный приговор', copy:'Загляните на показ новой коллекции «Съёмочная группа».', action:'На модный показ', object:'Объёмное белое худи INVITRO с тёмным капюшоном, бирюзовыми вставками и нашивкой «В эфире»'},
  {id:'radio', label:'04 / РАДИОСТУДИЯ', title:'Стол заказов', copy:'Закажите любимую песню и передайте привет коллегам.', action:'Заказать песню', object:'Белый радиоприёмник с бирюзовым корпусом и шкалой настройки'},
  {id:'postoffice', label:'05 / ОТКРЫТКИ', title:'Утренняя почта', copy:'Выберите открытку и отправьте коллеге тёплые слова.', action:'Создать открытку', object:'Объёмный конверт с новогодней открыткой'},
  {id:'lottery', label:'06 / ГЛАВНАЯ СТУДИЯ', title:'Лотерея', copy:'Загляните в студию, где определятся счастливые номера.', action:'В студию розыгрыша', object:'Прозрачный лототрон с белыми шарами и голубым шаром 23'},
] as const;

export default function StudioCards({onOpen}:{onOpen:(id:string)=>void}) {
  return <div className="studio-collection" id="objects" aria-label="Игры и студии телецентра">
    {studios.map(studio=><button type="button" key={studio.id}
      className={'studio-card'+(studio.id==='lottery'?' studio-card--lottery':'')}
      onClick={()=>onOpen(studio.id)} aria-label={`${studio.title}: ${studio.action}`}>
      <div className="studio-card__visual">
        <img src={`/studio-icons/${studio.id==='fashion'?'fashion-hoodie':studio.id}.webp`}
          srcSet={`/studio-icons/${studio.id==='fashion'?'fashion-hoodie':studio.id}-640.webp 640w, /studio-icons/${studio.id==='fashion'?'fashion-hoodie':studio.id}.webp 1200w`}
          sizes="(max-width: 600px) 88vw, (max-width: 1050px) 43vw, 29vw"
          width={1200} height={800} loading="lazy" decoding="async" alt={studio.object}/>
      </div>
      <div className="studio-card__body">
        <span className="studio-card__label">{studio.label}</span>
        <h3>{studio.title}</h3>
        <p>{studio.copy}</p>
        <span className="studio-card__action">{studio.action}</span>
      </div>
    </button>)}
  </div>;
}
