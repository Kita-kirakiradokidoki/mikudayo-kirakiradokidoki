#!/usr/bin/env python3
"""
Subset the custom fonts into woff2 so the site doesn't ship ~96MB of fonts.

- `SFPro.ttf`      -> `SFPro.woff2`   (Latin / digits / punctuation)
- `PingFangUI.ttc` -> `PingFang.woff2` (CJK, using the SC face, font-number 0)

Glyph coverage is derived from the actual text rendered on the site:
  - src/**/*.tsx, src/**/*.ts  (JSX text + string literals + site.config.ts)
  - posts/*.md, comments/*.md  (blog + comment content)

Run:  py scripts/subset-fonts.py
Requires: pip install fonttools brotli
"""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "src" / "fonts"
BUILD = ROOT / "build"

SRC_FONT_SF = FONTS / "SFPro.ttf"
SRC_FONT_PF = FONTS / "PingFangUI.ttc"
OUT_SF = FONTS / "SFPro.woff2"
OUT_PF = FONTS / "PingFang.woff2"

SCAN_GLOBS = [
    ("src", "*.tsx"),
    ("src", "*.ts"),
    ("posts", "*.md"),
    ("comments", "*.md"),
]


def collect_chars() -> set[str]:
    chars: set[str] = set()
    for sub, pat in SCAN_GLOBS:
        base = ROOT / sub
        if not base.exists():
            continue
        for p in base.rglob(pat):
            try:
                text = p.read_text(encoding="utf-8", errors="ignore")
            except Exception as e:
                print(f"  skip {p}: {e}")
                continue
            chars.update(text)
    return chars


def is_cjk(ch: str) -> bool:
    o = ord(ch)
    # CJK ideographs, CJK punctuation, fullwidth forms, kana, ext ranges
    return (
        0x2E80 <= o <= 0x9FFF
        or 0xF900 <= o <= 0xFAFF
        or 0xFF00 <= o <= 0xFFEF
        or 0x3000 <= o <= 0x303F
        or 0x3040 <= o <= 0x30FF
        or 0x3400 <= o <= 0x4DBF
    )


def main() -> int:
    for f in (SRC_FONT_SF, SRC_FONT_PF):
        if not f.exists():
            print(f"ERROR: missing source font {f}", file=sys.stderr)
            return 1

    BUILD.mkdir(exist_ok=True)
    chars = collect_chars()

    # Always include basic ASCII so any English/digits/punctuation render.
    ascii_chars = {chr(c) for c in range(0x20, 0x7F)}
    cjk = {c for c in chars if is_cjk(c)} | {chr(c) for c in range(0x3000, 0x3040)}
    non_cjk = (chars - cjk) | ascii_chars

    cjk_file = BUILD / "_cjk_chars.txt"
    non_cjk_file = BUILD / "_noncjk_chars.txt"
    cjk_file.write_text("".join(sorted(cjk)), encoding="utf-8")
    non_cjk_file.write_text("".join(sorted(non_cjk)), encoding="utf-8")

    print(f"Collected {len(chars)} unique chars "
          f"({len(cjk)} CJK, {len(non_cjk)} non-CJK)")

    # SF Pro: Latin / digits / punctuation
    os.system(
        f'py -m fontTools.subset "{SRC_FONT_SF}" '
        f'--text-file="{non_cjk_file}" '
        f'--flavor=woff2 --no-hinting '
        f'--output-file="{OUT_SF}"'
    )
    # PingFang (SC face): CJK only
    os.system(
        f'py -m fontTools.subset "{SRC_FONT_PF}" '
        f'--font-number=0 '
        f'--text-file="{cjk_file}" '
        f'--flavor=woff2 --no-hinting '
        f'--output-file="{OUT_PF}"'
    )

    for f in (OUT_SF, OUT_PF):
        if f.exists():
            mb = f.stat().st_size / 1_048_576
            print(f"  wrote {f.name}: {mb:.2f} MB")
        else:
            print(f"ERROR: failed to create {f}", file=sys.stderr)
            return 1

    # Clean intermediates
    cjk_file.unlink(missing_ok=True)
    non_cjk_file.unlink(missing_ok=True)
    print("Done. Update src/index.css @font-face to reference the .woff2 files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
