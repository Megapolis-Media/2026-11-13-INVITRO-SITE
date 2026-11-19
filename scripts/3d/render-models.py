import os
os.environ['PYOPENGL_PLATFORM']='egl'
os.environ['LIBGL_ALWAYS_SOFTWARE']='1'
import numpy as np, trimesh, pyrender
from PIL import Image
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def pose(eye,at):
 eye=np.array(eye,dtype=float); z=eye-np.array(at);z/=np.linalg.norm(z);x=np.cross([0,1,0],z);x/=np.linalg.norm(x);y=np.cross(z,x);m=np.eye(4);m[:3,:3]=np.column_stack([x,y,z]);m[:3,3]=eye;return m
r=pyrender.OffscreenRenderer(1500,1050)
for file in (ROOT/'public/models').glob('*.glb'):
 print('Rendering',file.name,flush=True)
 t=trimesh.load(file,force='scene');scene=pyrender.Scene.from_trimesh_scene(t,bg_color=[0,0,0,0],ambient_light=[.28,.32,.34]); bounds=t.bounds;center=(bounds[0]+bounds[1])/2;size=bounds[1]-bounds[0]
 dist=max(size[1],size[0]/(1500/1050),size[2])*1.85
 eye=center+np.array([dist*.27,dist*.2,dist]);scene.add(pyrender.PerspectiveCamera(yfov=np.deg2rad(34)),pose=pose(eye,center))
 for location,color,intensity in [([-4,7,9],[1,.91,.79],4.5),([5,4,3],[.74,.94,1],3),([0,5,-5],[.45,.9,1],3.5)]:
  p=center+np.array(location)*dist/8;scene.add(pyrender.DirectionalLight(color=color,intensity=intensity),pose=pose(p,center))
 color,depth=r.render(scene,flags=pyrender.RenderFlags.RGBA)
 Image.fromarray(color).save(ROOT/'public/models'/f'{file.stem}.png')
 print('saved',color.shape,'geometry',len(t.geometry),'vertices',sum(len(g.vertices) for g in t.geometry.values()),flush=True)
r.delete()
