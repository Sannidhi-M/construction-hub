"use client"

import { usePathname } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

/**
 * Unlike the Airo reference (where these are client-side filter buttons
 * over one page), these are real links to each category's own route
 * (`/categories/[handle]`) — consistent with how this app already
 * structures categories (SEO-friendly URLs, shareable, no filter state to
 * duplicate), and how the homepage's category chips already work.
 */
const CategoryPills = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => {
  const pathname = usePathname()
  const isAllActive = pathname === "/store"

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <LocalizedClientLink
        href="/store"
        className={clx(
          "shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
          isAllActive
            ? "bg-brand-500 text-white shadow-sm"
            : "bg-gray-100 text-gray-900 hover:bg-brand-50 hover:text-brand-600"
        )}
      >
        All Materials
      </LocalizedClientLink>
      {categories
        .filter((c) => !c.parent_category)
        .map((category) => {
          const isActive = pathname === `/categories/${category.handle}`

          return (
            <LocalizedClientLink
              key={category.id}
              href={`/categories/${category.handle}`}
              className={clx(
                "shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                isActive
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-900 hover:bg-brand-50 hover:text-brand-600"
              )}
            >
              {category.name}
            </LocalizedClientLink>
          )
        })}
    </div>
  )
}

export default CategoryPills
