// Install before hydration so an iOS swipe inside an embedded web view survives delayed scroll delivery.
export const heroInputScript = `(() => {
 if (window.__invHeroInput) return;
 window.__invHeroInput = true;
 const state = document.documentElement.dataset;
 const navigation=performance.getEntriesByType('navigation')[0];
 if(navigation && ['reload','back_forward'].includes(navigation.type)) state.heroAwaitInput='true';
 const opts = {passive:true,capture:true};
 let startY=null, startX=0, fromHero=false, previous=window.scrollY;
 const inHero = () => {
   if(location.pathname!=='/'||document.querySelector('[role="dialog"][data-state="open"]'))return false;
   const hero=document.querySelector('.solo-hero');
   return hero ? hero.getBoundingClientRect().bottom > innerHeight*.18 : !location.hash && scrollY<innerHeight*.8;
 };
 function request(){
   if (state.heroSwipe==='playing'||state.heroSwipe==='queued') return;
   delete state.heroAwaitInput;
   state.heroSwipeY=String(Math.min(previous,scrollY));
   state.heroSwipeAt=String(performance.now?.()||0);
   state.heroSwipe='queued';
   window.dispatchEvent(new Event('telecenter:first-swipe'));
 }
 addEventListener('touchstart', e=>{
   if(e.touches.length!==1){startY=null;return}
   const t=e.touches[0];startY=t.clientY;startX=t.clientX;fromHero=inHero();
 },opts);
 addEventListener('touchmove', e=>{
   if(startY===null||!fromHero||e.touches.length!==1)return;
   const t=e.touches[0],dy=startY-t.clientY;
   if(dy>4&&dy>Math.abs(startX-t.clientX)){startY=null;request()}
 },opts);
 for(const name of ['touchend','touchcancel'])addEventListener(name,()=>{startY=null},opts);
 addEventListener('wheel', e=>{if(!e.ctrlKey&&e.deltaY>1&&inHero())request()},opts);
 addEventListener('keydown', e=>{
   if(!e.defaultPrevented&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&
      ['ArrowDown','PageDown',' '].includes(e.key)&&!e.target.closest?.('input,textarea,select,button,a,[contenteditable=true]')&&inHero())request();
 });
 addEventListener('scroll',()=>{
   const y=window.scrollY;
   if(location.pathname!=='/'){previous=y;return}
   if(y<=1&&previous>1)delete state.heroSwipe;
   if(!state.heroAwaitInput&&y>previous+1&&previous<innerHeight*.82&&(!location.hash||location.hash==='#home'))request();
   previous=y;
 },{passive:true});
 addEventListener('pageshow',e=>{
   previous=window.scrollY;
   if(e.persisted&&previous<=1)delete state.heroSwipe;
 });
})();`;
