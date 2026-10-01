import { HttpTypes } from "@medusajs/types"
import { listProducts } from "@lib/data/products"
import { Heading } from "@modules/common/components/ui"
import ShopCard from "@modules/products/components/shop-card"

/**
 * One representative product per category, not hardcoded IDs — so this
 * keeps working if the catalog is reseeded. "Tiles" is excluded: it has
 * no seeded products yet (see docs/PROGRESS.md, Phase 1).
 */
const TrendingProducts = async ({
  categories,
  region,
}: {
  categories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
}) => {
  const eligibleCategories = categories
    .filter((c) => !c.parent_category && c.name !== "Tiles")
    .slice(0, 5)

  const products = (
    await Promise.all(
      eligibleCategories.map(async (category) => {
        const {
          response: { products: categoryProducts },
        } = await listProducts({
          regionId: region.id,
          queryParams: {
            category_id: category.id,
            limit: 1,
            fields: "*variants.calculated_price",
          },
        })

        return categoryProducts[0]
      })
    )
  ).filter((p): p is HttpTypes.StoreProduct => !!p)

  if (!products.length) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-x-3 mb-6">
        <span className="w-1 h-6 bg-brand-500 rounded-full" aria-hidden="true" />
        <Heading level="h3" className="text-xl font-bold">
          Trending Products
        </Heading>
      </div>
      <div className="grid grid-cols-2 xsmall:grid-cols-3 medium:grid-cols-5 gap-6">
        {products.map((product) => (
          <ShopCard key={product.id} product={product} region={region} />
        ))}
      </div>
    </div>
  )
}

export default TrendingProducts
