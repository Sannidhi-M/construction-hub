import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import MaterialsBanner from "@modules/store/components/materials-banner"
import MaterialsSearch from "@modules/store/components/materials-search"
import CategoryPills from "@modules/store/components/category-pills"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  optionValueIds,
  q,
  category,
}: {
  sortBy?: SortOptions
  page?: string
  optionValueIds?: OptionValueIds
  q?: string
  category?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const categories = (await listCategories()) ?? []
  // `category` is the handle from the URL (?category=cement) — resolve it
  // to the id PaginatedProducts/listProducts actually filter by.
  const categoryId = category
    ? categories.find((c) => c.handle === category)?.id
    : undefined

  const region = await getRegion()
  const { response } = region
    ? await listProducts({
        regionId: region.id,
        queryParams: {
          limit: 1,
          q,
          ...(categoryId ? { category_id: categoryId } : {}),
        },
      })
    : { response: { count: 0 } }

  return (
    <div data-testid="category-container">
      <MaterialsBanner />
      <div className="content-container py-8">
        <MaterialsSearch resultCount={response.count} />
        <CategoryPills categories={categories} />
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            optionValueIds={optionValueIds}
            q={q}
            categoryId={categoryId}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
