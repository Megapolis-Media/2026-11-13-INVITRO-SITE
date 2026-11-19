"""Original instrumental arrangements of public-domain traditional melodies.
No sampled recordings. Additive bell, celesta, bass and soft stereo room response.
"""
from pathlib import Path
import numpy as np, wave, subprocess
ROOT=Path(__file__).resolve().parents[2];SR=44100;beat=.36
songs={
 'jingle-bells':[(64,1),(64,1),(64,2),(64,1),(64,1),(64,2),(64,1),(67,1),(60,1.5),(62,.5),(64,4),(65,1),(65,1),(65,1.5),(65,.5),(65,1),(64,1),(64,1),(64,.5),(64,.5),(64,1),(62,1),(62,1),(64,1),(62,2),(67,2),(64,1),(64,1),(64,2),(64,1),(64,1),(64,2),(64,1),(67,1),(60,1.5),(62,.5),(64,4),(65,1),(65,1),(65,1.5),(65,.5),(65,1),(64,1),(64,1),(64,.5),(64,.5),(67,1),(67,1),(65,1),(62,1),(60,4)],
 'deck-the-halls':[(67,1.5),(65,.5),(64,1),(62,1),(60,1),(62,1),(64,1),(60,1),(62,.5),(64,.5),(65,.5),(62,.5),(64,1.5),(62,.5),(60,2),(67,1.5),(65,.5),(64,1),(62,1),(60,1),(62,1),(64,1),(60,1),(62,.5),(64,.5),(65,.5),(62,.5),(64,1.5),(62,.5),(60,2),(62,1.5),(64,.5),(65,1),(62,1),(64,1.5),(65,.5),(67,1),(62,1),(64,.5),(66,.5),(67,1),(69,.5),(71,.5),(72,1),(71,1),(69,1),(67,2),(67,1.5),(65,.5),(64,1),(62,1),(60,1),(62,1),(64,1),(60,1),(69,.5),(69,.5),(69,.5),(69,.5),(67,1.5),(65,.5),(64,1),(62,1),(60,2)]}
def freq(m):return 440*2**((m-69)/12)
for name,score in songs.items():
 length=sum(d for _,d in score)*beat+4;mix=np.zeros((int(length*SR),2));cursor=.25
 def note(midi,start,dur,level,pan=0,bass=False):
  t=np.arange(int((dur+1.8)*SR))/SR;f=freq(midi);env=(1-np.exp(-t*85))*np.exp(-t/(.8 if not bass else .5));sig=np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*f*2*t)*np.exp(-t*2)+.1*np.sin(2*np.pi*f*3*t)*np.exp(-t*4)
  if not bass:sig+=.14*np.sin(2*np.pi*f*4.01*t)*np.exp(-t*3)
  sig*=env*level;off=int(start*SR);n=min(len(sig),len(mix)-off)
  mix[off:off+n,0]+=sig[:n]*(1-pan)*.6;mix[off:off+n,1]+=sig[:n]*(1+pan)*.6
 for i,(m,d) in enumerate(score):note(m+12,cursor,d*beat,.32,np.sin(i*.4)*.3);cursor+=d*beat
 total=sum(d for _,d in score)
 for b in range(int(total)//4):
  chord=[[48,52,55],[48,53,57],[47,50,55],[48,52,55]][b%4]
  note(chord[0]-12,.25+b*4*beat,1.1,.18,0,True)
  for j in range(4):note(chord[j%3],.25+(b*4+j)*beat,.5,.105,-.35 if j%2 else .35)
 dry=mix.copy()
 for seconds,gain in [(.11,.16),(.23,.12),(.37,.09),(.51,.07)]:
  offset=int(seconds*SR);mix[offset:]+=dry[:-offset,::-1]*gain
 mix/=max(.85,np.max(np.abs(mix))/0.9);mix[-SR*2:]*=np.linspace(1,0,SR*2)[:,None]
 wav=Path('/tmp')/(name+'.wav')
 with wave.open(str(wav),'wb') as out:out.setnchannels(2);out.setsampwidth(2);out.setframerate(SR);out.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(wav),'-codec:a','libmp3lame','-b:a','160k','-metadata','artist=Телецентр INVITRO — оригинальная инструментальная аранжировка',str(ROOT/'public/media'/(name+'.mp3'))],check=True)
 print(name,round(length,1),'seconds')
