import React, { useState } from 'react';
import {
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Play,
  ArrowUp,
  ArrowDown,
  GripVertical,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { ImageItem } from '../types/ocr';
import { formatFileSize } from '../utils/textUtils';

interface ImageListProps {
  images: ImageItem[];
  selectedId: string | null;
  onSelectImage: (id: string) => void;
  onDeleteImage: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onOCRIndividual: (id: string) => void;
  onOpenEnhanceModal: (item: ImageItem) => void;
  onDropFiles: (files: FileList | File[]) => void;
}

export const ImageList: React.FC<ImageListProps> = ({
  images,
  selectedId,
  onSelectImage,
  onDeleteImage,
  onMoveUp,
  onMoveDown,
  onReorder,
  onOCRIndividual,
  onOpenEnhanceModal,
  onDropFiles,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropItem = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleFileDrop}
      className={`flex flex-col h-full bg-slate-900 border-r border-slate-800 ${
        isDragOver ? 'ring-2 ring-blue-500 bg-blue-950/20' : ''
      }`}
    >
      {/* List Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Danh sách trang ({images.length})
          </h2>
          <p className="text-[11px] text-slate-400">
            Kéo thả hoặc dùng mũi tên để đổi thứ tự trang
          </p>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1.5 space-y-1">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-slate-500">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">Chưa có ảnh nào</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Kéo thả các file ảnh JPG, PNG, WEBP vào đây hoặc bấm &quot;Thêm ảnh&quot;
            </p>
          </div>
        ) : (
          images.map((item, index) => {
            const isSelected = item.id === selectedId;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOverItem(e, index)}
                onDrop={(e) => handleDropItem(e, index)}
                onClick={() => onSelectImage(item.id)}
                className={`group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition select-none ${
                  isSelected
                    ? 'bg-blue-600/20 border border-blue-500/50 shadow-sm'
                    : 'hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                {/* Drag Handle & Page Index */}
                <div className="flex items-center gap-1 text-slate-400">
                  <GripVertical className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 cursor-grab" />
                  <span className="text-xs font-mono font-bold w-5 text-center text-slate-300">
                    {index + 1}
                  </span>
                </div>

                {/* Thumbnail */}
                <div className="w-12 h-14 bg-slate-950 rounded border border-slate-700 overflow-hidden flex-shrink-0 relative">
                  <img
                    src={item.processedDataUrl || item.dataUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {item.enhancement.rotation !== 0 && (
                    <span className="absolute bottom-0 right-0 bg-blue-600 text-[9px] text-white px-0.5 rounded-tl font-mono">
                      {item.enhancement.rotation}°
                    </span>
                  )}
                </div>

                {/* File Information & Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-xs font-medium truncate ${
                        isSelected ? 'text-blue-300' : 'text-slate-200'
                      }`}
                      title={item.name}
                    >
                      {item.name}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {formatFileSize(item.fileSize)}
                    {item.confidence > 0 && (
                      <span className="ml-2 text-emerald-400 font-medium">
                        Độ tin cậy: {item.confidence}%
                      </span>
                    )}
                  </p>

                  {/* Status Badge */}
                  <div className="mt-1">
                    {item.status === 'idle' && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                        Chưa OCR
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                        <span className="text-[10px] text-blue-400 font-medium">
                          {item.progress > 0 ? `${item.progress}%` : 'Đang xử lý...'}
                        </span>
                      </div>
                    )}
                    {item.status === 'done' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Đã OCR
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20" title={item.errorMessage}>
                        <AlertCircle className="w-2.5 h-2.5" />
                        Lỗi OCR
                      </span>
                    )}
                  </div>
                </div>

                {/* Row Actions */}
                <div className="flex flex-col gap-1 opacity-60 group-hover:opacity-100 transition">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(index);
                      }}
                      disabled={index === 0}
                      title="Chuyển lên"
                      className="p-1 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-20"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown(index);
                      }}
                      disabled={index === images.length - 1}
                      title="Chuyển xuống"
                      className="p-1 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-20"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOCRIndividual(item.id);
                      }}
                      disabled={item.status === 'processing'}
                      title="OCR ảnh này"
                      className="p-1 hover:bg-emerald-600/30 text-emerald-400 rounded"
                    >
                      <Play className="w-3 h-3 fill-emerald-400" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteImage(item.id);
                      }}
                      title="Xóa ảnh này"
                      className="p-1 hover:bg-rose-600/30 text-rose-400 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Drop zone footer hint */}
      <div className="p-2 border-t border-slate-800 text-center text-[11px] text-slate-400 bg-slate-950/60">
        Hỗ trợ: JPG, PNG, WEBP, BMP
      </div>
    </div>
  );
};
