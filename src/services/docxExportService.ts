import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  convertMillimetersToTwip,
} from 'docx';
import { DocxExportSettings, ImageItem } from '../types/ocr';

export const defaultDocxSettings: DocxExportSettings = {
  filename: `OCR_TaiLieu_${getFormattedTimestamp()}`,
  font: 'Times New Roman',
  fontSize: 13,
  lineSpacing: 1.2,
  paragraphSpacingPt: 6,
  marginTopCm: 2.0,
  marginBottomCm: 2.0,
  marginLeftCm: 3.0,
  marginRightCm: 1.5,
  includePageHeaders: true,
  pageHeaderTemplate: '=== TRANG {page}: {name} ===',
  pageBreakBetween: true,
  includePageNumbers: true,
  alignment: 'both',
};

function getFormattedTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}${mm}${dd}_${hh}${min}`;
}

export function generateMergedText(
  items: ImageItem[],
  includeHeaders: boolean = true,
  headerTemplate: string = '=== TRANG {page}: {name} ===',
  pageBreakSeparator: boolean = false
): string {
  const parts: string[] = [];

  items.forEach((item, index) => {
    const pageNum = index + 1;
    const text = item.editedText ?? item.ocrText ?? '';

    let section = '';
    if (includeHeaders) {
      const header = headerTemplate
        .replace('{page}', String(pageNum))
        .replace('{name}', item.name);
      section += `${header}\n\n`;
    }

    section += text.trim();

    if (pageBreakSeparator && index < items.length - 1) {
      section += '\n\n------------------ [NGẮT TRANG] ------------------\n';
    }

    parts.push(section);
  });

  return parts.join('\n\n');
}

/**
 * Build Word .docx file buffer/blob from OCR items and settings
 */
export async function generateDocxBlob(
  items: ImageItem[],
  settings: DocxExportSettings = defaultDocxSettings
): Promise<Blob> {
  const alignMap: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
    both: AlignmentType.JUSTIFIED,
  };

  const chosenAlignment = alignMap[settings.alignment] || AlignmentType.JUSTIFIED;
  // docx font size is in half-points (28 = 14pt, 26 = 13pt)
  const halfPoints = Math.round(settings.fontSize * 2);
  // line spacing: 240 = single, 288 = 1.2, 360 = 1.5
  const lineSpacingTwip = Math.round(settings.lineSpacing * 240);
  const spacingAfterTwip = Math.round(settings.paragraphSpacingPt * 20);

  const paragraphs: Paragraph[] = [];

  items.forEach((item, index) => {
    const pageNum = index + 1;
    const content = (item.editedText ?? item.ocrText ?? '').trim();

    // Optional page header banner
    if (settings.includePageHeaders) {
      const headerTitle = settings.pageHeaderTemplate
        .replace('{page}', String(pageNum))
        .replace('{name}', item.name);

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: headerTitle,
              bold: true,
              size: Math.round((settings.fontSize + 1) * 2),
              font: settings.font,
              color: '1E3A8A',
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: {
            before: index === 0 ? 0 : 200,
            after: 160,
          },
        })
      );
    }

    // Split text into paragraphs
    const lines = content.split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmed,
                size: halfPoints,
                font: settings.font,
              }),
            ],
            alignment: chosenAlignment,
            spacing: {
              line: lineSpacingTwip,
              after: spacingAfterTwip,
            },
          })
        );
      } else {
        // Empty paragraph spacing
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: '' })],
            spacing: { after: 120 },
          })
        );
      }
    });

    // Page break between items if enabled and not last item
    if (settings.pageBreakBetween && index < items.length - 1) {
      paragraphs.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: settings.font,
            size: halfPoints,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMillimetersToTwip(settings.marginTopCm * 10),
              bottom: convertMillimetersToTwip(settings.marginBottomCm * 10),
              left: convertMillimetersToTwip(settings.marginLeftCm * 10),
              right: convertMillimetersToTwip(settings.marginRightCm * 10),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Tài liệu số hóa OCR',
                    font: settings.font,
                    size: 18, // 9pt
                    color: '94A3B8',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: settings.includePageNumbers
          ? {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: 'Trang ',
                        font: settings.font,
                        size: 20, // 10pt
                        color: '64748B',
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        font: settings.font,
                        size: 20,
                        bold: true,
                        color: '64748B',
                      }),
                      new TextRun({
                        text: ' / ',
                        font: settings.font,
                        size: 20,
                        color: '64748B',
                      }),
                      new TextRun({
                        children: [PageNumber.TOTAL_PAGES],
                        font: settings.font,
                        size: 20,
                        color: '64748B',
                      }),
                    ],
                  }),
                ],
              }),
            }
          : undefined,
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Triggers browser download for docx file
 */
export async function downloadDocx(
  items: ImageItem[],
  settings: DocxExportSettings
): Promise<string> {
  const blob = await generateDocxBlob(items, settings);
  const rawFilename = settings.filename.endsWith('.docx')
    ? settings.filename
    : `${settings.filename}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = rawFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return rawFilename;
}
