export const postcards=[
 {id:'snow-mail',title:'Снежная почта',subtitle:'Снегири, хвоя и добрые вести',image:'/postcards/snow-mail.webp'},
 {id:'warm-radio',title:'Тёплый эфир',subtitle:'Любимая волна и уют у окна',image:'/postcards/warm-radio.webp'},
 {id:'space-new-year',title:'Навстречу чудесам',subtitle:'Новый год космического масштаба',image:'/postcards/space-new-year.webp'},
];
export const tracks=[
 {id:'snow',title:'Снег кружится',artist:'ВИА Пламя',src:'/media/plamya-sneg.mp3',cover:'/media/plamya-cover.jpg'},
 {id:'bells',title:'Jingle Bells',artist:'Инструментальная миниатюра Телецентра',src:'/media/jingle-bells.mp3',cover:'/postcards/warm-radio.webp'},
 {id:'halls',title:'Deck the Halls',artist:'Инструментальная миниатюра Телецентра',src:'/media/deck-the-halls.mp3',cover:'/postcards/snow-mail.webp'},
];
export async function sendBroadcast(form:FormData){const r=await fetch('/api/messages',{method:'POST',body:form});const value:any=await r.json();if(!r.ok)throw new Error(value.error||'Не удалось отправить. Ваш текст остался в форме.');return value as {saved:boolean,delivery:'sent'|'queued'|'editor',id:string};}
