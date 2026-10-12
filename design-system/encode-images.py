"""Print {path: data-URL} for each public/ image path, as downsized WebP.

Usage: python3 encode-images.py <public-dir> /images/a.png /BalibuLogo.png ...
Cutouts keep their alpha; nothing is wider than 760px (the hero dish tops out
at 700 CSS px).
"""
import base64, io, json, os, sys
from PIL import Image

public, paths = sys.argv[1], sys.argv[2:]
out = {}
for p in paths:
    src = os.path.join(public, p.lstrip('/'))
    if not os.path.exists(src):
        continue
    im = Image.open(src)
    im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
    im.thumbnail((760, 760), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=74, method=6)
    out[p] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
json.dump(out, sys.stdout)
