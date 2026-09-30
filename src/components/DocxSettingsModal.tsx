import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  CheckCircle,
  Settings2,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  FileCheck,
} from 'lucide-react';
import { DocxExportSettings, ImageItem } from '../types/ocr';
import { downloadDocx } from '../services/docxExportService';

interface DocxSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageItem[];
  settings: DocxExportSettings;
  onUpdateSettings: (newSettings: DocxExportSettings) => void;
}

export const DocxSettingsModal: React.FC<DocxSettingsModalProps> = ({
  isOpen,
  onClose,
  images,
  settings,
  onUpdateSettings,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFilename, setExportedFilename] = useState<string | null>(null);

  if (!isOpen) return null;

  const readyCount = images.filter((img) => (img.editedText || img.ocrText)?.trim()).length;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const filename = await downloadDocx(images, settings);
      setExportedFilename(filename);
      setTimeout(() => {
        setIsExporting(false);
      }, 1500);
    } catch (err: any) {
      setIsExporting(false);
      alert(`Lỗi xuất file Word: ${err.message || 'Không thể tạo file docx'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cài đặt xuất file Microsoft Word (.docx)
              </h3>
              <p className="text-xs text-slate-400">
                Định dạng chuẩn theo thể thức văn bản hành chính Việt Nam (Nghị định 30/2020/NĐ-CP)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-300">
          {/* Filename */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1.5">
              Tên tệp Word khi xuất:
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={settings.filename}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, filename: e.target.value })
                }
                placeholder="OCR_TaiLieu_..."
                className="w-full bg-slate-950 border border-slate-700 rounded-l px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="bg-slate-800 border border-l-0 border-slate-700 px-3 py-2 rounded-r text-slate-400 font-mono">
                .docx
              </span>
            </div>
          </div>

          {/* Typography Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
            <div>
              <label className="block font-medium text-slate-400 mb-1">
                Phông chữ (Font):
              </label>
              <select
                value={settings.font}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, font: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 focus:outline-none"
              >
                <option value="Times New Roman">Times New Roman (Chuẩn VN)</option>
                <option value="Arial">Arial</option>
                <option value="Calibri">Calibri</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">
                Cỡ chữ (Size):
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, fontSize: Number(e.target.value) })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 focus:outline-none"
              >
                <option value={12}>12 pt</option>
                <option value={13}>13 pt (Quy định NĐ 30)</option>
                <option value={14}>14 pt (Quy định NĐ 30)</option>
                <option value={15}>15 pt</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">
                Giãn dòng (Line spacing):
              </label>
              <select
                value={settings.lineSpacing}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    lineSpacing: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 focus:outline-none"
              >
                <option value={1.15}>1.15 line</option>
                <option value={1.2}>1.2 line (Chuẩn)</option>
                <option value={1.3}>1.3 line</option>
                <option value={1.5}>1.5 line</option>
              </select>
            </div>
          </div>

          {/* Margins */}
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
            <h4 className="font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Căn lề trang in (cm) theo thể thức hành chính:</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Lề trên (Top):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5"
                  value={settings.marginTopCm}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      marginTopCm: parseFloat(e.target.value) || 2,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono text-center focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Lề dưới (Bottom):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5"
                  value={settings.marginBottomCm}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      marginBottomCm: parseFloat(e.target.value) || 2,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono text-center focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Lề trái (Trang đóng gáy):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5"
                  value={settings.marginLeftCm}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      marginLeftCm: parseFloat(e.target.value) || 3,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono text-center focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Lề phải (Right):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5"
                  value={settings.marginRightCm}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      marginRightCm: parseFloat(e.target.value) || 1.5,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono text-center focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Document Structure Options */}
          <div className="space-y-3 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.pageBreakBetween}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    pageBreakBetween: e.target.checked,
                  })
                }
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-200 font-medium">
                Tự động ngắt trang (Mỗi ảnh thành một trang riêng trong Word)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.includePageNumbers}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    includePageNumbers: e.target.checked,
                  })
                }
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-200 font-medium">
                Đánh số trang ở chân trang (Footer: &quot;Trang X / Y&quot;)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.includePageHeaders}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    includePageHeaders: e.target.checked,
                  })
                }
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-200 font-medium">
                Chèn tiêu đề đề mục trang: &quot;=== TRANG X: tên_ảnh.jpg ===&quot;
              </span>
            </label>
          </div>

          {exportedFilename && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Đã xuất tệp thành công:{' '}
                <strong className="underline">{exportedFilename}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Tổng số: <strong className="text-white">{readyCount}</strong> trang đã sẵn sàng
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
            >
              Đóng
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting || readyCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isExporting ? 'ĐANG TẠO FILE...' : 'XUẤT FILE DOCX NGAY'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
