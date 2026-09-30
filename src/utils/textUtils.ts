/**
 * Utility functions for text analysis, normalization, and cleanup
 */

export function countWords(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/);
  return words[0] === '' ? 0 : words.length;
}

export function countCharacters(text: string): number {
  return text ? text.length : 0;
}

export function countParagraphs(text: string): number {
  if (!text) return 0;
  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;
}

/**
 * Remove superfluous consecutive spaces while preserving line breaks
 */
export function removeExtraSpaces(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n');
}

/**
 * Clean up common OCR artifacts in Vietnamese administrative documents
 */
export function normalizeVietnameseOcrText(text: string): string {
  if (!text) return '';

  let cleaned = text.normalize('NFC');

  // Fix common OCR broken quotes
  cleaned = cleaned
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    // Fix broken administrative headers
    .replace(/CỘNG\s*HÒA\s*XÃ\s*HỘI\s*CHỦ\s*NGHĨA\s*VIỆT\s*NAM/gi, 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM')
    .replace(/Độc\s*lập\s*-\s*Tự\s*do\s*-\s*Hạnh\s*phúc/gi, 'Độc lập - Tự do - Hạnh phúc')
    .replace(/ĐỘC\s*LẬP\s*-\s*TỰ\s*DO\s*-\s*HẠNH\s*PHÚC/gi, 'ĐỘC LẬP - TỰ DO - HẠNH PHÚC')
    .replace(/NGHỊ\s*QUYẾT/gi, 'NGHỊ QUYẾT')
    .replace(/QUYẾT\s*ĐỊNH/gi, 'QUYẾT ĐỊNH')
    .replace(/BÁO\s*CÁO/gi, 'BÁO CÁO')
    .replace(/BIÊN\s*BẢN/gi, 'BIÊN BẢN')
    // Remove repeated blank lines (> 2)
    .replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

/**
 * Capitalize first letter of every paragraph
 */
export function capitalizeSentences(text: string): string {
  return text
    .split('\n')
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return paragraph;
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    })
    .join('\n');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
