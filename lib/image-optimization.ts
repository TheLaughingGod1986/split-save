import sharp from 'sharp'
import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'
import imageminPngquant from 'imagemin-pngquant'
import imageminMozjpeg from 'imagemin-mozjpeg'

export interface OptimizedImage {
  original: Buffer
  webp: Buffer
  optimized: Buffer
  sizes: {
    thumbnail: Buffer
    small: Buffer
    medium: Buffer
    large: Buffer
  }
}

export interface ImageOptimizationOptions {
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  resize?: {
    width?: number
    height?: number
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  }
}

/**
 * Optimize an image with multiple formats and sizes
 */
export async function optimizeImage(
  input: Buffer | string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    quality = 80,
    format = 'webp',
    resize
  } = options

  let image = sharp(input)

  // Apply resize if specified
  if (resize) {
    image = image.resize(resize.width, resize.height, {
      fit: resize.fit || 'cover'
    })
  }

  // Generate different sizes
  const sizes = {
    thumbnail: await image.clone().resize(150, 150, { fit: 'cover' }).toBuffer(),
    small: await image.clone().resize(300, 300, { fit: 'cover' }).toBuffer(),
    medium: await image.clone().resize(600, 600, { fit: 'cover' }).toBuffer(),
    large: await image.clone().resize(1200, 1200, { fit: 'cover' }).toBuffer()
  }

  // Generate WebP version
  const webp = await image.clone()
    .webp({ quality })
    .toBuffer()

  // Generate optimized version based on format
  let optimized: Buffer
  switch (format) {
    case 'webp':
      optimized = webp
      break
    case 'jpeg':
      optimized = await image.clone()
        .jpeg({ quality, progressive: true })
        .toBuffer()
      break
    case 'png':
      optimized = await image.clone()
        .png({ quality, progressive: true })
        .toBuffer()
      break
    default:
      optimized = webp
  }

  // Further optimize with imagemin
  const [minifiedWebp, minifiedOptimized] = await Promise.all([
    imagemin.buffer(webp, {
      plugins: [imageminWebp({ quality })]
    }),
    imagemin.buffer(optimized, {
      plugins: [
        ...(format === 'jpeg' ? [imageminMozjpeg({ quality })] : []),
        ...(format === 'png' ? [imageminPngquant({ quality: [0.6, 0.8] })] : [])
      ]
    })
  ])

  return {
    original: Buffer.isBuffer(input) ? input : Buffer.from(input),
    webp: Buffer.from(minifiedWebp),
    optimized: Buffer.from(minifiedOptimized),
    sizes
  }
}

/**
 * Generate responsive image srcset for HTML
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: { [key: string]: number }
): string {
  return Object.entries(sizes)
    .map(([name, width]) => `${baseUrl}-${name}.webp ${width}w`)
    .join(', ')
}

/**
 * Generate picture element HTML with fallbacks
 */
export function generatePictureElement(
  src: string,
  alt: string,
  sizes: string = '100vw',
  className?: string
): string {
  const baseName = src.replace(/\.[^/.]+$/, '')
  
  return `
    <picture class="${className || ''}">
      <source
        type="image/webp"
        srcset="${generateSrcSet(baseName, {
          thumbnail: 150,
          small: 300,
          medium: 600,
          large: 1200
        })}"
        sizes="${sizes}"
      />
      <img
        src="${src}"
        alt="${alt}"
        loading="lazy"
        decoding="async"
        class="${className || ''}"
      />
    </picture>
  `.trim()
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalFormat(): 'webp' | 'jpeg' | 'png' {
  // In a real app, you'd detect browser support
  // For now, default to webp with jpeg fallback
  return 'webp'
}

/**
 * Calculate optimal image dimensions based on container
 */
export function calculateOptimalDimensions(
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number = 16 / 9
): { width: number; height: number } {
  const containerAspect = containerWidth / containerHeight

  if (containerAspect > aspectRatio) {
    // Container is wider than image
    return {
      width: Math.round(containerHeight * aspectRatio),
      height: containerHeight
    }
  } else {
    // Container is taller than image
    return {
      width: containerWidth,
      height: Math.round(containerWidth / aspectRatio)
    }
  }
}
