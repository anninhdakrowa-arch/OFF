import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  HardDrive,
} from 'lucide-react';
import { BatchProgress, ImageItem } from '../types/ocr';
import { countWords } from '../utils/textUtils';

interface StatusBarProps {
  images: ImageItem[];
  batchProgress: BatchProgress;
  isProcessing: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  images,
  batchProgress,
  isProcessing,
}) => {
  const total = images.length;
  const completed = images.filter((img) => img.status === 'done').length;
  const errors = images.filter((img) => img.status === 'error').length;
  const pending = images.filter((img) => img.status === 'idle').length;

  const totalWords = images.reduce(
    (sum, img) => sum + countWords(img.editedText || img.ocrText || ''),
    0
  );

  return (
    <footer className="h-8 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400 select-none">
      {/* Left side: Offline Status & Progress */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OFFLINE LOCAL</span>
        </div>

        {isProcessing && (
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">
              Đang xử lý {batchProgress.currentIndex}/{batchProgress.total}:
            </span>
            <span className="text-blue-400 max-w-[150px] truncate font-mono">
              {batchProgress.currentName}
            </span>
            <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${batchProgress.percent}%` }}
              />
            </div>
            <span className="font-mono text-slate-300 font-semibold">
              {batchProgress.percent}%
            </span>
          </div>
        )}
      </div>

      {/* Right side: Summary Counters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>
            Tổng: <strong className="text-slate-200">{total}</strong> ảnh
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Hoàn thành: <strong className="text-emerald-400">{completed}</strong>
          </span>
        </div>

        {errors > 0 && (
          <div className="flex items-center gap-1.5 text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              Lỗi: <strong>{errors}</strong>
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
          <span>
            Tổng từ: <strong className="text-slate-200">{totalWords.toLocaleString()}</strong>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-3 text-slate-500 text-[10px]">
          <span>Ctrl+S: Lưu</span>
          <span>•</span>
          <span>Ctrl+E: Xuất Word</span>
        </div>
      </div>
    </footer>
  );
};
