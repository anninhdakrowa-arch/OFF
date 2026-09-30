import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Sliders,
  RotateCw,
  RefreshCw,
  Check,
  Play,
  CopyCheck,
} from 'lucide-react';
import { ImageEnhancementOptions, ImageItem } from '../types/ocr';
import { processImage, defaultEnhancement } from '../services/imageProcessor';

interface ImageEnhanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ImageItem | null;
  onSaveEnhancement: (id: string, options: ImageEnhancementOptions, processedUrl: string) => void;
  onApplyToAll: (options: ImageEnhancementOptions) => void;
  onRunOCR: (id: string) => void;
}

export const ImageEnhanceModal: React.FC<ImageEnhanceModalProps> = ({
  isOpen,
  onClose,
  item,
  onSaveEnhancement,
  onApplyToAll,
  onRunOCR,
}) => {
  const [options, setOptions] = useState<ImageEnhancementOptions>(defaultEnhancement);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (item) {
      setOptions(item.enhancement || defaultEnhancement);
    }
  }, [item]);

  // Re-generate preview when options change
  useEffect(() => {
    let active = true;
    if (!item?.dataUrl) return;

    setIsProcessing(true);
    const timer = setTimeout(async () => {
      try {
        const url = await processImage(item.dataUrl, options);
        if (active) {
          setPreviewUrl(url);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Error generating preview:', err);
        if (active) setIsProcessing(false);
      }
    }, 120);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [item?.dataUrl, options]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    onSaveEnhancement(item.id, options, previewUrl);
    onClose();
  };

  const handleSaveAndOCR = () => {
    onSaveEnhancement(item.id, options, previewUrl);
    onClose();
    onRunOCR(item.id);
  };

  const handleApplyAll = () => {
    if (window.confirm('Áp dụng thiết lập bộ lọc này cho TOÀN BỘ các ảnh trong dự án?')) {
      onApplyToAll(options);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Bộ lọc cải thiện chất lượng ảnh tài liệu
              </h3>
              <p className="text-xs text-slate-400">
                Tăng độ tương phản, khử nhiễu nền và nhị phân hóa để nhận dạng chữ tiếng Việt sắc nét nhất
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

        {/* Modal Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Controls Panel */}
          <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto space-y-5 text-xs text-slate-300">
            {/* Rotation */}
            <div>
              <label className="block font-semibold text-slate-200 mb-2">
                Xoay trang:
              </label>
              <div className="flex items-center gap-2">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setOptions({ ...options, rotation: deg })}
                    className={`flex-1 py-1.5 rounded font-mono text-xs border transition ${
                      options.rotation === deg
                        ? 'bg-blue-600 text-white border-blue-500 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* Binarization Toggle */}
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="font-semibold text-slate-200">
                  Tẩy trắng nền (Binarize / Nhị phân)
                </span>
                <input
                  type="checkbox"
                  checked={options.binarize}
                  onChange={(e) =>
                    setOptions({ ...options, binarize: e.target.checked })
                  }
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                />
              </label>
              <p className="text-[11px] text-slate-400">
                Tự động chuyển tài liệu sang chữ đen trên nền giấy trắng tinh khiết, loại bỏ bóng mờ và vết ố vàng.
              </p>

              {options.binarize && (
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="threshold_mode"
                      checked={options.useOtsu}
                      onChange={() => setOptions({ ...options, useOtsu: true })}
                      className="text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300">
                      Thuật toán Otsu tự động (Khuyên dùng)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="threshold_mode"
                      checked={!options.useOtsu}
                      onChange={() => setOptions({ ...options, useOtsu: false })}
                      className="text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Chỉnh ngưỡng thủ công:</span>
                  </label>

                  {!options.useOtsu && (
                    <div className="pl-6 flex items-center gap-3">
                      <input
                        type="range"
                        min="50"
                        max="220"
                        value={options.threshold}
                        onChange={(e) =>
                          setOptions({
                            ...options,
                            threshold: Number(e.target.value),
                          })
                        }
                        className="flex-1 accent-blue-500"
                      />
                      <span className="font-mono text-slate-400 w-8 text-right">
                        {options.threshold}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contrast & Brightness */}
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-medium text-slate-300">Độ tương phản (Contrast):</span>
                  <span className="font-mono text-slate-400">{options.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="100"
                  value={options.contrast}
                  onChange={(e) =>
                    setOptions({ ...options, contrast: Number(e.target.value) })
                  }
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-medium text-slate-300">Độ sáng (Brightness):</span>
                  <span className="font-mono text-slate-400">{options.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={options.brightness}
                  onChange={(e) =>
                    setOptions({ ...options, brightness: Number(e.target.value) })
                  }
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            {/* Denoise & Sharpen checkboxes */}
            <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.sharpen}
                  onChange={(e) =>
                    setOptions({ ...options, sharpen: e.target.checked })
                  }
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span className="text-slate-200">
                  Làm nét đường viền ký tự (Sharpen)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.denoise}
                  onChange={(e) =>
                    setOptions({ ...options, denoise: e.target.checked })
                  }
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span className="text-slate-200">
                  Khử đốm bụi máy quét (Denoise Filter)
                </span>
              </label>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2">
              <button
                onClick={() => setOptions(defaultEnhancement)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                Đặt lại mặc định
              </button>
              <button
                onClick={handleApplyAll}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <CopyCheck className="w-3.5 h-3.5" />
                <span>Áp dụng tất cả</span>
              </button>
            </div>
          </div>

          {/* Side-by-side Preview Panel */}
          <div className="lg:col-span-7 bg-slate-950 p-4 flex flex-col items-center justify-center overflow-hidden relative">
            {isProcessing && (
              <div className="absolute top-4 right-4 bg-slate-900/90 text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/30 flex items-center gap-1.5 shadow-lg z-10">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Đang xử lý ảnh...</span>
              </div>
            )}

            <div className="w-full h-full flex items-center justify-center p-2">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Xem trước cải thiện"
                  className="max-h-[65vh] max-w-full object-contain rounded shadow-2xl border border-slate-800"
                />
              ) : (
                <div className="text-slate-500">Đang chuẩn bị xem trước...</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
          >
            Hủy bỏ
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Lưu bộ lọc cho ảnh này</span>
            </button>

            <button
              onClick={handleSaveAndOCR}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/30 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Áp dụng & OCR lại ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
