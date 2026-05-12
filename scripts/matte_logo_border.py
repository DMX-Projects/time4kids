#!/usr/bin/env python3
"""
Trim outer peach matte from a PNG logo: sample edge colors, shrink bounding box via getbbox
after optional edge transparency. Logo-only PNGs only — full-page screenshots will not crop cleanly.
"""

from pathlib import Path

from PIL import Image


def peach_to_alpha(img: Image.Image, rgb: tuple[int, int, int], slack: int = 28) -> Image.Image:
    """Make pixels similar to matte color transparent."""
    px = img.convert("RGBA")
    r0, g0, b0 = rgb
    w, h = px.size
    data = px.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = data[x, y]
            if abs(r - r0) <= slack and abs(g - g0) <= slack and abs(b - b0) <= slack:
                data[x, y] = (r, g, b, 0)
    return px


def main() -> None:
    here = Path(__file__).resolve().parent
    src = here.parent / "public" / "time-kids-tags-logo.png"
    if not src.exists():
        print(f"Missing: {src}")
        return

    matte = (255, 244, 230)  # warm peach-ish; tweak if asset differs
    im = Image.open(src).convert("RGBA")
    im = peach_to_alpha(im, matte, slack=32)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    out = here.parent / "public" / "time-kids-tags-logo-trim.png"
    im.save(out)
    print(f"Wrote {out} ({im.size})")


if __name__ == "__main__":
    main()
