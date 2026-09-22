#!/usr/bin/env python3
"""Gera relatorio-auditoria-seguranca.pdf a partir de audit_data.json.

Uso:
    cd docs/security-audit
    python3 -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    python generate_report.py

Nao depende de nada fora desta pasta (dados, script e ambiente virtual
ficam isolados em docs/security-audit/).
"""

from __future__ import annotations

import html
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "audit_data.json"
OUTPUT_PATH = BASE_DIR / "relatorio-auditoria-seguranca.pdf"
CHARTS_DIR = BASE_DIR / "_charts"
CHARTS_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Paleta hexadecimal canonica do relatorio de auditoria de seguranca.
# Reutilizada tambem em .claudecode/skills/audit-security.md — nao alterar
# sem atualizar os dois lugares.
# ---------------------------------------------------------------------------
PALETTE = {
    "ink": "#0F172A",
    "muted": "#475569",
    "line": "#CBD5E1",
    "paper": "#FFFFFF",
    "panel": "#F1F5F9",
    "brand": "#22C55E",
    "strength": "#15803D",
    "severity": {
        "CRITICAL": "#B91C1C",
        "HIGH": "#EA580C",
        "MEDIUM": "#D97706",
        "LOW": "#2563EB",
    },
    "category": {
        "Isolamento": "#0E7490",
        "Permissões no Frontend vs Backend": "#6D28D9",
        "IDOR": "#BE185D",
        "Chaves Expostas": "#92400E",
        "XSS": "#3730A3",
    },
}

SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
CATEGORY_ORDER = [
    "Isolamento",
    "Permissões no Frontend vs Backend",
    "IDOR",
    "Chaves Expostas",
    "XSS",
]


def hexc(h: str) -> colors.Color:
    return colors.HexColor(h)


def esc(text) -> str:
    """Escapa texto vindo do JSON para uso seguro dentro de reportlab.Paragraph."""
    return html.escape(str(text), quote=False)


def esc_br(text) -> str:
    """Como esc(), mas preserva quebras de linha como <br/>."""
    return esc(text).replace("\n", "<br/>")


# ---------------------------------------------------------------------------
# Dados
# ---------------------------------------------------------------------------
def load_data() -> dict:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Graficos (matplotlib -> PNG -> embutido no PDF via reportlab.Image)
# ---------------------------------------------------------------------------
def make_severity_donut(findings: list[dict], out_path: Path) -> None:
    counts = {s: 0 for s in SEVERITY_ORDER}
    for f in findings:
        counts[f["severity"]] += 1

    labels = [s for s in SEVERITY_ORDER if counts[s] > 0]
    sizes = [counts[s] for s in labels]
    slice_colors = [PALETTE["severity"][s] for s in labels]

    fig, ax = plt.subplots(figsize=(4.8, 4.2), dpi=200)
    wedges, _ = ax.pie(
        sizes,
        colors=slice_colors,
        startangle=90,
        counterclock=False,
        wedgeprops=dict(width=0.42, edgecolor=PALETTE["paper"], linewidth=2.5),
    )
    ax.set_aspect("equal")

    total = sum(sizes)
    ax.text(
        0, 0.10, str(total), ha="center", va="center",
        fontsize=32, fontweight="bold", color=PALETTE["ink"],
    )
    ax.text(
        0, -0.20, "achados", ha="center", va="center",
        fontsize=11, color=PALETTE["muted"],
    )

    pt_labels = {"CRITICAL": "Crítica", "HIGH": "Alta", "MEDIUM": "Média", "LOW": "Baixa"}
    legend_labels = [f"{pt_labels[s]}  ({counts[s]})" for s in labels]
    leg = ax.legend(
        wedges, legend_labels,
        loc="center left", bbox_to_anchor=(1.05, 0.5),
        frameon=False, fontsize=11.5,
    )
    for text in leg.get_texts():
        text.set_color(PALETTE["ink"])

    fig.subplots_adjust(left=0.02, right=0.62, top=0.96, bottom=0.04)
    fig.savefig(out_path, transparent=True)
    plt.close(fig)


def make_category_bars(findings: list[dict], out_path: Path) -> None:
    counts = {c: 0 for c in CATEGORY_ORDER}
    for f in findings:
        counts[f["category"]] += 1

    labels = CATEGORY_ORDER
    values = [counts[c] for c in labels]
    bar_colors = [PALETTE["category"][c] for c in labels]

    fig, ax = plt.subplots(figsize=(7.6, 3.8), dpi=200)
    y_pos = range(len(labels))
    bars = ax.barh(y_pos, values, color=bar_colors, height=0.56, zorder=3)
    ax.set_yticks(list(y_pos))
    ax.set_yticklabels(labels, fontsize=10.5, color=PALETTE["ink"])
    ax.invert_yaxis()

    max_val = max(values) if values else 1
    ax.set_xlim(0, max_val + 1)
    ax.set_xticks(range(0, max_val + 2))
    ax.set_xlabel("Nº de achados", fontsize=9.5, color=PALETTE["muted"])

    for spine in ("top", "right", "left"):
        ax.spines[spine].set_visible(False)
    ax.spines["bottom"].set_color(PALETTE["line"])
    ax.tick_params(axis="x", colors=PALETTE["muted"], labelsize=9)
    ax.tick_params(axis="y", length=0)
    ax.grid(axis="x", color=PALETTE["line"], linewidth=0.7, alpha=0.7, zorder=0)
    ax.set_axisbelow(True)

    for bar, val in zip(bars, values):
        ax.text(
            bar.get_width() + 0.07, bar.get_y() + bar.get_height() / 2, str(val),
            va="center", ha="left", fontsize=10, color=PALETTE["ink"], fontweight="bold",
        )

    fig.tight_layout()
    fig.savefig(out_path, transparent=True)
    plt.close(fig)


# ---------------------------------------------------------------------------
# Estilos
# ---------------------------------------------------------------------------
def build_styles() -> dict:
    base = getSampleStyleSheet()
    styles = {}

    styles["CoverTitle"] = ParagraphStyle(
        "CoverTitle", parent=base["Title"], fontName="Helvetica-Bold",
        fontSize=30, leading=34, textColor=colors.white, alignment=TA_LEFT,
    )
    styles["CoverSubtitle"] = ParagraphStyle(
        "CoverSubtitle", parent=base["Normal"], fontName="Helvetica",
        fontSize=15, leading=20, textColor=hexc(PALETTE["brand"]), alignment=TA_LEFT,
    )
    styles["CoverMeta"] = ParagraphStyle(
        "CoverMeta", parent=base["Normal"], fontName="Helvetica",
        fontSize=10.5, leading=16, textColor=colors.HexColor("#CBD5E1"), alignment=TA_LEFT,
    )
    styles["H1"] = ParagraphStyle(
        "H1", parent=base["Heading1"], fontName="Helvetica-Bold",
        fontSize=17, leading=21, textColor=hexc(PALETTE["ink"]),
        spaceBefore=6, spaceAfter=10,
    )
    styles["H2"] = ParagraphStyle(
        "H2", parent=base["Heading2"], fontName="Helvetica-Bold",
        fontSize=12.5, leading=16, textColor=hexc(PALETTE["ink"]),
        spaceBefore=14, spaceAfter=6,
    )
    styles["Body"] = ParagraphStyle(
        "Body", parent=base["Normal"], fontName="Helvetica",
        fontSize=9.5, leading=13.5, textColor=hexc(PALETTE["ink"]), alignment=TA_JUSTIFY,
    )
    styles["BodySmall"] = ParagraphStyle(
        "BodySmall", parent=base["Normal"], fontName="Helvetica",
        fontSize=8.6, leading=12.2, textColor=hexc(PALETTE["ink"]), alignment=TA_JUSTIFY,
    )
    styles["Muted"] = ParagraphStyle(
        "Muted", parent=base["Normal"], fontName="Helvetica",
        fontSize=8.6, leading=12, textColor=hexc(PALETTE["muted"]),
    )
    styles["Label"] = ParagraphStyle(
        "Label", parent=base["Normal"], fontName="Helvetica-Bold",
        fontSize=8.8, leading=12, textColor=hexc(PALETTE["ink"]),
    )
    styles["Mono"] = ParagraphStyle(
        "Mono", parent=base["Normal"], fontName="Courier",
        fontSize=7.6, leading=10.6, textColor=hexc(PALETTE["ink"]),
        backColor=hexc(PALETTE["panel"]), borderPadding=6,
    )
    styles["TableCell"] = ParagraphStyle(
        "TableCell", parent=base["Normal"], fontName="Helvetica",
        fontSize=8, leading=10.8, textColor=hexc(PALETTE["ink"]),
    )
    styles["TableCellMono"] = ParagraphStyle(
        "TableCellMono", parent=base["Normal"], fontName="Courier",
        fontSize=7.3, leading=9.6, textColor=hexc(PALETTE["ink"]),
    )
    styles["TableHeader"] = ParagraphStyle(
        "TableHeader", parent=base["Normal"], fontName="Helvetica-Bold",
        fontSize=8, leading=10, textColor=colors.white,
    )
    styles["FindingTitle"] = ParagraphStyle(
        "FindingTitle", parent=base["Heading3"], fontName="Helvetica-Bold",
        fontSize=11, leading=14, textColor=hexc(PALETTE["ink"]), spaceAfter=4,
    )
    return styles


def severity_badge(sev: str, styles: dict) -> Table:
    pt = {"CRITICAL": "CRÍTICA", "HIGH": "ALTA", "MEDIUM": "MÉDIA", "LOW": "BAIXA"}[sev]
    color = PALETTE["severity"][sev]
    t = Table([[pt]], colWidths=[2.1 * cm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), hexc(color)),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return t


# ---------------------------------------------------------------------------
# Paginas: capa / cabecalho-rodape
# ---------------------------------------------------------------------------
def draw_cover(c, doc, data: dict) -> None:
    width, height = A4
    c.saveState()
    c.setFillColor(hexc(PALETTE["ink"]))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    c.setFillColor(hexc(PALETTE["brand"]))
    c.rect(0, height - 0.5 * cm, width, 0.5 * cm, fill=1, stroke=0)
    c.rect(0, 0, width, 0.5 * cm, fill=1, stroke=0)

    c.setFillColor(colors.HexColor("#1E293B"))
    c.rect(0, height - 9.4 * cm, width, 8.9 * cm, fill=1, stroke=0)

    meta = data["meta"]
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(hexc(PALETTE["brand"]))
    c.drawString(2.4 * cm, height - 3.0 * cm, "RELATÓRIO DE AUDITORIA DE SEGURANÇA")

    c.setFont("Helvetica-Bold", 30)
    c.setFillColor(colors.white)
    c.drawString(2.4 * cm, height - 4.3 * cm, meta["project"])

    c.setFont("Helvetica", 14)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawString(2.4 * cm, height - 5.2 * cm, "Isolamento · Permissões Frontend vs Backend · IDOR")
    c.drawString(2.4 * cm, height - 5.75 * cm, "Chaves Expostas · XSS")

    c.setStrokeColor(hexc(PALETTE["brand"]))
    c.setLineWidth(1)
    c.line(2.4 * cm, height - 6.3 * cm, width - 2.4 * cm, height - 6.3 * cm)

    findings = data["findings"]
    counts = {s: 0 for s in SEVERITY_ORDER}
    for f in findings:
        counts[f["severity"]] += 1

    c.setFont("Helvetica", 9.5)
    c.setFillColor(colors.HexColor("#94A3B8"))
    lines = [
        f"Repositório: {meta['repo']}  ·  Branch: {meta['branch']}",
        f"Data da auditoria: {meta['audit_date']}  ·  Auditor: {meta['auditor']}",
    ]
    y = height - 7.15 * cm
    for line in lines:
        c.drawString(2.4 * cm, y, line)
        y -= 0.55 * cm

    # ------------------------------------------------------------------
    # Cartoes de severidade (preenche o espaco abaixo do painel do titulo,
    # antecipando as cores exatas usadas no donut da secao 2).
    # ------------------------------------------------------------------
    pt_sev = {"CRITICAL": "CRÍTICA", "HIGH": "ALTA", "MEDIUM": "MÉDIA", "LOW": "BAIXA"}
    card_y_top = height - 11.6 * cm
    card_h = 3.0 * cm
    gap = 0.5 * cm
    n = len(SEVERITY_ORDER)
    usable_w = width - 2 * 2.4 * cm
    card_w = (usable_w - gap * (n - 1)) / n

    c.setFont("Helvetica", 9.5)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawString(2.4 * cm, card_y_top + 0.35 * cm, "ACHADOS POR SEVERIDADE")

    x = 2.4 * cm
    for sev in SEVERITY_ORDER:
        color = hexc(PALETTE["severity"][sev])
        c.setFillColor(colors.HexColor("#1E293B"))
        c.roundRect(x, card_y_top - card_h, card_w, card_h, 4, fill=1, stroke=0)
        c.setFillColor(color)
        c.roundRect(x, card_y_top - 0.14 * cm, card_w, 0.14 * cm, 2, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 22)
        c.setFillColor(colors.white)
        c.drawCentredString(x + card_w / 2, card_y_top - card_h + 1.55 * cm, str(counts[sev]))
        c.setFont("Helvetica-Bold", 8.2)
        c.setFillColor(color)
        c.drawCentredString(x + card_w / 2, card_y_top - card_h + 0.6 * cm, pt_sev[sev])
        x += card_w + gap

    # ------------------------------------------------------------------
    # Chips de categoria (previa das cores usadas no grafico de barras).
    # ------------------------------------------------------------------
    chips_y = card_y_top - card_h - 1.5 * cm
    c.setFont("Helvetica", 9.5)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawString(2.4 * cm, chips_y + 0.55 * cm, "CATEGORIAS AUDITADAS")

    chip_font_size = 8.6
    c.setFont("Helvetica-Bold", chip_font_size)
    chip_h = 0.75 * cm
    chip_pad = 0.35 * cm
    chip_gap = 0.3 * cm
    cx = 2.4 * cm
    cy = chips_y - chip_h
    max_x = width - 2.4 * cm
    for cat in CATEGORY_ORDER:
        label = cat.upper()
        text_w = c.stringWidth(label, "Helvetica-Bold", chip_font_size)
        chip_w = text_w + 2 * chip_pad
        if cx + chip_w > max_x:
            cx = 2.4 * cm
            cy -= chip_h + chip_gap
        c.setFillColor(hexc(PALETTE["category"][cat]))
        c.roundRect(cx, cy, chip_w, chip_h, chip_h / 2, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.drawCentredString(cx + chip_w / 2, cy + chip_h / 2 - 3, label)
        cx += chip_w + chip_gap

    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor("#64748B"))
    verified_y = cy - 1.0 * cm
    c.drawString(
        2.4 * cm, verified_y,
        f"{len(findings)} achados e {len(data['strengths'])} pontos fortes verificados linha a linha no código-fonte atual.",
    )

    c.setFont("Helvetica-Oblique", 8.5)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(2.4 * cm, 2.0 * cm, "Documento confidencial — uso interno da equipe de desenvolvimento.")
    c.drawString(2.4 * cm, 1.5 * cm, meta["scope"])
    c.restoreState()


def draw_header_footer(c, doc) -> None:
    width, height = A4
    c.saveState()
    c.setFont("Helvetica", 8)
    c.setFillColor(hexc(PALETTE["muted"]))
    c.drawString(2 * cm, height - 1.25 * cm, "Chronos System — Auditoria de Segurança")
    c.drawRightString(width - 2 * cm, height - 1.25 * cm, "2026-08-29")
    c.setStrokeColor(hexc(PALETTE["line"]))
    c.setLineWidth(0.6)
    c.line(2 * cm, height - 1.4 * cm, width - 2 * cm, height - 1.4 * cm)

    c.setFont("Helvetica", 8)
    c.setFillColor(hexc(PALETTE["muted"]))
    c.drawString(2 * cm, 1.1 * cm, "Confidencial — uso interno")
    c.drawRightString(width - 2 * cm, 1.1 * cm, f"Página {doc.page - 1}")
    c.restoreState()


def on_page(canvas, doc, data):
    if doc.page == 1:
        draw_cover(canvas, doc, data)
    else:
        draw_header_footer(canvas, doc)


# ---------------------------------------------------------------------------
# Secoes de conteudo
# ---------------------------------------------------------------------------
def section_methodology(data: dict, styles: dict) -> list:
    flow = [Paragraph("1. Metodologia e Reconhecimento de Stack", styles["H1"])]
    flow.append(
        Paragraph(
            "Antes de procurar qualquer vulnerabilidade, o stack tecnológico do repositório foi "
            "mapeado a partir dos arquivos de configuração reais (package.json, prisma/schema.prisma, "
            "next.config.mjs, .env.example) — não assumido a partir de documentação. A tabela abaixo "
            "resume o que foi encontrado:",
            styles["Body"],
        )
    )
    flow.append(Spacer(1, 8))

    stack_rows = [[Paragraph("Camada", styles["TableHeader"]), Paragraph("Tecnologia", styles["TableHeader"])]]
    for item in data["stack"]:
        stack_rows.append(
            [Paragraph(esc(item["layer"]), styles["TableCell"]), Paragraph(esc(item["tech"]), styles["TableCell"])]
        )
    stack_table = Table(stack_rows, colWidths=[4.5 * cm, 12.3 * cm], repeatRows=1)
    stack_table.setStyle(_table_style_default())
    flow.append(stack_table)
    flow.append(Spacer(1, 14))

    flow.append(
        Paragraph(
            "Com o stack mapeado, cada uma das 5 categorias solicitadas foi reinterpretada "
            "especificamente para este projeto (monolito Next.js App Router, sem Supabase, com "
            "terminais físicos de kiosk), em vez de aplicar uma definição genérica:",
            styles["Body"],
        )
    )
    flow.append(Spacer(1, 8))
    for cat in data["category_definitions"]:
        flow.append(Paragraph(esc(cat["category"]), styles["H2"]))
        flow.append(Paragraph(esc(cat["definition"]), styles["Body"]))

    if data.get("notes"):
        flow.append(Spacer(1, 10))
        flow.append(Paragraph("Nota metodológica", styles["H2"]))
        for note in data["notes"]:
            flow.append(Paragraph(esc(note), styles["BodySmall"]))

    return flow


def section_executive_summary(data: dict, styles: dict) -> list:
    donut_path = CHARTS_DIR / "severity_donut.png"
    bars_path = CHARTS_DIR / "category_bars.png"
    make_severity_donut(data["findings"], donut_path)
    make_category_bars(data["findings"], bars_path)

    flow = [PageBreak(), Paragraph("2. Resumo Executivo", styles["H1"])]

    findings = data["findings"]
    counts = {s: 0 for s in SEVERITY_ORDER}
    for f in findings:
        counts[f["severity"]] += 1

    flow.append(
        Paragraph(
            f"A varredura cobriu o repositório inteiro e resultou em <b>{len(findings)} achados</b> "
            f"nas 5 categorias solicitadas, além de <b>{len(data['strengths'])} pontos fortes</b> "
            "verificados diretamente no código (não apenas assumidos a partir de documentação). "
            f"O achado mais severo (<b>F1, crítico</b>) permite que qualquer pessoa capaz de criar uma "
            "conta se auto-promova a administrador do sistema.",
            styles["Body"],
        )
    )
    flow.append(Spacer(1, 10))

    donut_img = Image(str(donut_path), width=9.6 * cm, height=8.4 * cm)
    bars_img = Image(str(bars_path), width=16.4 * cm, height=8.2 * cm)

    flow.append(Paragraph("Distribuição por severidade", styles["H2"]))
    flow.append(donut_img)
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("Achados por categoria", styles["H2"]))
    flow.append(bars_img)

    return flow


def section_strengths(data: dict, styles: dict) -> list:
    flow = [PageBreak(), Paragraph("3. Pontos Fortes Verificados", styles["H1"])]
    flow.append(
        Paragraph(
            "Práticas de segurança corretas identificadas e confirmadas linha a linha no código-fonte "
            "atual (não em documentação, que pode estar desatualizada).",
            styles["Body"],
        )
    )
    flow.append(Spacer(1, 8))

    rows = [
        [
            Paragraph("ID", styles["TableHeader"]),
            Paragraph("Categoria", styles["TableHeader"]),
            Paragraph("Arquivo:Linha", styles["TableHeader"]),
            Paragraph("Descrição", styles["TableHeader"]),
        ]
    ]
    for s in data["strengths"]:
        rows.append(
            [
                Paragraph(esc(s["id"]), styles["TableCell"]),
                Paragraph(esc(s["category"]), styles["TableCell"]),
                Paragraph(esc(f"{s['file']}:{s['line']}"), styles["TableCellMono"]),
                Paragraph(f"<b>{esc(s['title'])}.</b> {esc(s['description'])}", styles["TableCell"]),
            ]
        )
    table = Table(rows, colWidths=[1.2 * cm, 3.1 * cm, 4.3 * cm, 8.2 * cm], repeatRows=1)
    style_cmds = _table_style_default(header_color=PALETTE["strength"])
    table.setStyle(style_cmds)
    flow.append(table)
    return flow


def section_findings(data: dict, styles: dict) -> list:
    flow = [PageBreak(), Paragraph("4. Achados Detalhados", styles["H1"])]
    flow.append(
        Paragraph(
            "Cada achado foi localizado e verificado diretamente no código-fonte (arquivo e linha "
            "citados), com severidade justificada pelo impacto e pela facilidade de exploração.",
            styles["Body"],
        )
    )
    flow.append(Spacer(1, 6))

    for f in data["findings"]:
        block = []
        header_row = Table(
            [[Paragraph(f"{esc(f['id'])} — {esc(f['title'])}", styles["FindingTitle"]), severity_badge(f["severity"], styles)]],
            colWidths=[13.6 * cm, 3.1 * cm],
        )
        header_row.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ]
            )
        )
        block.append(header_row)
        block.append(Spacer(1, 3))

        cats = f["category"] + (
            f" (relacionado: {', '.join(f['secondary_categories'])})" if f.get("secondary_categories") else ""
        )
        block.append(Paragraph(f"<b>Categoria:</b> {esc(cats)}", styles["BodySmall"]))

        file_lines = "; ".join(f"{item['file']}:{item['line']}" for item in f["files"])
        block.append(Paragraph(f"<b>Local:</b> {esc(file_lines)}", styles["TableCellMono"]))
        block.append(Spacer(1, 4))

        block.append(Paragraph(f"<b>Descrição:</b> {esc(f['description'])}", styles["Body"]))
        block.append(Spacer(1, 3))
        block.append(Paragraph(f"<b>Evidência:</b> {esc(f['evidence'])}", styles["Mono"]))
        block.append(Spacer(1, 3))
        block.append(Paragraph(f"<b>Impacto:</b> {esc(f['impact'])}", styles["Body"]))
        block.append(Spacer(1, 3))
        block.append(Paragraph(f"<b>Recomendação:</b> {esc(f['recommendation'])}", styles["Body"]))
        block.append(Spacer(1, 14))
        block.append(HRFlowable(width="100%", thickness=0.6, color=hexc(PALETTE["line"])))
        block.append(Spacer(1, 10))

        flow.append(KeepTogether(block))

    return flow


def section_recommendations(data: dict, styles: dict) -> list:
    flow = [PageBreak(), Paragraph("5. Recomendações Priorizadas", styles["H1"])]
    flow.append(
        Paragraph(
            "Ordem sugerida de correção, do maior para o menor risco combinado "
            "(severidade × facilidade de exploração):",
            styles["Body"],
        )
    )
    flow.append(Spacer(1, 8))

    rows = [
        [
            Paragraph("#", styles["TableHeader"]),
            Paragraph("Ação", styles["TableHeader"]),
            Paragraph("Achados", styles["TableHeader"]),
        ]
    ]
    for rec in data["recommendations_prioritized"]:
        rows.append(
            [
                Paragraph(str(rec["priority"]), styles["TableCell"]),
                Paragraph(esc(rec["action"]), styles["TableCell"]),
                Paragraph(esc(", ".join(rec["related"])), styles["TableCellMono"]),
            ]
        )
    table = Table(rows, colWidths=[1.0 * cm, 13.5 * cm, 2.3 * cm], repeatRows=1)
    table.setStyle(_table_style_default())
    flow.append(table)
    return flow


ISSUE_TEMPLATE = """## {title}

**Labels:** {labels}
**Severidade:** {severity}
**Categoria:** {category}

### Impacto
{impact}

### Evidência
```
{evidence}
```

Arquivos afetados:
{files}

### Recomendação
{recommendation}

### Checklist de aceite
- [ ] Correção implementada conforme a recomendação acima
- [ ] Teste automatizado (ou manual documentado) cobrindo o cenário de exploração descrito
- [ ] Revisão de código por outra pessoa da equipe
- [ ] Verificado em ambiente de staging/preview antes do merge
- [ ] AuditLog / log de segurança emitido para esta classe de evento (quando aplicável)
"""

SEVERITY_LABEL_MAP = {
    "CRITICAL": "severity:critical",
    "HIGH": "severity:high",
    "MEDIUM": "severity:medium",
    "LOW": "severity:low",
}
CATEGORY_LABEL_MAP = {
    "Isolamento": "security:isolation",
    "Permissões no Frontend vs Backend": "security:authz",
    "IDOR": "security:idor",
    "Chaves Expostas": "security:secrets",
    "XSS": "security:xss",
}


def render_issue_markdown(f: dict) -> str:
    labels = ["security", SEVERITY_LABEL_MAP[f["severity"]], CATEGORY_LABEL_MAP[f["category"]]]
    files_md = "\n".join(f"- `{item['file']}:{item['line']}`" for item in f["files"])
    return ISSUE_TEMPLATE.format(
        title=f"[{f['id']}] {f['title']}",
        labels=", ".join(labels),
        severity=f["severity"],
        category=f["category"],
        impact=f["impact"],
        evidence=f["evidence"],
        files=files_md,
        recommendation=f["recommendation"],
    )


def section_issue_templates(data: dict, styles: dict) -> list:
    flow = [PageBreak(), Paragraph("Anexo — Templates de Issues (Markdown)", styles["H1"])]
    flow.append(
        Paragraph(
            "Um template pronto para copiar em Novo Issue no GitHub para cada achado de severidade "
            "MÉDIA ou superior. Formatado em Markdown (títulos, checklist, bloco de código).",
            styles["Body"],
        )
    )
    flow.append(Spacer(1, 8))

    relevant = [f for f in data["findings"] if f["severity"] in ("CRITICAL", "HIGH", "MEDIUM")]
    for f in relevant:
        md = render_issue_markdown(f)
        flow.append(Paragraph(f"Issue para {esc(f['id'])}", styles["H2"]))
        flow.append(Paragraph(esc_br(md), styles["Mono"]))
        flow.append(Spacer(1, 10))

    return flow


def _table_style_default(header_color: str | None = None) -> TableStyle:
    hcolor = header_color or PALETTE["ink"]
    return TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), hexc(hcolor)),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, hexc(PALETTE["panel"])]),
            ("GRID", (0, 0), (-1, -1), 0.5, hexc(PALETTE["line"])),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    data = load_data()
    styles = build_styles()

    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title=f"Auditoria de Segurança — {data['meta']['project']}",
        author=data["meta"]["auditor"],
    )

    story: list = [Spacer(1, 1)]  # pagina 1 = capa (conteudo desenhado em on_page)
    story.append(PageBreak())
    story += section_methodology(data, styles)
    story += section_executive_summary(data, styles)
    story += section_strengths(data, styles)
    story += section_findings(data, styles)
    story += section_recommendations(data, styles)
    story += section_issue_templates(data, styles)

    doc.build(
        story,
        onFirstPage=lambda c, d: on_page(c, d, data),
        onLaterPages=lambda c, d: on_page(c, d, data),
    )

    print(f"OK: {OUTPUT_PATH} gerado ({OUTPUT_PATH.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
