/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { ImageList } from './components/ImageList';
import { ImageViewer } from './components/ImageViewer';
import { TextEditor } from './components/TextEditor';
import { MergeModal } from './components/MergeModal';
import { DocxSettingsModal } from './components/DocxSettingsModal';
import { ImageEnhanceModal } from './components/ImageEnhanceModal';
import { StatusBar } from './components/StatusBar';

import {
  BatchProgress,
  DocxExportSettings,
  ImageEnhancementOptions,
  ImageItem,
  OCRLanguage,
} from './types/ocr';
import { defaultDocxSettings } from './services/docxExportService';
import { defaultEnhancement, processImage } from './services/imageProcessor';
import { performOCR, terminateOCRWorker } from './services/ocrService';
import {
  exportProjectToFile,
  importProjectFromFile,
  saveDraftToIndexedDB,
  loadDraftFromIndexedDB,
  clearDraftFromIndexedDB,
} from './services/projectStorage';
import { generateDemoDocuments } from './utils/sampleDocuments';
import { Sparkles, FileText, UploadCloud, AlertCircle } from 'lucide-react';

export default function App() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>('Dự án OCR Văn bản');
  const [docxSettings, setDocxSettings] = useState<DocxExportSettings>(defaultDocxSettings);
  const [ocrLanguage, setOcrLanguage] = useState<OCRLanguage>('vie');
  const [ocrPsm, setOcrPsm] = useState<number>(3);
  const [autoEnhance, setAutoEnhance] = useState<boolean>(true);

  // Modals
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState<boolean>(false);
  const [itemToEnhance, setItemToEnhance] = useState<ImageItem | null>(null);

  // Batch Processing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    total: 0,
    completed: 0,
    currentIndex: 0,
    currentName: '',
    percent: 0,
    isProcessing: false,
  });

  const stopRequestedRef = useRef<boolean>(false);
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);

  // Selected item reference
  const selectedItem = images.find((img) => img.id === selectedId) || null;

  // 1. Initial Load: Check IndexedDB for existing draft
  useEffect(() => {
    async function initDraft() {
      const draft = await loadDraftFromIndexedDB();
      if (draft && draft.images.length > 0) {
        setImages(draft.images);
        if (draft.images[0]) setSelectedId(draft.images[0].id);
        if (draft.projectTitle) setProjectTitle(draft.projectTitle);
        if (draft.settings) setDocxSettings(draft.settings);
        if (draft.ocrLanguage) setOcrLanguage(draft.ocrLanguage);
        if (draft.ocrPsm) setOcrPsm(draft.ocrPsm);
        const timeStr = new Date(draft.updatedAt).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setLastAutoSavedTime(timeStr);
      }
    }
    initDraft();

    return () => {
      terminateOCRWorker();
    };
  }, []);

  // 2. Debounced Auto-save to IndexedDB whenever state changes
  useEffect(() => {
    if (images.length === 0) return;

    const timer = setTimeout(async () => {
      await saveDraftToIndexedDB(
        projectTitle,
        images,
        docxSettings,
        ocrLanguage,
        ocrPsm
      );
      const timeStr = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setLastAutoSavedTime(timeStr);
    }, 1500);

    return () => clearTimeout(timer);
  }, [images, projectTitle, docxSettings, ocrLanguage, ocrPsm]);

  // 3. Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S -> Save project
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveProject();
      }
      // Ctrl+E -> Open Export docx modal
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images, projectTitle, docxSettings, ocrLanguage, ocrPsm]);

  // 4. File Addition Handler
  const handleAddFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const filesArray = Array.from(fileList).filter((file) =>
        file.type.startsWith('image/')
      );

      if (filesArray.length === 0) return;

      const newItems: ImageItem[] = [];

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => resolve({ width: 0, height: 0 });
          img.src = dataUrl;
        });

        let processedDataUrl: string | undefined = undefined;
        if (autoEnhance) {
          try {
            processedDataUrl = await processImage(dataUrl, defaultEnhancement);
          } catch {
            processedDataUrl = undefined;
          }
        }

        const item: ImageItem = {
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          name: file.name,
          fileSize: file.size,
          fileType: file.type,
          dataUrl,
          processedDataUrl,
          width: dimensions.width,
          height: dimensions.height,
          status: 'idle',
          progress: 0,
          ocrText: '',
          editedText: '',
          confidence: 0,
          enhancement: { ...defaultEnhancement },
          createdAt: Date.now() + i,
        };

        newItems.push(item);
      }

      setImages((prev) => {
        const updated = [...prev, ...newItems];
        if (!selectedId && updated.length > 0) {
          setSelectedId(updated[0].id);
        }
        return updated;
      });
    },
    [autoEnhance, selectedId]
  );

  // 5. Load Demo Documents
  const handleLoadDemo = async () => {
    const demoDocs = await generateDemoDocuments();
    const newItems: ImageItem[] = [];

    for (const doc of demoDocs) {
      const processed = await processImage(doc.dataUrl, defaultEnhancement);
      newItems.push({
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: doc.name,
        fileSize: 340 * 1024,
        fileType: 'image/jpeg',
        dataUrl: doc.dataUrl,
        processedDataUrl: processed,
        width: 1240,
        height: 1754,
        status: 'idle',
        progress: 0,
        ocrText: '',
        editedText: '',
        confidence: 0,
        enhancement: { ...defaultEnhancement },
        createdAt: Date.now(),
      });
    }

    setImages((prev) => {
      const updated = [...prev, ...newItems];
      if (updated.length > 0) setSelectedId(updated[0].id);
      return updated;
    });
  };

  // 6. Delete Image
  const handleDeleteImage = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      if (selectedId === id) {
        setSelectedId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  // 7. Clear All
  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ ảnh trong danh sách?')) {
      setImages([]);
      setSelectedId(null);
      clearDraftFromIndexedDB();
    }
  };

  // 8. Reorder Images
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleReorder = (startIndex: number, endIndex: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(startIndex, 1);
      copy.splice(endIndex, 0, moved);
      return copy;
    });
  };

  // 9. Rotate Image
  const handleRotate = async (deltaDegrees: number) => {
    if (!selectedItem) return;
    const newRot = (selectedItem.enhancement.rotation + deltaDegrees + 360) % 360;
    const newEnhance = {
      ...selectedItem.enhancement,
      rotation: newRot,
    };

    try {
      const newProcessed = await processImage(selectedItem.dataUrl, newEnhance);
      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedItem.id
            ? {
                ...img,
                enhancement: newEnhance,
                processedDataUrl: newProcessed,
              }
            : img
        )
      );
    } catch (err) {
      console.error('Failed to rotate:', err);
    }
  };

  // 10. Update Text
  const handleUpdateText = (id: string, newText: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, editedText: newText } : img))
    );
  };

  // 11. Run OCR on Individual Image
  const handleRunOCR = async (id: string) => {
    const target = images.find((img) => img.id === id);
    if (!target) return;

    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              status: 'processing',
              progress: 5,
              errorMessage: undefined,
            }
          : img
      )
    );

    try {
      const imageToScan = target.processedDataUrl || target.dataUrl;
      const result = await performOCR(
        imageToScan,
        ocrLanguage,
        ocrPsm,
        (progress) => {
          setImages((prev) =>
            prev.map((img) =>
              img.id === id ? { ...img, progress: Math.min(99, progress) } : img
            )
          );
        }
      );

      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? {
                ...img,
                status: 'done',
                progress: 100,
                ocrText: result.text,
                editedText: img.editedText ? img.editedText : result.text,
                confidence: result.confidence,
                processingTimeMs: result.durationMs,
              }
            : img
        )
      );
    } catch (err: any) {
      console.error('OCR Error:', err);
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? {
                ...img,
                status: 'error',
                errorMessage: err.message || 'Lỗi nhận dạng ảnh',
              }
            : img
        )
      );
    }
  };

  // 12. Batch OCR All Images
  const handleStartBatchOCR = async () => {
    if (images.length === 0 || isProcessing) return;

    setIsProcessing(true);
    stopRequestedRef.current = false;

    const total = images.length;
    setBatchProgress({
      total,
      completed: 0,
      currentIndex: 0,
      currentName: '',
      percent: 0,
      isProcessing: true,
    });

    for (let i = 0; i < images.length; i++) {
      if (stopRequestedRef.current) break;

      const current = images[i];
      setSelectedId(current.id);

      setBatchProgress((prev) => ({
        ...prev,
        currentIndex: i + 1,
        currentName: current.name,
        percent: Math.round((i / total) * 100),
      }));

      setImages((prev) =>
        prev.map((img, idx) =>
          idx === i ? { ...img, status: 'processing', progress: 10 } : img
        )
      );

      try {
        const imageToScan = current.processedDataUrl || current.dataUrl;
        const result = await performOCR(
          imageToScan,
          ocrLanguage,
          ocrPsm,
          (progress) => {
            setImages((prev) =>
              prev.map((img, idx) =>
                idx === i ? { ...img, progress: Math.min(99, progress) } : img
              )
            );
          }
        );

        setImages((prev) =>
          prev.map((img, idx) =>
            idx === i
              ? {
                  ...img,
                  status: 'done',
                  progress: 100,
                  ocrText: result.text,
                  editedText: img.editedText ? img.editedText : result.text,
                  confidence: result.confidence,
                  processingTimeMs: result.durationMs,
                }
              : img
          )
        );
      } catch (err: any) {
        console.error(`Batch OCR error on item ${current.name}:`, err);
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === i
              ? {
                  ...img,
                  status: 'error',
                  errorMessage: err.message || 'Lỗi nhận dạng ảnh',
                }
              : img
          )
        );
      }

      setBatchProgress((prev) => ({
        ...prev,
        completed: i + 1,
        percent: Math.round(((i + 1) / total) * 100),
      }));
    }

    setIsProcessing(false);
  };

  const handleStopBatchOCR = () => {
    stopRequestedRef.current = true;
    setIsProcessing(false);
  };

  // 13. Save & Open Project
  const handleSaveProject = () => {
    exportProjectToFile(projectTitle, images, docxSettings, ocrLanguage, ocrPsm);
  };

  const handleOpenProject = async (file: File) => {
    try {
      const data = await importProjectFromFile(file);
      setProjectTitle(data.title || 'Dự án OCR');
      if (data.ocrLanguage) setOcrLanguage(data.ocrLanguage);
      if (data.ocrPsm) setOcrPsm(data.ocrPsm);
      if (data.exportSettings) setDocxSettings(data.exportSettings);

      const restoredImages: ImageItem[] = data.images.map((item, idx) => ({
        id: item.id || `img_${Date.now()}_${idx}`,
        name: item.name,
        fileSize: item.fileSize || 0,
        fileType: item.fileType || 'image/jpeg',
        dataUrl: item.dataUrl,
        processedDataUrl: undefined,
        width: 0,
        height: 0,
        status: item.ocrText ? 'done' : 'idle',
        progress: item.ocrText ? 100 : 0,
        ocrText: item.ocrText || '',
        editedText: item.editedText || item.ocrText || '',
        confidence: item.confidence || 0,
        enhancement: item.enhancement || { ...defaultEnhancement },
        createdAt: Date.now() + idx,
      }));

      setImages(restoredImages);
      if (restoredImages.length > 0) {
        setSelectedId(restoredImages[0].id);
      }
    } catch (err: any) {
      alert(`Không thể mở dự án: ${err.message}`);
    }
  };

  // 14. Enhancement Application
  const handleApplyEnhancement = async (
    id: string,
    options: ImageEnhancementOptions,
    processedUrl: string
  ) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              enhancement: options,
              processedDataUrl: processedUrl,
            }
          : img
      )
    );
  };

  const handleApplyEnhanceToAll = async (options: ImageEnhancementOptions) => {
    const updated = await Promise.all(
      images.map(async (img) => {
        try {
          const processedUrl = await processImage(img.dataUrl, options);
          return {
            ...img,
            enhancement: { ...options },
            processedDataUrl: processedUrl,
          };
        } catch {
          return img;
        }
      })
    );
    setImages(updated);
  };

  const completedCount = images.filter((img) => img.status === 'done').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* 1. Top Header */}
      <Header
        projectTitle={projectTitle}
        setProjectTitle={setProjectTitle}
        images={images}
        docxSettings={docxSettings}
        onSaveProject={handleSaveProject}
        onOpenProject={handleOpenProject}
        onOpenMergeModal={() => setIsMergeModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        lastAutoSavedTime={lastAutoSavedTime}
      />

      {/* 2. Top Toolbar */}
      <Toolbar
        onAddImages={handleAddFiles}
        onStartBatchOCR={handleStartBatchOCR}
        onStopBatchOCR={handleStopBatchOCR}
        onClearAll={handleClearAll}
        isProcessing={isProcessing}
        totalImages={images.length}
        completedCount={completedCount}
        ocrLanguage={ocrLanguage}
        setOcrLanguage={setOcrLanguage}
        ocrPsm={ocrPsm}
        setOcrPsm={setOcrPsm}
        autoEnhance={autoEnhance}
        setAutoEnhance={setAutoEnhance}
      />

      {/* 3. Main Workspace Area (3 Columns: List | Viewer | Editor) */}
      <main className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Column: Image List (Width ~3.2 / 12) */}
        <div className="col-span-3 min-w-[260px] max-w-[360px] h-full overflow-hidden">
          <ImageList
            images={images}
            selectedId={selectedId}
            onSelectImage={(id) => setSelectedId(id)}
            onDeleteImage={handleDeleteImage}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onReorder={handleReorder}
            onOCRIndividual={handleRunOCR}
            onOpenEnhanceModal={(item) => {
              setItemToEnhance(item);
              setIsEnhanceModalOpen(true);
            }}
            onDropFiles={handleAddFiles}
          />
        </div>

        {/* Middle Column: Image Viewer (Width ~4.8 / 12) */}
        <div className="col-span-5 h-full overflow-hidden">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-950">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-200">
                Chưa có tài liệu nào được thêm
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Kéo thả các tệp ảnh scan, chụp giấy tờ hành chính vào đây hoặc bấm nút &quot;Thêm ảnh&quot; trên thanh công cụ.
              </p>
              <div className="mt-5">
                <button
                  onClick={handleLoadDemo}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Nạp tài liệu mẫu tiếng Việt (Kiểm tra nhanh)</span>
                </button>
              </div>
            </div>
          ) : (
            <ImageViewer
              item={selectedItem}
              onRotate={handleRotate}
              onApplyEnhance={(opts) => {
                if (selectedItem) {
                  processImage(selectedItem.dataUrl, opts).then((url) => {
                    handleApplyEnhancement(selectedItem.id, opts, url);
                  });
                }
              }}
              onOpenEnhanceModal={() => {
                if (selectedItem) {
                  setItemToEnhance(selectedItem);
                  setIsEnhanceModalOpen(true);
                }
              }}
              onRunOCR={handleRunOCR}
              isProcessing={isProcessing}
            />
          )}
        </div>

        {/* Right Column: Text Editor (Width ~4 / 12) */}
        <div className="col-span-4 h-full overflow-hidden">
          <TextEditor
            item={selectedItem}
            onUpdateText={handleUpdateText}
            onRunOCR={handleRunOCR}
            isProcessing={isProcessing}
          />
        </div>
      </main>

      {/* 4. Bottom Status Bar */}
      <StatusBar
        images={images}
        batchProgress={batchProgress}
        isProcessing={isProcessing}
      />

      {/* 5. Modals */}
      <MergeModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        images={images}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      <DocxSettingsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        images={images}
        settings={docxSettings}
        onUpdateSettings={setDocxSettings}
      />

      <ImageEnhanceModal
        isOpen={isEnhanceModalOpen}
        onClose={() => setIsEnhanceModalOpen(false)}
        item={itemToEnhance || selectedItem}
        onSaveEnhancement={handleApplyEnhancement}
        onApplyToAll={handleApplyEnhanceToAll}
        onRunOCR={handleRunOCR}
      />
    </div>
  );
}
