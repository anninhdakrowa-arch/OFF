import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  Play,
  Layers,
} from 'lucide-react';
import { ImageEnhancementOptions, ImageItem } from '../types/ocr';

interface ImageViewerProps {
  item: ImageItem | null;
  onRotate: (deltaDegrees: number) => void;
  onApplyEnhance: (options: ImageEnhancementOptions) => void;
  onOpenEnhanceModal: () => void;
  onRunOCR: (id: string) => void;
  isProcessing: boolean;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  item,
  onRotate,
  onApplyEnhance,
  onOpenEnhanceModal,
  onRunOCR,
  isProcessing,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showProcessed, setShowProcessed] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & pan when switching items
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setShowProcessed(Boolean(item?.processedDataUrl));
  }, [item?.id]);

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-slate-400 p-8 select-none">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500">
          <Eye className="w-8 h-8" />
        </div>
        <p className="text-sm font-medium text-slate-300">Chưa chọn ảnh nào</p>
        <p className="text-xs text-slate-400 mt-1">
          Chọn một ảnh từ danh sách bên trái để xem và chỉnh sửa
        </p>
      </div>
    );
  }

  const currentDisplayUrl =
    showProcessed && item.processedDataUrl ? item.processedDataUrl : item.dataUrl;

  const handleZoomIn = () => setZoom((z) => Math.min(5, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.2, z - 0.25));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(5, z + 0.15));
    } else {
      setZoom((z) => Math.max(0.2, z - 0.15));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800">
      {/* Top Viewer Controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-slate-300 text-xs select-none">
        <div className="flex items-center gap-2 truncate max-w-[240px]">
          <span className="font-semibold text-slate-200 truncate">{item.name}</span>
          {item.width > 0 && (
            <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
              ({item.width}×{item.height})
            </span>
          )}
        </div>

        {/* View Toggle (Original vs Processed) */}
        {item.processedDataUrl && (
          <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700">
            <button
              onClick={() => setShowProcessed(false)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                !showProcessed ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gốc
            </button>
            <button
              onClick={() => setShowProcessed(true)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                showProcessed ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              Đã tối ưu
            </button>
          </div>
        )}

        {/* Zoom & Rotation Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onRotate(-90)}
            title="Xoay trái 90°"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRotate(90)}
            title="Xoay phải 90°"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

          <button
            onClick={handleZoomOut}
            title="Thu nhỏ (-)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-slate-400 w-9 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Phóng to (+)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Vừa màn hình (100%)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Canvas / Image Display Area */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          }}
          className="select-none inline-block shadow-2xl rounded-sm"
        >
          <img
            src={currentDisplayUrl}
            alt={item.name}
            className="max-h-[68vh] max-w-full object-contain pointer-events-none rounded border border-slate-800"
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Enhancements Bar */}
      <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEnhanceModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Chỉnh bộ lọc ảnh</span>
          </button>

          <button
            onClick={() => {
              onApplyEnhance({
                ...item.enhancement,
                grayscale: true,
                contrast: 35,
                brightness: 10,
                binarize: true,
                useOtsu: true,
                sharpen: true,
              });
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-900/40 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-700/50 rounded text-xs font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tự động tối ưu văn bản</span>
          </button>
        </div>

        <button
          onClick={() => onRunOCR(item.id)}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition shadow-sm disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>OCR lại ảnh này</span>
        </button>
      </div>
    </div>
  );
};
