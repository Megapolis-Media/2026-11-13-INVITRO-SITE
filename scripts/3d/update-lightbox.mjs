import * as T from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import fs from 'node:fs/promises';
const dir=new URL('../../public/models/',import.meta.url);await fs.mkdir(dir,{recursive:true});
const font=new FontLoader().parse(JSON.parse(await fs.readFile(new URL('./font.json',import.meta.url),'utf8')));
globalThis.FileReader=class{readAsArrayBuffer(b){b.arrayBuffer().then(x=>{this.result=x;this.onloadend?.()})}readAsDataURL(b){b.arrayBuffer().then(x=>{this.result='data:'+b.type+';base64,'+Buffer.from(x).toString('base64');this.onloadend?.()})}};
const mat=(name,color,metalness=.1,roughness=.3,extra={})=>new T.MeshPhysicalMaterial({name,color,metalness,roughness,...extra});
const ivory=mat('Ivory enamel','#f5f3e7',.15,.24),teal=mat('INVITRO teal lacquer','#009ba6',.2,.2,{clearcoat:1,clearcoatRoughness:.15}),gold=mat('Champagne brushed metal','#bc9d69',.85,.28),black=mat('Camera graphite','#141e24',.55,.32),rubber=mat('Grip rubber','#080d11',.05,.62),steel=mat('Machined aluminium','#85939a',.9,.21),glass=mat('Coated optical glass','#163c54',.75,.08,{clearcoat:1}),red=mat('Red acrylic diffuser','#d71f24',.2,.22,{emissive:'#b00000',emissiveIntensity:.65}),white=mat('White illuminated letters','#ffffff',.1,.27,{emissive:'#fff0d3',emissiveIntensity:.35});
function mesh(g,geo,m,n,p=[0,0,0],rot=[0,0,0]){const o=new T.Mesh(geo,m);o.name=n;o.position.set(...p);o.rotation.set(...rot);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
function box(g,n,w,h,d,m,p,rad=.04){return mesh(g,new RoundedBoxGeometry(w,h,d,3,rad),m,n,p)}
function cyl(g,n,r,h,m,p,rot=[Math.PI/2,0,0],r2=r){return mesh(g,new T.CylinderGeometry(r,r2,h,48),m,n,p,rot)}
function tor(g,n,r,t,m,p,rot=[0,0,0]){return mesh(g,new T.TorusGeometry(r,t,10,80),m,n,p,rot)}
function text(g,str,size,depth,p,name,front=ivory,side=teal){let cursor=0;const row=new T.Group();row.name=name;g.add(row);for(const [i,c] of [...str].entries()){if(c===' '){cursor+=size*.35;continue}const geo=new TextGeometry(c,{font,size,depth,curveSegments:8,bevelEnabled:true,bevelThickness:Math.min(.013,size*.016),bevelSize:Math.min(.012,size*.015),bevelSegments:3});geo.computeBoundingBox();mesh(row,geo,[front,side],`${name}_${i}_${c}`,[cursor,0,0]);cursor+=font.data.glyphs[c].ha/1000*size+size*.015;}row.position.set(p[0]-cursor/2,p[1],p[2]);return row;}

const live=new T.Group();live.name='LIVE_LIGHTBOX';
box(live,'Anodized graphite chassis',4.8,.87,.64,black,[0,0,0],.09);
box(live,'Machined aluminium bezel',4.57,.71,.1,steel,[0,0,.325],.055);
box(live,'Recessed optical seal',4.44,.60,.08,rubber,[0,0,.381],.04);
box(live,'Deep red acrylic diffuser',4.31,.49,.04,red,[0,0,.433],.025);
text(live,'ПРЯМОЙ ЭФИР',.32,.008,[0,-.12,.46],'LIVE_TEXT',white,white);
for(const x of [-2.31,2.31]){box(live,'Satin side end cap',.23,.88,.67,black,[x,0,0],.035);for(const y of [-.29,.29])cyl(live,'Recessed assembly screw',.027,.009,steel,[x,y,.342]);for(let i=0;i<6;i++)box(live,'Cooling channel',.025,.40,.027,rubber,[x-.073+i*.03,0,-.34],.002);}
box(live,'Upper champagne highlight',4.25,.018,.045,gold,[0,.42,.1],.004);
const output=await new GLTFExporter().parseAsync(live,{binary:true});await fs.writeFile(new URL('LIVE_LIGHTBOX.glb',dir),Buffer.from(output));console.log('LIVE_LIGHTBOX exported');
