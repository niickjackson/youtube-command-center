import jsPDF from 'jspdf';
import type { Script } from './types';

const COLORS = {
  bg: '#111111',
  cyan: '#00D4FF',
  cyanSoft: '#80DEEA',
  gold: '#FFD54F',
  white: '#FFFFFF',
  gray: '#888888',
  darkGray: '#666666',
  ruleGray: '#333333',
};

const PAGE = {
  width: 612, // US Letter in points (8.5 * 72)
  height: 792, // 11 * 72
  marginX: 43.2, // 0.6 inches
  marginTop: 43.2,
  marginBottom: 36, // 0.5 inches
};

const CONTENT_WIDTH = PAGE.width - PAGE.marginX * 2;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function setColor(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setTextColor(r, g, b);
}

function drawBackground(doc: jsPDF) {
  const [r, g, b] = hexToRgb(COLORS.bg);
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, PAGE.width, PAGE.height, 'F');
}

function drawFooter(doc: jsPDF, title: string, pageNum: number) {
  setColor(doc, COLORS.gray);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(title, PAGE.marginX, PAGE.height - 20);
  doc.text(`Page ${pageNum}`, PAGE.width - PAGE.marginX, PAGE.height - 20, { align: 'right' });
}

function drawRule(doc: jsPDF, y: number, color: string, thickness: number = 1) {
  const [r, g, b] = hexToRgb(color);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(thickness);
  doc.line(PAGE.marginX, y, PAGE.width - PAGE.marginX, y);
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

export function generatePDF(script: Script): Buffer {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
    putOnlyUsedFonts: true,
  });

  let pageNum = 1;
  let y = PAGE.marginTop;

  // Helper to check if we need a new page
  function ensureSpace(needed: number) {
    if (y + needed > PAGE.height - PAGE.marginBottom - 20) {
      drawFooter(doc, script.title, pageNum);
      doc.addPage();
      pageNum++;
      drawBackground(doc);
      y = PAGE.marginTop;
    }
  }

  // =====================
  // COVER PAGE
  // =====================
  drawBackground(doc);
  y = PAGE.marginTop + 40;

  // Title
  setColor(doc, COLORS.cyan);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const titleLines = wrapText(doc, script.title.toUpperCase(), CONTENT_WIDTH);
  for (const line of titleLines) {
    doc.text(line, PAGE.marginX, y);
    y += 28;
  }

  // Cyan rule
  y += 8;
  drawRule(doc, y, COLORS.cyan, 2);
  y += 24;

  // TITLE OPTIONS
  if (script.titleOptions.length > 0) {
    setColor(doc, COLORS.white);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TITLE OPTIONS', PAGE.marginX, y);
    y += 20;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    for (let i = 0; i < script.titleOptions.length; i++) {
      const opt = script.titleOptions[i];
      ensureSpace(20);
      setColor(doc, COLORS.white);
      doc.text(`${i + 1}. ${opt.title}`, PAGE.marginX + 10, y);

      setColor(doc, COLORS.gray);
      doc.setFontSize(9);
      doc.text(`(${opt.charCount} chars)`, PAGE.width - PAGE.marginX, y, { align: 'right' });
      doc.setFontSize(11);
      y += 18;
    }

    // Pattern note
    if (script.titleOptions[0]?.pattern) {
      y += 4;
      setColor(doc, COLORS.gray);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(`Pattern: ${script.titleOptions[0].pattern}`, PAGE.marginX + 10, y);
      y += 20;
    }
  }

  // THUMBNAIL DIRECTION
  const td = script.thumbnailDirection;
  if (td && (td.text || td.visual)) {
    y += 8;
    setColor(doc, COLORS.gold);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('THUMBNAIL DIRECTION', PAGE.marginX, y);
    y += 20;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor(doc, COLORS.white);

    const tdFields = [
      { label: 'Text', value: td.text },
      { label: 'Visual', value: td.visual },
      { label: 'Optional', value: td.optional },
      { label: 'Remember', value: td.remember },
    ];

    for (const field of tdFields) {
      if (field.value) {
        ensureSpace(20);
        setColor(doc, COLORS.gray);
        doc.text(`• ${field.label}: `, PAGE.marginX + 10, y);
        const labelWidth = doc.getTextWidth(`• ${field.label}: `);
        setColor(doc, COLORS.white);
        const wrapped = wrapText(doc, field.value, CONTENT_WIDTH - 20 - labelWidth);
        doc.text(wrapped[0], PAGE.marginX + 10 + labelWidth, y);
        y += 16;
        for (let j = 1; j < wrapped.length; j++) {
          ensureSpace(16);
          doc.text(wrapped[j], PAGE.marginX + 20, y);
          y += 16;
        }
      }
    }
  }

  // Gray separator
  y += 16;
  drawRule(doc, y, COLORS.ruleGray, 0.5);
  y += 24;

  // Stats line
  setColor(doc, COLORS.gray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const statsText = `${script.wordCount.toLocaleString()} words  •  ${script.estimatedRuntime}  •  ${script.chapterCount} chapters`;
  doc.text(statsText, PAGE.width / 2, y, { align: 'center' });

  drawFooter(doc, script.title, pageNum);

  // =====================
  // SCRIPT PAGES
  // =====================
  for (const chapter of script.chapters) {
    // Each chapter starts on a new page
    doc.addPage();
    pageNum++;
    drawBackground(doc);
    y = PAGE.marginTop;

    // Chapter heading
    setColor(doc, COLORS.cyan);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const chapterTitle = chapter.timestamp
      ? `${chapter.name}  [${chapter.timestamp}]`
      : chapter.name;
    const chapterLines = wrapText(doc, chapterTitle, CONTENT_WIDTH);
    for (const line of chapterLines) {
      doc.text(line, PAGE.marginX, y);
      y += 22;
    }

    // Cyan rule under chapter heading
    y += 2;
    drawRule(doc, y, COLORS.cyan, 1);
    y += 18;

    for (const section of chapter.sections) {
      // Delivery marker
      ensureSpace(40);
      if (section.type === 'voice_over') {
        setColor(doc, COLORS.cyanSoft);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('\u25B6 VOICE-OVER', PAGE.marginX, y);
      } else {
        setColor(doc, COLORS.gold);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('\u25B6 ON-CAMERA', PAGE.marginX, y);
      }
      y += 20;

      // Script text - 14pt, leading 22pt
      setColor(doc, COLORS.white);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');

      // Split by paragraphs
      const paragraphs = section.text.split('\n\n').filter(p => p.trim());
      for (const para of paragraphs) {
        const lines = wrapText(doc, para.trim(), CONTENT_WIDTH);
        for (const line of lines) {
          ensureSpace(22);
          doc.text(line, PAGE.marginX, y);
          y += 22; // 22pt leading
        }
        y += 8; // paragraph spacing
      }

      // Editor notes
      if (section.editorNotes && section.editorNotes.length > 0) {
        for (const note of section.editorNotes) {
          ensureSpace(16);
          setColor(doc, COLORS.darkGray);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          const noteLines = wrapText(doc, `EDITOR: ${note}`, CONTENT_WIDTH);
          for (const nl of noteLines) {
            ensureSpace(14);
            doc.text(nl, PAGE.marginX, y);
            y += 14;
          }
        }
        y += 6;
      }

      y += 10; // spacing between sections
    }

    drawFooter(doc, script.title, pageNum);
  }

  // Return as Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
