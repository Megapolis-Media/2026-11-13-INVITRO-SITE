"""Software fallback of the exact exported miniature (no WebGL required)."""
import os
os.environ['PYOPENGL_PLATFORM']='egl'
os.environ['LIBGL_ALWAYS_SOFTWARE']='1'
import OpenGL.arrays.ctypesarrays,OpenGL.arrays.numpymodule
import numpy as np,trimesh,pyrender,ctypes
from PIL import Image,ImageDraw,ImageFont
from OpenGL import platform
from pathlib import Path
np.infty=np.inf
native_gen=platform.PLATFORM.GL.glGenTextures
native_gen.argtypes=[ctypes.c_int,ctypes.POINTER(ctypes.c_uint)]
def gen_textures(n):
 ids=(ctypes.c_uint*n)();native_gen(n,ids);return ids[0] if n==1 else list(ids)
pyrender.texture.glGenTextures=gen_textures
ROOT=Path(__file__).resolve().parents[2]
def pose(eye,at):
 eye=np.array(eye,dtype=float);z=eye-np.array(at);z/=np.linalg.norm(z);x=np.cross([0,1,0],z);x/=np.linalg.norm(x);y=np.cross(z,x);m=np.eye(4);m[:3,:3]=np.column_stack([x,y,z]);m[:3,3]=eye;return m
# Rasterise the informational display with the real cover, without stretching it.
screen=Image.new('RGB',(1280,476),'#0b2231');d=ImageDraw.Draw(screen)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
d.text((450,85),'СЕЙЧАС В ЭФИРЕ',font=ImageFont.truetype(bold,32),fill='#6ed2e6')
d.text((450,173),'Снег кружится',font=ImageFont.truetype(bold,76),fill='white');d.text((450,282),'ВИА Пламя',font=ImageFont.truetype(font,47),fill='#d0edf2')
screen.paste(Image.open(ROOT/'public/media/plamya-cover.jpg').resize((360,360)),(38,58))
model=trimesh.load(ROOT/'public/models-brand/RADIO_STUDIO.glb',force='scene')
for node in model.graph.nodes_geometry:
 if node.startswith('Wordmark') or node=='NowPlaying':
  geom=model.geometry[model.graph[node][1]]
  img=screen if node=='NowPlaying' else Image.open(ROOT/'public/brand/invitro-wordmark-source.png')
  geom.visual.material=trimesh.visual.material.PBRMaterial(baseColorTexture=img.transpose(Image.Transpose.FLIP_TOP_BOTTOM),metallicFactor=0,roughnessFactor=.55,emissiveFactor=[.13,.13,.13])
scene=pyrender.Scene(bg_color=[0,0,0,0],ambient_light=[.23,.26,.28])
for node in model.graph.nodes_geometry:
 transform,geometry=model.graph[node];scene.add(pyrender.Mesh.from_trimesh(model.geometry[geometry]),pose=transform,name=node)
glass=[n for n in scene.mesh_nodes if n.name=='GlassShell']
for n in glass:scene.remove_node(n)
scene.add(pyrender.PerspectiveCamera(yfov=np.deg2rad(34)),pose=pose([1.35,1.48,11.30],[0,.28,0]))
for pos,col,power in [([-3,6,7],[1,.97,.9],3.6),([4,2,5],[.7,.93,1],1.5),([-1,4,-4],[1,1,1],2.4)]:scene.add(pyrender.DirectionalLight(color=col,intensity=power),pose=pose(pos,[0,0,0]))
r=pyrender.OffscreenRenderer(1400,1526)
color,_=r.render(scene,flags=pyrender.RenderFlags.RGBA|pyrender.RenderFlags.SHADOWS_DIRECTIONAL);im=Image.fromarray(color)
# Analytic ray/sphere optical pass: the same Fresnel and softbox lobes as GLB vertex alpha.
# It avoids renderer-specific loss of glTF vertex alpha on transparent PBR materials.
h,w=1526,1400;eye=np.array([1.35,1.48,11.30]);rotation=pose(eye,[0,.28,0])[:3,:3]
yy,xx=np.mgrid[0:h,0:w];f=np.tan(np.deg2rad(34)/2)
rays=np.stack([((xx+.5)/w*2-1)*f*w/h,(1-(yy+.5)/h*2)*f,-np.ones_like(xx)],axis=-1)@rotation.T
rays/=np.linalg.norm(rays,axis=-1)[...,None]
b=2*np.sum(rays*eye,axis=-1);disc=b*b-4*(np.sum(eye*eye)-2.78**2)
t=(-b-np.sqrt(np.maximum(0,disc)))/2;hit=eye+rays*t[...,None];n=hit/2.78
mask=(disc>=0)&(hit[:,:,1]>-1.49)
rim=(1-np.clip(np.sum(n*-rays,axis=-1),0,1))**3*.48
left=np.exp(-((n[:,:,0]+.53)/.075)**2-((n[:,:,1]-.47)/.28)**2)
right=np.exp(-((n[:,:,0]-.77)/.054)**2-((n[:,:,1]-.19)/.26)**2)
a=np.minimum(.72,.014+rim+np.maximum(left*.54,right*.39)*np.maximum(0,n[:,:,2]))*mask
optical=np.empty((h,w,4),dtype=np.uint8);optical[:,:,:3]=[230,253,255];optical[:,:,3]=(a*255).astype(np.uint8)
im=Image.alpha_composite(im,Image.fromarray(optical))
im.save(ROOT/'public/models-brand/RADIO_STUDIO.tmp.png');os.replace(ROOT/'public/models-brand/RADIO_STUDIO.tmp.png',ROOT/'public/models-brand/RADIO_STUDIO.png');im.save(ROOT/'public/models-brand/RADIO_STUDIO.tmp.webp',quality=94);os.replace(ROOT/'public/models-brand/RADIO_STUDIO.tmp.webp',ROOT/'public/models-brand/RADIO_STUDIO.webp');r.delete();print('Radio render ready')
