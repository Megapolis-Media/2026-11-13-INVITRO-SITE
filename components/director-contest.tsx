"use client";

import {useEffect, useRef, useState, type FormEvent} from 'react';
import {ArrowUpRight, Check, ChevronUp, Clapperboard, Upload} from 'lucide-react';
import WorldObject from '@/components/world-object';
import {sendBroadcast} from '@/lib/broadcast/catalog';
import type {Participant} from '@/lib/participant/client';

const agglomerations = [
  'Москва и Центр компетенций', 'Сибирь и Дальний восток', 'Юг', 'Казахстан',
  'Беларусь', 'Урал', 'Северо-запад', 'Vet union', 'Приволжье', 'Центр',
];
const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

export default function DirectorContest({profile}:{profile:Participant|null}) {
  const [expanded,setExpanded]=useState(false);
  const [busy,setBusy]=useState(false);
  const [saved,setSaved]=useState(false);
  const [error,setError]=useState('');
  const [fileName,setFileName]=useState('');
  const requestId=useRef('');
  const formRef=useRef<HTMLFormElement>(null);
  const successRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if(expanded) formRef.current?.querySelector<HTMLInputElement>('input')?.focus({preventScroll:true});
  },[expanded]);
  useEffect(()=>{if(saved)successRef.current?.focus({preventScroll:true})},[saved]);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy)return;
    const form=event.currentTarget;
    const values=new FormData(form);
    const file=values.get('file');
    const agglomeration=String(values.get('agglomeration')||'');
    if(!(file instanceof File)||!file.size){setError('Добавьте видео вашего поздравления.');return}
    if(!videoTypes.includes(file.type.split(';')[0])||file.size>25*1024*1024){
      setError('Выберите видео MP4, MOV или WebM размером до 25 МБ.');return;
    }
    if(!agglomerations.includes(agglomeration)){setError('Выберите вашу агломерацию.');return}
    setBusy(true);setError('');
    requestId.current ||= crypto.randomUUID();
    values.set('id',requestId.current);
    values.set('kind','greeting');
    values.set('recipient',`Сам себе режиссёр / ${agglomeration}`);
    values.set('body',`Конкурс «Сам себе режиссёр».\nАгломерация: ${agglomeration}.\n${String(values.get('comment')||'').trim()}`);
    try {
      const result=await sendBroadcast(values);
      if(!result.saved)throw new Error('Видео не сохранилось. Попробуйте ещё раз.');
      setSaved(true);form.reset();setFileName('');requestId.current='';
    } catch(e) {
      setError(e instanceof Error?e.message:'Не удалось отправить видео. Попробуйте ещё раз.');
    } finally {setBusy(false)}
  }

  return <article className="director-contest" aria-labelledby="director-title">
    <div className="director-contest__hero">
      <div className="director-contest__copy">
        <span className="director-contest__eyebrow"><Clapperboard size={18}/> КОНКУРС ВИДЕОПОЗДРАВЛЕНИЙ</span>
        <h3 id="director-title">САМ СЕБЕ<br/><em>РЕЖИССЁР</em></h3>
        <p>Ваша агломерация — ваша съёмочная группа. Соберите коллег и снимите новогоднее поздравление, которое захочется пересматривать.</p>
        <button type="button" className="broadcast-button" aria-expanded={expanded} aria-controls="director-entry"
          onClick={()=>setExpanded(value=>!value)}>
          {expanded?'Свернуть заявку':saved?'Видео отправлено':'Отправить видео'}
          {expanded?<ChevronUp/>:saved?<Check/>:<ArrowUpRight/>}
        </button>
        <span className="director-contest__caption">Знакомая рубрика. Теперь в главной роли — вы.</span>
      </div>
      <div className="director-contest__scene" aria-hidden="true">
        <span className="director-contest__record"><i/> REC</span>
        <div className="director-contest__camera"><WorldObject asset="BROADCAST_CAMERA"/></div>
        <div className="director-contest__air"><WorldObject asset="LIVE_LIGHTBOX"/></div>
        <span className="director-contest__take">АГЛОМЕРАЦИИ INVITRO · ДУБЛЬ 01</span>
      </div>
    </div>
    <div id="director-entry" className="director-entry" hidden={!expanded}>
      {saved?<div className="director-entry__success" ref={successRef} tabIndex={-1} role="status">
        <Check size={28}/><div><h4>Ваше видео — у команды проекта.</h4><p>Спасибо за поздравление! Контактная почта сохранена вместе с роликом.</p></div>
      </div>:<form ref={formRef} onSubmit={submit} aria-label="Отправить видео на конкурс «Сам себе режиссёр»" aria-busy={busy}>
        <div className="director-entry__heading"><h4>Покажите, как поздравляет ваша команда</h4><p>Прикрепите ролик и оставьте почту, чтобы организаторы могли с вами связаться.</p></div>
        <fieldset disabled={busy} className="director-entry__fields">
          <label>Ваше имя<input name="name" autoComplete="name" defaultValue={profile?.name||''} required minLength={2} maxLength={120}/></label>
          <label>Рабочая почта<input name="email" type="email" autoComplete="email" defaultValue={profile?.email||''} required maxLength={254}/></label>
          <label className="director-entry__wide">Агломерация<select name="agglomeration" required defaultValue=""><option value="" disabled>Выберите агломерацию</option>{agglomerations.map(item=><option key={item}>{item}</option>)}</select></label>
          <label className="director-entry__upload director-entry__wide"><span><Upload size={21}/> {fileName||'Добавить видеопоздравление'}</span><small id="director-file-hint">MP4, MOV или WebM · до 25 МБ</small><input name="file" type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" required aria-describedby="director-file-hint" onChange={event=>{setFileName(event.target.files?.[0]?.name||'');setError('')}}/></label>
          <label className="director-entry__wide">Пара слов о вашей команде <small>необязательно</small><textarea name="comment" rows={3} maxLength={1000}/></label>
          <label className="director-entry__consent director-entry__wide"><input type="checkbox" name="consent" value="true" required/><span>Разрешаю передать видео и контактную почту организаторам конкурса.</span></label>
          {error&&<p className="director-entry__error director-entry__wide" role="alert">{error}</p>}
          <button className="broadcast-button director-entry__submit" type="submit">{busy?'Отправляем видео…':'Отправить на конкурс'}<ArrowUpRight/></button>
        </fieldset>
      </form>}
    </div>
  </article>;
}
