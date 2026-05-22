import React from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

export interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string
  alt: string
  fallbackSrc?: string
  showPlaceholder?: boolean
}

/**
 * Optimized Image Component
 *
 * Wrapper around next/image with default optimizations:
 * - Blur placeholder
 * - Lazy loading
 * - Error fallback
 * - Responsive sizes
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  showPlaceholder = true,
  className,
  loading = 'lazy',
  quality = 85,
  sizes,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // Default responsive sizes if not provided
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        loading={loading}
        quality={quality}
        sizes={defaultSizes}
        className={cn(
          'transition-opacity duration-300',
          isLoading && showPlaceholder ? 'opacity-0' : 'opacity-100'
        )}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />

      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 bg-muted animate-pulse" aria-hidden="true" />
      )}
    </div>
  )
}

export default OptimizedImage
