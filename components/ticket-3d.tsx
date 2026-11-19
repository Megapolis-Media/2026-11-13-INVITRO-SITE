'use client';
import {useId, useMemo, type PointerEvent} from 'react';
import backdrop from '@/lib/assets/ticket-kv.jpg?url';
import {ticketArtwork} from '@/lib/ticket-art';
import './ticket-3d.css';

type Props = {number?: string; name?: string; earned?: boolean; celebrate?: boolean};

function tilt(e: PointerEvent<HTMLDivElement>) {
  if (e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const frame = e.currentTarget;
  const bounds = frame.getBoundingClientRect();
  frame.style.setProperty('--tilt-x', `${(.5 - (e.clientY - bounds.top) / bounds.height) * 4}deg`);
  frame.style.setProperty('--tilt-y', `${((e.clientX - bounds.left) / bounds.width - .5) * 6}deg`);
}

function reset(e: PointerEvent<HTMLDivElement>) {
  e.currentTarget.style.removeProperty('--tilt-x');
  e.currentTarget.style.removeProperty('--tilt-y');
}

export default function Ticket3D({number = 'ВАШ НОМЕР', name = '', earned = false, celebrate = false}: Props) {
  const clipId = 'iv-ticket-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const artwork = useMemo(() => ticketArtwork({number, name, earned, backdrop, clipId}), [number, name, earned, clipId]);
  return <div className={'event-ticket' + (celebrate ? ' ticket-arrival' : '')} onPointerMove={tilt} onPointerLeave={reset}>
    <div className="event-ticket-face" dangerouslySetInnerHTML={{__html: artwork}}/>
  </div>;
}
