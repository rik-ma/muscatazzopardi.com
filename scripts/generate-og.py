#!/usr/bin/env python3
"""
Generate Open Graph share cards for muscatazzopardi.com.

Renders 1200x630 PNGs to public/og/:
  - default.png        — no title, just the name, huge (used for Home / About / Now / Contact)
  - <slug>.png          — one per published entry in content/essays and content/playbooks,
                          title pulled from frontmatter

Design law: dark paper (#0A0A0A), sodium flag bar 90px on the left (#F5D547),
title in Inter Tight 600, name "RICHARD MUSCAT AZZOPARDI" in JetBrains Mono
20px bottom-left in #9A9590. No border-radius, no shadows, no icons.

Usage:
    python scripts/generate-og.py
"""

import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
FONTS_DIR = ROOT / "public" / "fonts"
OG_DIR = ROOT / "public" / "og"
CONTENT_DIRS = [ROOT / "content" / "essays", ROOT / "content" / "playbooks"]

WIDTH, HEIGHT = 1200, 630
FLAG_W = 90

PAPER = "#0A0A0A"
FG = "#F4F2EC"
FG_SOFT = "#9A9590"
ACID = "#F5D547"


def font_uri(filename: str) -> str:
    path = (FONTS_DIR / filename).resolve()
    return path.as_uri()


FONT_FACE_CSS = f"""
@font-face {{
  font-family: 'Inter Tight';
  src: url('{font_uri("InterTight-600.woff2")}') format('woff2');
  font-weight: 600;
  font-style: normal;
}}
@font-face {{
  font-family: 'Inter Tight';
  src: url('{font_uri("InterTight-400.woff2")}') format('woff2');
  font-weight: 400;
  font-style: normal;
}}
@font-face {{
  font-family: 'JetBrains Mono';
  src: url('{font_uri("JetBrainsMono-500.woff2")}') format('woff2');
  font-weight: 500;
  font-style: normal;
}}
"""


def build_html(title: str | None) -> str:
    """Build the OG card HTML. If title is None, render the default name-only card."""
    if title is None:
        # Default card: name huge, no separate title.
        body = f"""
        <div class="name-huge">RICHARD<br>MUSCAT<br>AZZOPARDI</div>
        """
        show_footer_name = False
    else:
        body = f"""
        <div class="title">{title}</div>
        """
        show_footer_name = True

    footer = (
        f'<div class="footer-name">RICHARD MUSCAT AZZOPARDI</div>' if show_footer_name else ""
    )

    return f"""<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  {FONT_FACE_CSS}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{
    width: {WIDTH}px;
    height: {HEIGHT}px;
    background: {PAPER};
    overflow: hidden;
  }}
  .flag {{
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: {FLAG_W}px;
    background: {ACID};
  }}
  .content {{
    position: absolute;
    top: 0; left: {FLAG_W}px; right: 0; bottom: 0;
    padding: 64px 72px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }}
  .title {{
    font-family: 'Inter Tight', sans-serif;
    font-weight: 600;
    font-size: 58px;
    line-height: 1.04;
    letter-spacing: -0.03em;
    color: {FG};
    max-width: 15ch;
  }}
  .name-huge {{
    font-family: 'Inter Tight', sans-serif;
    font-weight: 600;
    font-size: 108px;
    line-height: 0.96;
    letter-spacing: -0.04em;
    color: {FG};
  }}
  .footer-name {{
    position: absolute;
    left: {FLAG_W + 72}px;
    bottom: 48px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    font-size: 20px;
    letter-spacing: 0.02em;
    color: {FG_SOFT};
  }}
</style>
</head>
<body>
  <div class="flag"></div>
  <div class="content">
    {body}
  </div>
  {footer}
</body>
</html>"""


def slugify_frontmatter_title(md_text: str) -> str | None:
    match = re.search(r'^title:\s*"(.*)"\s*$', md_text, re.MULTILINE)
    if match:
        return match.group(1)
    match = re.search(r"^title:\s*(.+)\s*$", md_text, re.MULTILINE)
    return match.group(1).strip().strip('"') if match else None


def is_draft(md_text: str) -> bool:
    match = re.search(r"^draft:\s*(true|false)\b", md_text, re.MULTILINE)  # \b not $: tolerate trailing comments
    return bool(match and match.group(1) == "true")


def main() -> None:
    OG_DIR.mkdir(parents=True, exist_ok=True)

    jobs: list[tuple[str, str | None]] = [("default", None)]

    for content_dir in CONTENT_DIRS:
        if not content_dir.exists():
            continue
        # rglob + relative slug: content collections load **/*.md, and the
        # [...slug] routes reference /og/<entry.id>.png, where an entry in a
        # subfolder has an id like "series/post". Mirror that here.
        for md_file in sorted(content_dir.rglob("*.md")):
            text = md_file.read_text(encoding="utf-8")
            if is_draft(text):
                print(f"skip (draft): {md_file.relative_to(ROOT)}")
                continue
            title = slugify_frontmatter_title(text)
            if not title:
                print(f"skip (no title found): {md_file.relative_to(ROOT)}")
                continue
            slug = md_file.relative_to(content_dir).with_suffix("").as_posix()
            jobs.append((slug, title))

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": WIDTH, "height": HEIGHT})
        for slug, title in jobs:
            html = build_html(title)
            page.set_content(html, wait_until="load")
            page.wait_for_timeout(50)  # let @font-face settle
            out_path = OG_DIR / f"{slug}.png"
            out_path.parent.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(out_path))
            print(f"wrote {out_path.relative_to(ROOT)}")
        browser.close()


if __name__ == "__main__":
    sys.exit(main())
