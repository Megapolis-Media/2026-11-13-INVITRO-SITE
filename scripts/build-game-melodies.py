"""Rebuild the archived 24-track holiday catalog from reusable historic scores.
Source permission: https://github.com/bbloomf/christmas-carols/blob/master/LICENSE.md
No original commercial recordings or lyrics are included.
"""
import pathlib,re,urllib.request,urllib.parse,json,concurrent.futures,io,wave,subprocess
import mido,numpy as np
ROOT=pathlib.Path(__file__).resolve().parents[1]; out=ROOT/'public/games-v2/audio';out.mkdir(parents=True,exist_ok=True)
items=[('Jingle Bells','Jingle Bells — Бубенцы'),('We Wish You a Merry Christmas','We Wish You a Merry Christmas'),('Carol of the Bells','Щедрик — Carol of the Bells'),('Deck the Hall','Deck the Halls — Украшаем дом'),('O Christmas Tree','O Christmas Tree — О ёлочка'),('Auld Lang Syne','Auld Lang Syne — Старые добрые времена'),('Silent Night','Silent Night — Тихая ночь'),('Joy to the World!','Joy to the World'),('God Rest You Merry, Gentlemen','God Rest Ye Merry, Gentlemen'),('Ding Dong Merrily on High','Ding Dong Merrily on High'),('Good King Wenceslas-Stainer','Good King Wenceslas'),('The First Noël','The First Noel'),('Hark! the Herald Angels Sing','Hark! The Herald Angels Sing'),('Angels We Have Heard on High','Angels We Have Heard on High'),('O Come, All Ye Faithful','O Come, All Ye Faithful'),('O Holy Night','O Holy Night — Святая ночь'),('The Twelve Days of Christmas','The Twelve Days of Christmas'),('We Three Kings of Orient Are','We Three Kings'),('What Child is This','Greensleeves — What Child Is This'),('I Saw Three Ships','I Saw Three Ships'),('The Holly and the Ivy-English','The Holly and the Ivy'),('Fum, Fum, Fum','Fum, Fum, Fum'),('Pat-a-Pan','Pat-a-Pan'),('Bring a Torch, Jeanette, Isabella!','Bring a Torch, Jeannette, Isabella')]
page=subprocess.check_output(['curl','-fsSL','--max-time','30','https://acollectionofchristmascarols.com/']).decode()
links={urllib.parse.unquote(x.split('/')[-1][:-5]):urllib.parse.urljoin('https://acollectionofchristmascarols.com/',x) for x in re.findall(r'href="([^\"]+\.midi)"',page)}
def make(pair):
 idx,(name,title)=pair; ident=f'm{idx+1:02}';url=links[name];data=subprocess.check_output(['curl','-fsSL','--retry','2','--max-time','30',url]);mid=mido.MidiFile(file=io.BytesIO(data));active={};notes=[];t=0
 for msg in mid:
  t+=msg.time
  if t>45:break
  if msg.type=='note_on' and msg.velocity>0:active[(msg.channel,msg.note)]=(t,msg.velocity)
  elif msg.type in ('note_on','note_off'):
   key=(msg.channel,msg.note)
   if key in active:
    start,vel=active.pop(key);notes.append((start,t-start,msg.note,vel))
 if not notes:raise ValueError(name)
 first=min(n[0] for n in notes); sr=32000;length=18;buf=np.zeros(int((length+1)*sr))
 # Soft bell/piano attack: harmonic, percussive and with a small stereo room.
 for start,dur,note,vel in notes:
  start-=first
  if start>=length:continue
  n=int(min(dur+.8,length-start)*sr)
  if n<=0:continue
  time=np.arange(n)/sr;hz=440*2**((note-69)/12)
  env=(1-np.exp(-time*120))*np.exp(-time/(.65+dur*.5));env*=np.minimum(1,np.maximum(0,(dur+.6-time)/.4))
  tone=(np.sin(2*np.pi*hz*time)+.28*np.sin(2*np.pi*hz*2*time)*np.exp(-time*3)+.12*np.sin(2*np.pi*hz*3*time)*np.exp(-time*5))
  at=int(start*sr);buf[at:at+n]+=tone*env*(vel/127)*.2
 for delay,gain in [(.09,.14),(.17,.10),(.29,.08),(.43,.04)]:
  n=int(delay*sr);buf[n:]+=buf[:-n]*gain
 peak=np.max(np.abs(buf));buf=buf/max(peak,.001)*.85;buf[-sr:]*=np.linspace(1,0,sr)
 stereo=np.stack([buf,np.roll(buf,110)*.95],axis=1);stereo[:110,1]=0
 wav=out/(ident+'.wav')
 with wave.open(str(wav),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((stereo*32767).astype('<i2').tobytes())
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','128k','-map_metadata','-1',str(out/(ident+'.mp3'))],check=True);wav.unlink()
 return {'id':ident,'title':title,'audio':'/games-v2/audio/'+ident+'.mp3','source':url,'arrangement':'Instrumental bell/piano rendering from reusable MIDI score; no vocals','seconds':19}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:result=list(pool.map(make,enumerate(items)))
(ROOT/'docs/games/melody-sources.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print('Rendered',len(result),'distinct melodies')
