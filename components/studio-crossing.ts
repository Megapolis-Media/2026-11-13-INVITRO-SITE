export type StudioStop='radio'|'tv';
export type StudioPoint={x:number;y:number};
/** Compare the whole interval of a wheel/trackpad gesture, not one rendered position.
 * Ignore stations jumped over by Home/End or a distant deep link. */
export function crossesStop(from:number,to:number,hit:number,view:number,initial=false){
 if(!(view>0)||!Number.isFinite(hit)||to<from-.5)return false;
 const screen=hit+view*.52-to;
 if(initial)return screen>=-view*.06&&screen<=view*.54&&to>=hit-2;
 return to>from && from<=hit+1 && hit<=to+1 && (to-from<=view*2.05||screen>=-view*.08&&screen<=view*.96);
}
export function measureStop(name:StudioStop,r:number):StudioPoint|null{
 if(name==='radio'){
  const q=document.querySelector('#radio .receiver-contact-point')?.getBoundingClientRect();
  return q?.width?{x:q.left+q.width/2+r*.96,y:q.top+window.scrollY}:null;
 }
 const q=document.querySelector('.promo-tv-contact')?.getBoundingClientRect();
 return q?.width?{x:q.left+q.width/2,y:q.top+window.scrollY+q.height/2}:null;
}
export function ballContact(name:StudioStop){
 window.dispatchEvent(new CustomEvent('telecenter:ball-contact',{detail:name}));
}
