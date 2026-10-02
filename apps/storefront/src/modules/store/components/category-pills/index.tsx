"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"

/**
 * Filters the same page's product grid via the `category` query param
 * (same pattern as the search bar's `q` param) instead of navigating to
 * `/categories/[handle]` — matches the Airo reference's own behavior
 * (client-side filter buttons over one page), which the user explicitly
 * asked for after seeing the pills/banner/search disappear on navigation.
 */
const CategoryPills = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeHandle = searchParams.get("category")

  const setCategory = (handle: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (handle) {
      params.set("category", handle)
    } else {
      params.delete("category")
    }
    params.delete("page")

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const pillClass = (isActive: boolean) =>
    clx(
      "shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
      isActive
        ? "bg-brand-500 text-white shadow-sm"
        : "bg-gray-100 text-gray-900 hover:bg-brand-50 hover:text-brand-600"
    )

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        type="button"
        onClick={() => setCategory(null)}
        className={pillClass(!activeHandle)}
      >
        All Materials
      </button>
      {categories
        .filter((c) => !c.parent_category)
        .map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategory(category.handle)}
            className={pillClass(activeHandle === category.handle)}
          >
            {category.name}
          </button>
        ))}
    </div>
  )
}

export default CategoryPills
