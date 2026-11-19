'use client';
import {useEffect, useRef} from 'react';
import {crossesStop, measureStop, type StudioStop} from './studio-crossing';

type Props = {motion: boolean; radio: boolean; tv: boolean; onRadio: () => void};
const stops: StudioStop[] = ['radio','tv'];

export default function StudioDirector({motion, radio, tv, onRadio}: Props) {
  const onReceiver = useRef(onRadio);
  useEffect(() => { onReceiver.current = onRadio }, [onRadio]);
  const seen = useRef(new Set<StudioStop>());

  useEffect(() => {
    const pending = new Map<StudioStop, ReturnType<typeof setTimeout>>();
    let previous = window.scrollY, frame = 0, initial = true;
    const enabled = (id: StudioStop) => id === 'radio' ? radio : tv;
    const radius = () => document.documentElement.clientWidth <= 700 ? 20 : 32;

    function fire(id: StudioStop, source: 'ball' | 'scroll' | 'entry') {
      if (!enabled(id) || seen.current.has(id) || document.hidden) return;
      const element = document.querySelector(id === 'radio' ? '#radio .rigonda-object' : '.promo-tv-object');
      if (!element) return;
      clearTimeout(pending.get(id));
      pending.delete(id);
      seen.current.add(id);
      element.setAttribute('data-cue', source);
      if (id === 'radio') {
        window.dispatchEvent(new Event('telecenter:receiver-impact'));
        onReceiver.current();
      } else {
        window.dispatchEvent(new CustomEvent('telecenter:tv-impact', {detail: {motion}}));
      }
    }

    function tick() {
      frame = 0;
      if (document.hidden) return;
      const now = window.scrollY, view = window.innerHeight;
      for (const id of stops) {
        if (!enabled(id) || seen.current.has(id) || pending.has(id)) continue;
        const point = measureStop(id, radius());
        if (!point || !crossesStop(previous, now, point.y - view * .52, view, initial)) continue;
        const source = initial ? 'entry' : 'scroll';
        // Give the moving ball first chance. Wheel bursts can cross a stop between frames.
        pending.set(id, setTimeout(() => {
          pending.delete(id);
          const journey=document.getElementById('ball-journey');
          if(journey?.dataset.ownsContacts==='true')return;
          const contact = measureStop(id, radius());
          if (!contact) return;
          const screenY = contact.y - window.scrollY;
          if (screenY >= -view * .08 && screenY <= view * .85) fire(id, source);
        }, motion && !initial ? 185 : 0));
      }
      previous = now;
      initial = false;
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(tick) };
    const restore = () => { initial = true; previous = window.scrollY; schedule() };
    const contact = (event: Event) => {
      const id = (event as CustomEvent).detail;
      if (id === 'radio' || id === 'tv') fire(id, 'ball');
    };
    const reset=()=>{
      pending.forEach(clearTimeout);pending.clear();seen.current.clear();
      previous=scrollY;initial=false;
      document.querySelectorAll('.rigonda-object[data-cue],.promo-tv-object[data-cue]').forEach(el=>el.removeAttribute('data-cue'));
    };
    window.addEventListener('telecenter:journey-reset',reset);
    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', restore);
    window.addEventListener('pageshow', restore);
    window.addEventListener('telecenter:ball-contact', contact);
    document.addEventListener('visibilitychange', restore);
    schedule();
    return () => {
      window.removeEventListener('telecenter:journey-reset',reset);
      cancelAnimationFrame(frame);
      pending.forEach(clearTimeout);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', restore);
      window.removeEventListener('pageshow', restore);
      window.removeEventListener('telecenter:ball-contact', contact);
      document.removeEventListener('visibilitychange', restore);
    };
  }, [motion,radio,tv]);
  return null;
}
