"""Prepare local Code Next preview assets from the supplied Roman, Italic and Bold fonts."""
import argparse
import json
from pathlib import Path
from shutil import copyfile

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

OUTPUT = Path(__file__).resolve().parents[1] / "work" / "font-preview"
WEIGHTS = {300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold",
           700: "Bold", 800: "ExtraBold", 900: "Black"}


def make_faces(variable_file, bold_file, style):
    with TTFont(variable_file) as source:
        names = source["name"]
        instances = {names.getDebugName(i.subfamilyNameID).removesuffix(" Italic"): i.coordinates
                     for i in source["fvar"].instances}
        if "Medium" not in instances:
            instances["Medium"] = {key: (value + instances["SemiBold"][key]) / 2
                                   for key, value in instances["Regular"].items()}
        for weight, name in WEIGHTS.items():
            face = (TTFont(bold_file) if (weight, style) == (700, "normal") else
                    instantiateVariableFont(source, instances[name], inplace=False))
            with face:
                face["OS/2"].usWeightClass = weight
                face.flavor = "woff2"
                path = OUTPUT / f"code-next-{weight}-{style}.woff2"
                face.save(path)
            if style == "normal" and weight in (400, 700):
                copyfile(path, OUTPUT / f"ticket-{weight}.woff2")


class OutlinePen(BasePen):
    """Three.js stores the endpoint before control points for both curve commands."""
    def __init__(self, glyph_set, scale):
        super().__init__(glyph_set)
        self.scale = scale
        self.commands = []

    def command(self, verb, *points):
        self.commands.append(verb)
        self.commands.extend(str(round(value * self.scale, 2)) for point in points for value in point)

    def _moveTo(self, point):
        self.command("m", point)

    def _lineTo(self, point):
        self.command("l", point)

    def _qCurveToOne(self, control, end):
        self.command("q", end, control)

    def _curveToOne(self, control1, control2, end):
        self.command("b", end, control1, control2)

    def _closePath(self):
        pass


def make_geometry(bold_file):
    with TTFont(bold_file) as font:
        scale = 1000 / font["head"].unitsPerEm
        shapes = font.getGlyphSet()
        glyphs = {}
        for code, name in font.getBestCmap().items():
            glyph = shapes[name]
            pen = OutlinePen(shapes, scale)
            glyph.draw(pen)
            glyphs[chr(code)] = {"ha": round(glyph.width * scale, 2), "o": " ".join(pen.commands)}
        geometry = {"glyphs": glyphs, "familyName": font["name"].getDebugName(4),
                    "resolution": 1000, "underlineThickness": font["post"].underlineThickness * scale,
                    "boundingBox": {key: round(getattr(font["head"], key) * scale)
                                    for key in ("yMin", "yMax")}}
    (OUTPUT / "code-next-bold.typeface.json").write_text(
        json.dumps(geometry, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for arg in ("roman", "italic", "bold"):
        parser.add_argument("--" + arg, type=Path, required=True)
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    make_faces(args.roman, args.bold, "normal")
    make_faces(args.italic, args.bold, "italic")
    make_geometry(args.bold)
