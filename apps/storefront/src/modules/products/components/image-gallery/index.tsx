"use client"

import { useState } from "react"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import { clx } from "@modules/common/components/ui"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  title: string
}

/**
 * One large photo with a row of thumbnails under it (click to swap). A
 * product with a single photo shows no thumbnails; one with none shows a
 * neutral placeholder rather than an empty box.
 */
const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const photos = images.filter((image) => !!image.url)
  const [selected, setSelected] = useState(0)
  const current = photos[Math.min(selected, photos.length - 1)]

  return (
    <div className="flex flex-col gap-y-3" data-testid="image-gallery">
      <div className="relative aspect-square w-full overflow-hidden rounded-large border border-gray-200 bg-gray-50">
        {current ? (
          <Image
            src={current.url}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <PlaceholderImage size={32} />
          </div>
        )}
      </div>
      {photos.length > 1 && (
        <ul className="flex flex-wrap gap-2">
          {photos.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === selected}
                className={clx(
                  "relative block h-16 w-16 overflow-hidden rounded-lg border bg-gray-50",
                  index === selected
                    ? "border-2 border-brand-500"
                    : "border-gray-200 hover:border-gray-400"
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ImageGallery
