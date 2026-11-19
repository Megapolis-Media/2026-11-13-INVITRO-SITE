import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import fs from 'node:fs/promises';
globalThis.ProgressEvent=class{constructor(type,data){Object.assign(this,{type},data)}};
globalThis.FileReader=class{readAsArrayBuffer(b){b.arrayBuffer().then(x=>{this.result=x;this.onloadend?.()})}readAsDataURL(b){b.arrayBuffer().then(x=>{this.result='data:'+b.type+';base64,'+Buffer.from(x).toString('base64');this.onloadend?.()})}};
await fs.mkdir('public/models-brand',{recursive:true});
for(const name of ['LOTTO_BALL_23','BROADCAST_CAMERA','BOOM_MICROPHONE','LIVE_LIGHTBOX','INVITRO_WORLD','INVITRO_TITLE','INVITRO_STAGE']){
 const b=await fs.readFile('public/models/'+name+'.glb');const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 const seen=new Set();g.scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(seen.has(m))continue;seen.add(m);if(/teal/i.test(m.name)){m.color.set('#00acc6');m.roughness=.19;m.metalness=.1;}if(/ivory|enamel/i.test(m.name)){m.color.set('#ffffff');m.roughness=.22;}if(/champagne|gold/i.test(m.name)){m.color.set('#b3c6cf');m.metalness=.86;m.roughness=.22;}if(/white illuminated/i.test(m.name)&&m.emissive)m.emissive.set('#ffffff');}});
 const out=await new GLTFExporter().parseAsync(g.scene,{binary:true});await fs.writeFile('public/models-brand/'+name+'.glb',Buffer.from(out));console.log(name);
}
