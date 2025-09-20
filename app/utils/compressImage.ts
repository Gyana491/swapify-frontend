import Compressor from 'compressorjs'

export type CompressOptions = {
  quality?: number // 0..1 JPEG/WebP quality
  maxWidth?: number
  maxHeight?: number
  mimeType?: string // e.g., 'image/jpeg'
  convertSize?: number // Convert PNG to JPEG if larger than this (bytes)
}

export function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const {
    quality = 0.7,
    maxWidth = 1920,
    maxHeight = 1920,
    mimeType,
    convertSize = 500 * 1024, // 500KB
  } = options

  return new Promise((resolve) => {
    // Skip compression for very small files (< 100KB) to save time
    if (file.size < 100 * 1024) {
      return resolve(file)
    }

    try {
      new Compressor(file, {
        quality,
        maxWidth,
        maxHeight,
        mimeType,
        convertSize,
        success(result: File | Blob) {
          // Ensure we return a File instance
          if (result instanceof File) {
            resolve(result)
          } else {
            const f = new File([result], file.name.replace(/\.(png)$/i, '.jpg'), { type: mimeType || 'image/jpeg' })
            resolve(f)
          }
        },
        error(err: Error) {
          // On compression error, fall back to original file
          console.warn('Compression error, using original file:', err)
          resolve(file)
        },
      })
    } catch (e) {
      console.warn('Compression exception, using original file:', e)
      resolve(file)
    }
  })
}
