#!/usr/bin/env python3
"""
Translate PT article markdown to en, es, ja, gom (Konkani), sv.
Preserves fenced code blocks and mermaid diagrams (no translation inside).
Chunks prose for Google Translate limits (~4500 chars).
"""
from __future__ import annotations

import re
import sys
import time
from pathlib import Path

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("pip install --user deep-translator", file=sys.stderr)
    raise

ROOT = Path(__file__).resolve().parents[1]
PT_MD = ROOT / "artigos" / "markdown"

TARGETS = {
    "en": "en",
    "es": "es",
    "ja": "ja",
    "kok": "gom",  # Konkani (Goa) in Google Translate
    "sv": "sv",
}

# PT source file -> output basename (ASCII, same in every locale folder)
ARTICLES: list[tuple[str, str]] = [
    ("OTP e Elixir são a escolha para aplicações críticas.md", "otp-elixir-escolha-aplicacoes-criticas.md"),
    (
        "Construindo Sistemas Resilientes: O Valor de Negócio por trás das Arquiteturas Orientadas a Eventos e CQRS.md",
        "construindo-sistemas-resilientes-eventos-cqrs.md",
    ),
    (
        "Além do Hype: Como integrar Arquiteturas Cognitivas e LLMs ao seu Produto.md",
        "alem-do-hype-arquiteturas-cognitivas-llms.md",
    ),
    ("metrica-invisivel-saude-bem-estar-desenvolvedor-qualidade-codigo.md", "metrica-invisivel-saude-bem-estar-desenvolvedor-qualidade-codigo.md"),
]

MAX_CHUNK = 4500
SLEEP_SEC = 0.35


def split_fenced(text: str) -> list[tuple[str, str]]:
    """Return list of ('text', content) or ('code', content)."""
    parts: list[tuple[str, str]] = []
    fence = re.compile(r"^(```[\w-]*\n.*?^```\s*$)", re.MULTILINE | re.DOTALL)
    pos = 0
    for m in fence.finditer(text):
        if m.start() > pos:
            parts.append(("text", text[pos : m.start()]))
        parts.append(("code", m.group(1)))
        pos = m.end()
    if pos < len(text):
        parts.append(("text", text[pos:]))
    if not parts:
        parts.append(("text", text))
    return parts


def chunk_text(text: str) -> list[str]:
    """Split long prose into chunks under MAX_CHUNK (by paragraphs, then by size)."""
    if len(text) <= MAX_CHUNK:
        return [text] if text else []
    chunks: list[str] = []
    buf: list[str] = []
    size = 0
    for para in text.split("\n\n"):
        plen = len(para) + 2
        if plen > MAX_CHUNK:
            for i in range(0, len(para), MAX_CHUNK):
                chunks.append(para[i : i + MAX_CHUNK])
            continue
        if size + plen > MAX_CHUNK and buf:
            chunks.append("\n\n".join(buf))
            buf = [para]
            size = plen
        else:
            buf.append(para)
            size += plen
    if buf:
        chunks.append("\n\n".join(buf))
    return chunks


def translate_text(translator: GoogleTranslator, text: str) -> str:
    if not text.strip():
        return text
    out: list[str] = []
    for chunk in chunk_text(text):
        for attempt in range(3):
            try:
                out.append(translator.translate(chunk))
                break
            except Exception:
                if attempt == 2:
                    raise
                time.sleep(2.0 * (attempt + 1))
        time.sleep(SLEEP_SEC)
    return "\n\n".join(out)


def translate_file(pt_path: Path, out_dir: Path, out_name: str, lang_key: str, google_code: str) -> None:
    raw = pt_path.read_text(encoding="utf-8")
    translator = GoogleTranslator(source="pt", target=google_code)
    segments = split_fenced(raw)
    built: list[str] = []
    for kind, seg in segments:
        if kind == "code":
            built.append(seg)
        else:
            built.append(translate_text(translator, seg))
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / out_name
    out_path.write_text("".join(built), encoding="utf-8")
    print(f"Wrote {out_path}", flush=True)


def main() -> None:
    for pt_name, out_name in ARTICLES:
        pt_path = PT_MD / pt_name
        if not pt_path.exists():
            print(f"Missing source: {pt_path}", file=sys.stderr)
            sys.exit(1)
        for folder, google_code in TARGETS.items():
            out_dir = ROOT / folder / "artigos" / "markdown"
            translate_file(pt_path, out_dir, out_name, folder, google_code)


if __name__ == "__main__":
    main()
