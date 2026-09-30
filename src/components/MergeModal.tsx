import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileText,
  FileCheck,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ImageItem } from '../types/ocr';
import { generateMergedText } from '../services/docxExportService';
import { countCharacters, countWords } from '../utils/textUtils';

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageItem[];
  onOpenExportModal: () => void;
}

export const MergeModal: React.FC<MergeModalProps> = ({
  isOpen,
  onClose,
  images,
  onOpenExportModal,
}) => {
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [pageBreakSeparator, setPageBreakSeparator] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mergedText = generateMergedText(
    images,
    includeHeaders,
    '=== TRANG {page}: {name} ===',
    pageBreakSeparator
  );

  const wordCount = countWords(mergedText);
  const charCount = countCharacters(mergedText);
  const readyPages = images.filter((img) => (img.editedText || img.ocrText)?.trim()).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(mergedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([mergedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OCR_GopTaiLieu_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Gộp tất cả nội dung tài liệu
              </h3>
              <p className="text-xs text-slate-400">
                Tổng hợp {readyPages}/{images.length} trang theo đúng thứ tự tài liệu
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

        {/* Options Bar */}
        <div className="px-6 py-3 bg-slate-800/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">Chèn tiêu đề số trang (=== TRANG X ===)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pageBreakSeparator}
                onChange={(e) => setPageBreakSeparator(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">Chèn ký hiệu ngắt trang</span>
            </label>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>
              Tổng từ: <strong className="text-slate-200">{wordCount}</strong>
            </span>
            <span>
              Ký tự: <strong className="text-slate-200">{charCount}</strong>
            </span>
          </div>
        </div>

        {/* Combined Text Preview */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <textarea
            readOnly
            value={mergedText}
            className="w-full h-full bg-slate-950 font-serif text-slate-200 p-4 rounded-lg border border-slate-800 resize-none focus:outline-none text-sm leading-relaxed"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-blue-400" />
                  <span>Sao chép tất cả</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Tải file .TXT</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenExportModal();
              }}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30 transition"
            >
              <FileText className="w-4 h-4" />
              <span>Xuất file Word (.docx)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
