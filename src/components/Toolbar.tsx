import React, { useRef } from 'react';
import {
  ImagePlus,
  FolderPlus,
  Play,
  Square,
  Trash2,
  Sliders,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { OCRLanguage } from '../types/ocr';

interface ToolbarProps {
  onAddImages: (files: FileList | File[]) => void;
  onStartBatchOCR: () => void;
  onStopBatchOCR: () => void;
  onClearAll: () => void;
  isProcessing: boolean;
  totalImages: number;
  completedCount: number;
  ocrLanguage: OCRLanguage;
  setOcrLanguage: (lang: OCRLanguage) => void;
  ocrPsm: number;
  setOcrPsm: (psm: number) => void;
  autoEnhance: boolean;
  setAutoEnhance: (val: boolean) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddImages,
  onStartBatchOCR,
  onStopBatchOCR,
  onClearAll,
  isProcessing,
  totalImages,
  completedCount,
  ocrLanguage,
  setOcrLanguage,
  ocrPsm,
  setOcrPsm,
  autoEnhance,
  setAutoEnhance,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddImages(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-slate-200">
      {/* File & Folder Inputs (Hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFiles}
        multiple
        accept="image/jpeg,image/png,image/webp,image/bmp"
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFiles}
        // @ts-ignore
        webkitdirectory="true"
        directory=""
        multiple
        className="hidden"
      />

      {/* Primary Action Buttons */}
      <div className="flex items-center flex-wrap gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <ImagePlus className="w-4 h-4" />
          <span>Thêm ảnh</span>
        </button>

        <button
          onClick={() => folderInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition disabled:opacity-50"
        >
          <FolderPlus className="w-4 h-4 text-amber-400" />
          <span>Thêm thư mục</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {isProcessing ? (
          <button
            onClick={onStopBatchOCR}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold shadow transition animate-pulse"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>DỪNG OCR</span>
          </button>
        ) : (
          <button
            onClick={onStartBatchOCR}
            disabled={totalImages === 0}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-md shadow-emerald-900/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>OCR TẤT CẢ ({totalImages - completedCount} ảnh)</span>
          </button>
        )}

        <button
          onClick={onClearAll}
          disabled={totalImages === 0 || isProcessing}
          title="Xóa tất cả ảnh trong danh sách"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 rounded text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Xóa tất cả</span>
        </button>
      </div>

      {/* Settings / Options Dropdowns */}
      <div className="flex items-center flex-wrap gap-3 text-xs">
        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/80">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Ngôn ngữ:</span>
          <select
            value={ocrLanguage}
            onChange={(e) => setOcrLanguage(e.target.value as OCRLanguage)}
            disabled={isProcessing}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="vie" className="bg-slate-900 text-white">
              Tiếng Việt (vie)
            </option>
            <option value="vie+eng" className="bg-slate-900 text-white">
              Tiếng Việt + Tiếng Anh (vie+eng)
            </option>
            <option value="eng" className="bg-slate-900 text-white">
              Tiếng Anh (eng)
            </option>
          </select>
        </div>

        {/* PSM Mode */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/80">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Phân đoạn:</span>
          <select
            value={ocrPsm}
            onChange={(e) => setOcrPsm(Number(e.target.value))}
            disabled={isProcessing}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[130px] truncate"
          >
            <option value={3} className="bg-slate-900 text-white">
              Tự động (Văn bản trang - Chuẩn)
            </option>
            <option value={6} className="bg-slate-900 text-white">
              Khối đồng nhất (Báo cáo, văn bản Đảng)
            </option>
            <option value={4} className="bg-slate-900 text-white">
              Cột đơn cỡ chữ biến đổi
            </option>
            <option value={11} className="bg-slate-900 text-white">
              Tìm tối đa văn bản rải rác
            </option>
          </select>
        </div>

        {/* Auto Enhance toggle */}
        <label className="flex items-center gap-2 cursor-pointer bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-700/80 select-none">
          <input
            type="checkbox"
            checked={autoEnhance}
            onChange={(e) => setAutoEnhance(e.target.checked)}
            disabled={isProcessing}
            className="rounded text-blue-500 focus:ring-0 bg-slate-900 border-slate-600 cursor-pointer"
          />
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Tự cải thiện ảnh
          </span>
        </label>
      </div>
    </div>
  );
};
