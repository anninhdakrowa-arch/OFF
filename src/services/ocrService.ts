import { createWorker, Worker, OEM, PSM } from 'tesseract.js';
import { OCRLanguage } from '../types/ocr';

let currentWorker: Worker | null = null;
let currentLanguage: OCRLanguage | null = null;
let currentPsm: PSM = PSM.AUTO;

/**
 * Resolve local asset path for Tessdata files (works in both browser dev server and packaged Electron file://)
 */
function getTessdataBaseUrl(): string {
  // If running in packaged electron file:// environment
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    const pathname = window.location.pathname;
    const dir = pathname.substring(0, pathname.lastIndexOf('/'));
    return `${window.location.protocol}//${dir}/tessdata`;
  }
  // Standard web / Vite dev
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}tessdata`;
}

/**
 * Get or create an offline Tesseract worker
 */
export async function getOCRWorker(
  language: OCRLanguage = 'vie',
  psm: number | PSM = PSM.AUTO,
  onProgress?: (progress: { status: string; progress: number }) => void
): Promise<Worker> {
  const chosenPsm = (typeof psm === 'number' ? String(psm) : psm) as PSM;

  // If worker exists with same language, just set psm and return
  if (currentWorker && currentLanguage === language) {
    if (currentPsm !== chosenPsm) {
      await currentWorker.setParameters({
        tessedit_pageseg_mode: chosenPsm,
      });
      currentPsm = chosenPsm;
    }
    return currentWorker;
  }

  // Terminate previous worker if language changed
  if (currentWorker) {
    try {
      await currentWorker.terminate();
    } catch {
      // ignore termination errors
    }
    currentWorker = null;
  }

  const tessdataUrl = getTessdataBaseUrl();

  const worker = await createWorker(
    language,
    OEM.LSTM_ONLY,
    {
      workerPath: `${tessdataUrl}/worker.min.js`,
      corePath: `${tessdataUrl}/tesseract-core-lstm.wasm.js`,
      langPath: tessdataUrl,
      gzip: false,
      logger: (m) => {
        if (onProgress && typeof m.progress === 'number') {
          onProgress({
            status: m.status,
            progress: Math.round(m.progress * 100),
          });
        }
      },
      errorHandler: (err) => {
        console.error('Tesseract offline worker error:', err);
      },
    }
  );

  await worker.setParameters({
    tessedit_pageseg_mode: chosenPsm,
    preserve_interword_spaces: '1' as any,
  });

  currentWorker = worker;
  currentLanguage = language;
  currentPsm = chosenPsm;

  return worker;
}

export interface OCRResult {
  text: string;
  confidence: number;
  durationMs: number;
}

/**
 * Perform OCR on an image dataUrl or image element
 */
export async function performOCR(
  imageSource: string | HTMLCanvasElement,
  language: OCRLanguage = 'vie',
  psm: number | PSM = PSM.AUTO,
  onProgress?: (progress: number, statusText: string) => void
): Promise<OCRResult> {
  const startTime = performance.now();

  const worker = await getOCRWorker(language, psm, ({ status, progress }) => {
    let viStatus = 'Đang xử lý...';
    if (status.includes('loading')) viStatus = 'Tải dữ liệu mô hình...';
    else if (status.includes('initializing')) viStatus = 'Khởi tạo bộ xử lý...';
    else if (status.includes('recognizing')) viStatus = `Đang nhận dạng chữ (${progress}%)...`;

    if (onProgress) {
      onProgress(progress, viStatus);
    }
  });

  const res = await worker.recognize(imageSource);
  const durationMs = Math.round(performance.now() - startTime);

  // Normalize Unicode to NFC (standard Vietnamese)
  const normalizedText = (res.data.text || '')
    .normalize('NFC')
    // Remove null / zero-width characters that can corrupt docs
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');

  return {
    text: normalizedText,
    confidence: Math.round(res.data.confidence || 0),
    durationMs,
  };
}

/**
 * Terminate active worker to free memory
 */
export async function terminateOCRWorker(): Promise<void> {
  if (currentWorker) {
    await currentWorker.terminate();
    currentWorker = null;
    currentLanguage = null;
  }
}
