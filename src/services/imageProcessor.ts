import { ImageEnhancementOptions } from '../types/ocr';

export const defaultEnhancement: ImageEnhancementOptions = {
  grayscale: true,
  contrast: 25,
  brightness: 10,
  binarize: true,
  threshold: 128,
  useOtsu: true,
  denoise: true,
  sharpen: true,
  rotation: 0,
};

/**
 * Calculates Otsu's threshold from grayscale pixel array
 */
function calculateOtsuThreshold(data: Uint8ClampedArray): number {
  const histogram = new Array(256).fill(0);
  const totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]]++;
  }

  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = totalPixels - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const variance = wB * wF * (mB - mF) * (mB - mF);
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }

  return threshold;
}

/**
 * Applies 3x3 convolution kernel (e.g. for sharpening)
 */
function applyConvolution3x3(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  kernel: number[]
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = ((y + ky) * width + (x + kx)) * 4;
          const kVal = kernel[(ky + 1) * 3 + (kx + 1)];
          r += src[px] * kVal;
          g += src[px + 1] * kVal;
          b += src[px + 2] * kVal;
        }
      }
      const idx = (y * width + x) * 4;
      dst[idx] = Math.min(255, Math.max(0, r));
      dst[idx + 1] = Math.min(255, Math.max(0, g));
      dst[idx + 2] = Math.min(255, Math.max(0, b));
      dst[idx + 3] = src[idx + 3];
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Fast 3x3 median filter for removing speckle noise in scanned documents
 */
function applyMedianFilter3x3(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;
  const window = new Uint8Array(9);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let wIdx = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = ((y + ky) * width + (x + kx)) * 4;
          window[wIdx++] = src[px]; // grayscale: r = g = b
        }
      }
      // Sort 9 elements
      window.sort();
      const med = window[4];

      const idx = (y * width + x) * 4;
      dst[idx] = med;
      dst[idx + 1] = med;
      dst[idx + 2] = med;
      dst[idx + 3] = src[idx + 3];
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Process an image according to specified enhancement options
 */
export async function processImage(
  imageSource: string | HTMLImageElement,
  options: ImageEnhancementOptions
): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    if (typeof imageSource === 'string') {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = imageSource;
    } else {
      resolve(imageSource);
    }
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Cannot create 2d canvas context');

  // Handle rotation
  const rad = ((options.rotation % 360) * Math.PI) / 180;
  const isPerpendicular = Math.abs(options.rotation % 180) === 90;

  canvas.width = isPerpendicular ? img.naturalHeight || img.height : img.naturalWidth || img.width;
  canvas.height = isPerpendicular ? img.naturalWidth || img.width : img.naturalHeight || img.height;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();

  const width = canvas.width;
  const height = canvas.height;

  // Pixel data processing
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Grayscale & Brightness / Contrast
  const contrastFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
  const brightness = options.brightness;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (options.grayscale) {
      // Human perceptual luminance (Rec. 709)
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray;
      g = gray;
      b = gray;
    }

    if (options.brightness !== 0) {
      r += brightness;
      g += brightness;
      b += brightness;
    }

    if (options.contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  // Binarization (Otsu threshold or manual threshold)
  if (options.binarize) {
    let thresholdVal = options.threshold;
    if (options.useOtsu) {
      thresholdVal = calculateOtsuThreshold(data);
    }

    for (let i = 0; i < data.length; i += 4) {
      const v = data[i] > thresholdVal ? 255 : 0;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Denoise
  if (options.denoise && !options.binarize) {
    applyMedianFilter3x3(ctx, width, height);
  }

  // Sharpen
  if (options.sharpen && !options.binarize) {
    // 3x3 sharpen kernel
    const sharpenKernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    applyConvolution3x3(ctx, width, height, sharpenKernel);
  }

  return canvas.toDataURL('image/png');
}
