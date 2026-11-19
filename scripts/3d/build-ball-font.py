"""Subset of the system DejaVu Sans typeface for equipment markings, not brand typography."""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
font=TTFont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
glyphset=font.getGlyphSet(); cmap=font.getBestCmap(); scale=1000/font['head'].unitsPerEm
class Pen(BasePen):
 def __init__(self): super().__init__(glyphset); self.tokens=[]
 def point(self,p): return ' '.join(str(round(v*scale,2)) for v in p)
 def _moveTo(self,p): self.tokens.extend(['m',self.point(p)])
 def _lineTo(self,p): self.tokens.extend(['l',self.point(p)])
 def _qCurveToOne(self,c,p): self.tokens.extend(['q',self.point(p),self.point(c)])
 def _curveToOne(self,c1,c2,p): self.tokens.extend(['b',self.point(p),self.point(c1),self.point(c2)])
 def _closePath(self): pass
chars='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ-НОВОГОДНЯЯ ВОЛНАSTEREOstereo•38cm/sЗИМА0123456789ТЕЛЕЦЕНТРINVITROFMСНЕГКРУЖИТСЯВИАПЛАМЯOKVU⅓ПРЯМОЙЭФИР'
glyphs={}
for ch in set(chars):
 name=cmap[ord(ch)]; pen=Pen(); glyphset[name].draw(pen); glyphs[ch]={'ha':font['hmtx'][name][0]*scale,'x_min':0,'x_max':1000,'o':' '.join(pen.tokens)}
Path(__file__).with_name('ball-font.json').write_text(json.dumps({'glyphs':glyphs,'familyName':'DejaVu Sans','resolution':1000,'boundingBox':{'yMin':-250,'yMax':1000},'underlineThickness':50}))
