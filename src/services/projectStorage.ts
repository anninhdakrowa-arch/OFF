import { DocxExportSettings, ImageItem, OCRLanguage, ProjectData } from '../types/ocr';

const DB_NAME = 'VN_OCR_OFFLINE_DB';
const DB_VERSION = 1;
const STORE_NAME = 'draft_store';
const DRAFT_KEY = 'current_project_draft';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save draft into IndexedDB so large batches of images are preserved across refreshes
 */
export async function saveDraftToIndexedDB(
  projectTitle: string,
  images: ImageItem[],
  settings: DocxExportSettings,
  ocrLanguage: OCRLanguage,
  ocrPsm: number
): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Minimize stored data size
    const serializableImages = images.map((img) => ({
      id: img.id,
      name: img.name,
      fileSize: img.fileSize,
      fileType: img.fileType,
      dataUrl: img.dataUrl,
      width: img.width,
      height: img.height,
      status: img.status,
      progress: img.progress,
      ocrText: img.ocrText,
      editedText: img.editedText,
      confidence: img.confidence,
      enhancement: img.enhancement,
      createdAt: img.createdAt,
    }));

    const draftData = {
      projectTitle,
      images: serializableImages,
      settings,
      ocrLanguage,
      ocrPsm,
      updatedAt: new Date().toISOString(),
    };

    await new Promise<void>((resolve, reject) => {
      const putReq = store.put(draftData, DRAFT_KEY);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (err) {
    console.warn('Failed to auto-save draft to IndexedDB:', err);
  }
}

/**
 * Check and load saved draft from IndexedDB
 */
export async function loadDraftFromIndexedDB(): Promise<{
  projectTitle: string;
  images: ImageItem[];
  settings: DocxExportSettings;
  ocrLanguage: OCRLanguage;
  ocrPsm: number;
  updatedAt: string;
} | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const data = await new Promise<any>((resolve, reject) => {
      const getReq = store.get(DRAFT_KEY);
      getReq.onsuccess = () => resolve(getReq.result);
      getReq.onerror = () => reject(getReq.error);
    });

    if (!data || !Array.isArray(data.images) || data.images.length === 0) {
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Failed to load draft from IndexedDB:', err);
    return null;
  }
}

/**
 * Clear auto-saved draft
 */
export async function clearDraftFromIndexedDB(): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(DRAFT_KEY);
  } catch (err) {
    console.warn('Failed to clear draft:', err);
  }
}

/**
 * Export current project to .ocrproject file
 */
export function exportProjectToFile(
  projectTitle: string,
  images: ImageItem[],
  settings: DocxExportSettings,
  ocrLanguage: OCRLanguage,
  ocrPsm: number
): void {
  const project: ProjectData = {
    version: '1.0.0',
    title: projectTitle || 'DuAn_OCR_TàiLiệu',
    updatedAt: new Date().toISOString(),
    ocrLanguage,
    ocrPsm,
    images: images.map((img) => ({
      id: img.id,
      name: img.name,
      fileSize: img.fileSize,
      fileType: img.fileType,
      dataUrl: img.dataUrl,
      ocrText: img.ocrText,
      editedText: img.editedText,
      confidence: img.confidence,
      enhancement: img.enhancement,
    })),
    exportSettings: settings,
  };

  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanTitle = (project.title || 'DuAn_OCR').replace(/[^\w\s-]/gi, '_');
  a.href = url;
  a.download = `${cleanTitle}.ocrproject`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Import project from .ocrproject file
 */
export async function importProjectFromFile(file: File): Promise<ProjectData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as ProjectData;
        if (!data || !Array.isArray(data.images)) {
          throw new Error('Định dạng tệp .ocrproject không hợp lệ.');
        }
        resolve(data);
      } catch (err: any) {
        reject(new Error(err.message || 'Lỗi đọc tệp dự án.'));
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc tệp.'));
    reader.readAsText(file);
  });
}
