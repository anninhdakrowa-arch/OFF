import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Eraser,
  Search,
  Sparkles,
  Type,
  FileCheck,
  ArrowRight,
  ListOrdered,
} from 'lucide-react';
import { ImageItem } from '../types/ocr';
import {
  countCharacters,
  countParagraphs,
  countWords,
  removeExtraSpaces,
  normalizeVietnameseOcrText,
  capitalizeSentences,
} from '../utils/textUtils';

interface TextEditorProps {
  item: ImageItem | null;
  onUpdateText: (id: string, newText: string) => void;
  onRunOCR: (id: string) => void;
  isProcessing: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  item,
  onUpdateText,
  onRunOCR,
  isProcessing,
}) => {
  const [copied, setCopied] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [fontFamily, setFontFamily] = useState<'times' | 'sans' | 'mono'>('times');
  const [fontSize, setFontSize] = useState<number>(14);

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-slate-400 p-8 select-none">
        <FileCheck className="w-12 h-12 text-slate-600 mb-3" />
        <p className="text-sm font-medium text-slate-300">Vùng soạn thảo văn bản</p>
        <p className="text-xs text-slate-400 mt-1">
          Chọn một ảnh để xem nội dung nhận dạng và chỉnh sửa trực tiếp
        </p>
      </div>
    );
  }

  const currentText = item.editedText ?? item.ocrText ?? '';
  const wordCount = countWords(currentText);
  const charCount = countCharacters(currentText);
  const paraCount = countParagraphs(currentText);

  const handleCopy = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveSpaces = () => {
    const cleaned = removeExtraSpaces(currentText);
    onUpdateText(item.id, cleaned);
  };

  const handleNormalize = () => {
    const cleaned = normalizeVietnameseOcrText(currentText);
    onUpdateText(item.id, cleaned);
  };

  const handleCapitalize = () => {
    const capitalized = capitalizeSentences(currentText);
    onUpdateText(item.id, capitalized);
  };

  const handleRevert = () => {
    if (window.confirm('Khôi phục lại nội dung gốc ban đầu nhận dạng được từ OCR?')) {
      onUpdateText(item.id, item.ocrText);
    }
  };

  const handleClear = () => {
    if (window.confirm('Bạn có chắc muốn xóa sạch nội dung trang này?')) {
      onUpdateText(item.id, '');
    }
  };

  const handleReplaceAll = () => {
    if (!findQuery) return;
    const regex = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const updated = currentText.replace(regex, replaceQuery);
    onUpdateText(item.id, updated);
  };

  const getFontClass = () => {
    switch (fontFamily) {
      case 'times':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Top Header & Metrics */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 uppercase tracking-wide">
            Văn bản nhận dạng
          </span>
          {item.confidence > 0 && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                item.confidence >= 85
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : item.confidence >= 65
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              Độ tin cậy: {item.confidence}%
            </span>
          )}
        </div>

        {/* Word / Char Counters */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>
            Từ: <strong className="text-slate-200">{wordCount}</strong>
          </span>
          <span>
            Ký tự: <strong className="text-slate-200">{charCount}</strong>
          </span>
          <span>
            Đoạn: <strong className="text-slate-200">{paraCount}</strong>
          </span>
        </div>
      </div>

      {/* Editing Toolbar */}
      <div className="px-3 py-1.5 bg-slate-800/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center flex-wrap gap-1">
          <button
            onClick={handleCopy}
            disabled={!currentText}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition disabled:opacity-40"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-blue-400" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          <button
            onClick={handleNormalize}
            disabled={!currentText}
            title="Chuẩn hóa chính tả hành chính và dấu tiếng Việt (NFC)"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Chuẩn hóa dấu VN</span>
          </button>

          <button
            onClick={handleRemoveSpaces}
            disabled={!currentText}
            title="Xóa khoảng trắng thừa và dòng trống lặp lại"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition disabled:opacity-40"
          >
            <Eraser className="w-3.5 h-3.5 text-indigo-400" />
            <span>Xóa khoảng trắng thừa</span>
          </button>

          <button
            onClick={handleCapitalize}
            disabled={!currentText}
            title="Viết hoa chữ cái đầu đoạn văn"
            className="flex items-center gap-1 px-2 py-1 bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition disabled:opacity-40"
          >
            <Type className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hoa đầu dòng</span>
          </button>

          <button
            onClick={() => setShowFindReplace(!showFindReplace)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition ${
              showFindReplace
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-700/80 hover:bg-slate-700 text-slate-200 border-transparent'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tìm & Thay thế</span>
          </button>
        </div>

        {/* Font styling controls */}
        <div className="flex items-center gap-2 text-slate-400">
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as any)}
            className="bg-slate-900 text-slate-300 text-[11px] rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none"
          >
            <option value="times">Times New Roman</option>
            <option value="sans">Sans-serif</option>
            <option value="mono">Monospace</option>
          </select>

          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="bg-slate-900 text-slate-300 text-[11px] rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none"
          >
            <option value={12}>12 pt</option>
            <option value={13}>13 pt (Chuẩn)</option>
            <option value={14}>14 pt</option>
            <option value={16}>16 pt</option>
            <option value={18}>18 pt</option>
          </select>

          <button
            onClick={handleRevert}
            disabled={!item.ocrText || item.editedText === item.ocrText}
            title="Khôi phục lại nội dung ban đầu từ OCR"
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-amber-400 rounded disabled:opacity-20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClear}
            disabled={!currentText}
            title="Xóa hết văn bản"
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded disabled:opacity-20"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Find & Replace drawer */}
      {showFindReplace && (
        <div className="bg-slate-800/95 border-b border-slate-700 px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Tìm kiếm từ..."
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500 w-44"
          />
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Thay thế bằng..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500 w-44"
          />
          <button
            onClick={handleReplaceAll}
            disabled={!findQuery}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold disabled:opacity-40"
          >
            Thay thế tất cả
          </button>
        </div>
      )}

      {/* Main Textarea */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col">
        {item.status === 'processing' ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/40 rounded-lg border border-slate-800/80 p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-blue-400">
              Đang nhận dạng văn bản tiếng Việt...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Tiến trình: {item.progress}%
            </p>
          </div>
        ) : (
          <textarea
            value={currentText}
            onChange={(e) => onUpdateText(item.id, e.target.value)}
            placeholder="Chưa có nội dung văn bản. Bấm 'OCR lại ảnh này' hoặc 'OCR TẤT CẢ' để nhận dạng chữ..."
            style={{ fontSize: `${fontSize}px` }}
            spellCheck={false}
            className={`w-full h-full bg-slate-950 text-slate-100 p-4 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 resize-none leading-relaxed transition ${getFontClass()}`}
          />
        )}
      </div>
    </div>
  );
};
