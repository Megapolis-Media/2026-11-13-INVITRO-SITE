"""Bake the hero's subtle anisotropic floor reflections; no noise generation at runtime."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

W, H = 768, 352
rng = np.random.default_rng(1223)
def grain(w, h, radius):
    noise = Image.fromarray(rng.integers(0, 256, (h,w),dtype=np.uint8))
    arr = np.asarray(noise.resize((W,H),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(radius)),dtype=float)
    return (arr-arr.mean())/max(1.,arr.std())

frost = grain(74,170,.7)*.59+grain(36,106,1.4)*.28+grain(230,246,.4)*.13
alpha = np.clip((frost+.65)*36,0,125)
ink = Image.fromarray(alpha.astype(np.uint8))
lines=Image.new('L',(W,H)); draw=ImageDraw.Draw(lines)
for _ in range(720):
    x,y=rng.integers(0,W),rng.integers(0,H)
    length=rng.integers(2,18)
    c=int(rng.integers(15,98))
    for xx in (x-W,x,x+W):draw.line((xx,y,xx+length,y),fill=c)
alpha=np.maximum(np.asarray(ink),np.asarray(lines.filter(ImageFilter.GaussianBlur(.7))))
# Wrap the first and last columns continuously on wide displays.
margin=42
weight=np.linspace(0,1,margin)[None,:]
alpha=alpha.copy()
alpha[:,:margin]=(alpha[:,:margin]*weight+alpha[:,-margin:]*(1-weight)).astype(np.uint8)
out=Image.new("RGBA",(W,H),(241,254,255));out.putalpha(Image.fromarray(alpha))
out.save(Path(__file__).resolve().parents[2]/"public/hero-v74/ice.webp",quality=84,method=6,alpha_quality=83)
