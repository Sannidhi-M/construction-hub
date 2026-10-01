import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * A category's thumbnail is stored in its `metadata.image_url` (Medusa
 * categories have no native image field) — set it per category from
 * Admin > Categories > edit > Metadata. Falls back to a neutral square
 * when unset, so a category never needs to block on having a photo.
 */
const getCategoryImageUrl = (
  category: HttpTypes.StoreProductCategory
): string | undefined => {
  const value = category.metadata?.image_url
  return typeof value === "string" ? value : undefined
}

const CategoryChips = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-10">
      {categories.map((category) => {
        const imageUrl = getCategoryImageUrl(category)

        return (
          <LocalizedClientLink
            key={category.id}
            href={`/categories/${category.handle}`}
            className="flex items-center gap-2.5 shrink-0 bg-gray-100 hover:bg-brand-500 hover:text-white border border-gray-300 hover:border-brand-500 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt=""
                width={28}
                height={28}
                className="w-7 h-7 rounded object-cover"
              />
            ) : (
              <span className="w-7 h-7 rounded bg-gray-300" aria-hidden="true" />
            )}
            {category.name}
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}

export default CategoryChips
