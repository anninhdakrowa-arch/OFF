export type OCRStatus = 'idle' | 'processing' | 'done' | 'error';

export interface ImageEnhancementOptions {
  grayscale: boolean;
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  binarize: boolean; // Otsu / adaptive thresholding
  threshold: number; // 0 to 255
  useOtsu: boolean;
  denoise: boolean;
  sharpen: boolean;
  rotation: number; // 0, 90, 180, 270
}

export interface ImageItem {
  id: string;
  name: string;
  fileSize: number;
  fileType: string;
  dataUrl: string; // base64 / blob data url
  processedDataUrl?: string;
  width: number;
  height: number;
  status: OCRStatus;
  progress: number; // 0 to 100
  ocrText: string;
  editedText: string;
  confidence: number;
  errorMessage?: string;
  processingTimeMs?: number;
  enhancement: ImageEnhancementOptions;
  createdAt: number;
}

export interface DocxExportSettings {
  filename: string;
  font: string; // 'Times New Roman' | 'Arial' | 'Calibri'
  fontSize: number; // 12, 13, 14
  lineSpacing: number; // 1.15, 1.2, 1.5, 2.0
  paragraphSpacingPt: number; // 6pt
  marginTopCm: number;
  marginBottomCm: number;
  marginLeftCm: number;
  marginRightCm: number;
  includePageHeaders: boolean;
  pageHeaderTemplate: string; // e.g. "=== TRANG {page}: {name} ==="
  pageBreakBetween: boolean;
  includePageNumbers: boolean;
  alignment: 'left' | 'center' | 'right' | 'both'; // 'both' is justify
}

export type OCRLanguage = 'vie' | 'eng' | 'vie+eng';

export interface ProjectData {
  version: string;
  title: string;
  updatedAt: string;
  ocrLanguage: OCRLanguage;
  ocrPsm: number;
  images: Array<{
    id: string;
    name: string;
    fileSize: number;
    fileType: string;
    dataUrl: string;
    ocrText: string;
    editedText: string;
    confidence: number;
    enhancement: ImageEnhancementOptions;
  }>;
  exportSettings: DocxExportSettings;
}

export interface BatchProgress {
  total: number;
  completed: number;
  currentIndex: number;
  currentName: string;
  percent: number;
  isProcessing: boolean;
}
