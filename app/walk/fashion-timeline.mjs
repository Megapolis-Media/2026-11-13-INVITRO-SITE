export const SHOW_DURATION=174.18449;
export const LOOKS=[
 {title:'Носи свою роль',detail:'Куртка «Съёмочная группа» · телекеды',image:'crew',start:-16},
 {title:'Своя частота',detail:'Поло · шарф с волной · шапка',image:'crew',start:14},
 {title:'Твой выход',detail:'Телеобувь · шопер · брелок-телевизор',image:'footwear',start:44},
 {title:'Прибавь себя',detail:'Пин-фейдер · радио-брелок · детали с характером',image:'accessories',start:74},
 {title:'Домашний эфир',detail:'Плед · светильник «Пауза»',image:'home',start:104},
];
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
export function lookAtTime(time){if(time>=144)return {title:'Новый сезон 2026',detail:'Вся коллекция · ваш выход',image:'crew',index:5};let index=0;LOOKS.forEach((l,i)=>{if(time>=l.start+12)index=i});return {...LOOKS[index],index};}
// Separate incoming/outgoing lanes. Every turn happens at a stopped pose, away from walls.
export function runwayPose(index,time){
 const t=Math.max(0,Math.min(SHOW_DURATION,time)),local=t-LOOKS[index].start;
 if(t>=146){const p=clamp((t-146-index*.65)/18),x=(index-2)*1.04;return {visible:t>=146+index*.65,x,z:-31+24.2*smooth(p),yaw:0,walk:p<1?Math.sin(Math.PI*p)*.85:0,phase:(t-146)*7.3+index,pose:p===1?1:0};}
 if(local<0||local>42)return {visible:false,x:-.65,z:-31,yaw:0,walk:0,phase:0,pose:0};
 if(local<16){const p=local/16;return {visible:true,x:-.65,z:-31+24.2*smooth(p),yaw:0,walk:Math.min(1,p*8,(1-p)*8),phase:local*7.3,pose:0};}
 if(local<24){const p=(local-16)/8;const turn=p<.35?smooth(p/.35):p<.65?1:1-smooth((p-.65)/.35);return {visible:true,x:-.65,z:-6.8,yaw:Math.PI*turn,walk:0,phase:0,pose:Math.sin(p*Math.PI)};}
 if(local<26){const p=smooth((local-24)/2);return {visible:true,x:-.65+1.85*p,z:-6.8,yaw:Math.PI*p,walk:Math.sin(p*Math.PI)*.2,phase:local*7.3,pose:0};}
 const p=(local-26)/16;return {visible:true,x:1.2,z:-6.8-24.2*smooth(p),yaw:Math.PI,walk:Math.min(1,p*8,(1-p)*8),phase:local*7.3,pose:0};
}
