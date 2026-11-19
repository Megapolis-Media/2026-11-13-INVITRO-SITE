/** Local effects only; the actual live programme always uses its own HTML audio player. */
let context:AudioContext|null=null;
const tune='/audio/radio-tuning.mp3',vinyl='/audio/vinyl-scratch.mp3';
const buffers=new Map<string,AudioBuffer>(),pending=new Map<string,Promise<AudioBuffer|null>>();
function getContext(){
 const Ctor=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 if(!Ctor)return null;if(!context||context.state==='closed')context=new Ctor();return context;
}
function load(url:string){
 if(buffers.has(url))return Promise.resolve(buffers.get(url)!);
 if(pending.has(url))return pending.get(url)!;
 const job=fetch(url).then(r=>{if(!r.ok)throw Error('FX unavailable');return r.arrayBuffer()})
  .then(async bytes=>{const ctx=getContext();if(!ctx)return null;const buf=await ctx.decodeAudioData(bytes);buffers.set(url,buf);return buf;})
  .catch(()=>null).finally(()=>pending.delete(url));
 pending.set(url,job);return job;
}
export async function prepareRadioAudio(){
 try{const ctx=getContext();if(!ctx)return false;
  // Start resume in the input event, not after fetching or decoding the sample.
  const resume=ctx.state==='running'?Promise.resolve():ctx.resume();
  const [,buf]=await Promise.all([resume,load(tune)]);return !!buf&&ctx.state==='running';
 }catch{return false;}
}
export function installRadioAudioUnlock(){
 void load(tune);void load(vinyl);
 const unlock=()=>{if(context?.state!=='running')void prepareRadioAudio();};
 const events=['pointerdown','pointerup','touchend','keydown'] as const;events.forEach(e=>window.addEventListener(e,unlock,{passive:true}));
 return()=>events.forEach(e=>window.removeEventListener(e,unlock));
}
function sample(url:string,volume:number,onLevel?:(value:number)=>void){
 let source:AudioBufferSourceNode|null=null,gain:GainNode|null=null,meter:AnalyserNode|null=null,rf=0,cancelled=false;
 const ctx=getContext();if(!ctx||ctx.state!=='running')return()=>{};
 const release=()=>{cancelAnimationFrame(rf);source?.disconnect();gain?.disconnect();meter?.disconnect();};
 const start=(b:AudioBuffer|null)=>{
  if(!b||cancelled||ctx.state!=='running')return;
  source=ctx.createBufferSource();source.buffer=b;gain=ctx.createGain();gain.gain.value=volume;source.connect(gain);
  if(onLevel){meter=ctx.createAnalyser();meter.fftSize=1024;gain.connect(meter);meter.connect(ctx.destination);
   const data=new Float32Array(meter.fftSize);const tick=()=>{if(cancelled||!meter)return;meter.getFloatTimeDomainData(data);let sum=0;for(const n of data)sum+=n*n;onLevel(Math.min(1,Math.sqrt(sum/data.length)*4));rf=requestAnimationFrame(tick);};rf=requestAnimationFrame(tick);
  }else gain.connect(ctx.destination);
  source.onended=release;source.start();
 };
 if(buffers.has(url))start(buffers.get(url)!);else void load(url).then(start);
 return()=>{cancelled=true;if(source){source.onended=null;try{source.stop()}catch{}}release();};
}
export const radioTuningCue=(onLevel?:(value:number)=>void)=>sample(tune,.96,onLevel);
export const scratchCue=()=>sample(vinyl,.45);

/** A brief band-limited CRT hiss, using the audio session already unlocked by the listener. */
export function tvStaticCue(){
 const ctx=context;if(!ctx||ctx.state!=='running')return;
 const length=.19,start=ctx.currentTime,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*length),ctx.sampleRate);
 const mono=buffer.getChannelData(0);for(let i=0;i<mono.length;i++)mono[i]=Math.random()*2-1;
 const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 noise.buffer=buffer;filter.type='bandpass';filter.frequency.value=2450;filter.Q.value=.64;
 gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.15,start+.012);gain.gain.setValueAtTime(.13,start+.14);gain.gain.linearRampToValueAtTime(0,start+length);
 noise.connect(filter).connect(gain).connect(ctx.destination);
 noise.onended=()=>{noise.disconnect();filter.disconnect();gain.disconnect()};noise.start();
}
