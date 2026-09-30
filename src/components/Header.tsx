import React, { useRef } from 'react';
import {
  FileText,
  Save,
  FolderOpen,
  Download,
  Eye,
  ShieldCheck,
  HardDriveDownload,
} from 'lucide-react';
import { DocxExportSettings, ImageItem } from '../types/ocr';

interface HeaderProps {
  projectTitle: string;
  setProjectTitle: (val: string) => void;
  images: ImageItem[];
  docxSettings: DocxExportSettings;
  onSaveProject: () => void;
  onOpenProject: (file: File) => void;
  onOpenMergeModal: () => void;
  onOpenExportModal: () => void;
  lastAutoSavedTime: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  projectTitle,
  setProjectTitle,
  images,
  docxSettings,
  onSaveProject,
  onOpenProject,
  onOpenMergeModal,
  onOpenExportModal,
  lastAutoSavedTime,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedCount = images.filter((img) => img.status === 'done').length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenProject(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white select-none">
      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-sm">
            OCR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm tracking-wide">
                VN-OCR Desktop
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                100% OFFLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Nhận dạng chữ tiếng Việt cục bộ • Bảo mật tuyệt đối • Không Internet
            </p>
          </div>
        </div>

        {/* Project Title Input */}
        <div className="flex items-center gap-2 max-w-sm w-full mx-4">
          <span className="text-xs text-slate-400 whitespace-nowrap">Dự án:</span>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="Tên tài liệu / dự án..."
            className="w-full bg-slate-800/90 text-sm text-slate-200 border border-slate-700/80 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium transition"
          />
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2">
          {lastAutoSavedTime && (
            <span className="text-[11px] text-slate-400 hidden lg:inline mr-2">
              Tự lưu: {lastAutoSavedTime}
            </span>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".ocrproject,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Mở tệp dự án (.ocrproject)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Mở dự án</span>
          </button>

          <button
            onClick={onSaveProject}
            title="Lưu toàn bộ ảnh và kết quả OCR thành file .ocrproject"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Save className="w-3.5 h-3.5 text-blue-400" />
            <span>Lưu dự án</span>
          </button>

          <button
            onClick={onOpenMergeModal}
            disabled={images.length === 0}
            title="Xem nội dung tất cả các trang đã gộp lại"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>Gộp tất cả ({completedCount}/{images.length})</span>
          </button>

          <button
            onClick={onOpenExportModal}
            disabled={completedCount === 0}
            title="Xuất nội dung thành file Microsoft Word (.docx)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <FileText className="w-4 h-4" />
            <span>XUẤT WORD (.DOCX)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
