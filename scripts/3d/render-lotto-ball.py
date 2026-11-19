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
model=trimesh.load(ROOT/'public/models-brand/LOTTO_BALL_23.glb',force='scene')
scene=pyrender.Scene.from_trimesh_scene(model,bg_color=[0,0,0,0],ambient_light=[.3,.33,.35])
scene.add(pyrender.PerspectiveCamera(yfov=np.deg2rad(32)),pose=pose([.48,.28,6.3],[0,0,0]))
for pos,col,power in [([-3,6,7],[1,1,1],3.2),([4,2,5],[.75,.95,1],1.1),([-1,4,-4],[1,1,1],1.4)]:scene.add(pyrender.DirectionalLight(color=col,intensity=power),pose=pose(pos,[0,0,0]))
r=pyrender.OffscreenRenderer(1200,1200)
color,_=r.render(scene,flags=pyrender.RenderFlags.RGBA)
Image.fromarray(color).save(ROOT/'public/models-brand/LOTTO_BALL_23.png');r.delete();print('Ball render ready')
