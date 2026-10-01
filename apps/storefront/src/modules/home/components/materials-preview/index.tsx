import { HttpTypes } from "@medusajs/types"
import SectionHeading from "@modules/home/components/section-heading"
import CategoryChips from "@modules/home/components/category-chips"
import TrendingProducts from "@modules/home/components/trending-products"

const MaterialsPreview = ({
  categories,
  region,
}: {
  categories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
}) => {
  return (
    <div className="w-full bg-white">
      <div className="content-container py-16">
        <SectionHeading
          eyebrow="Platform 1"
          title="Construction Materials"
          description="Prices updated every morning. Order online, delivered to your site."
          viewAllHref="/store"
        />
        <CategoryChips categories={categories} />
        <TrendingProducts categories={categories} region={region} />
      </div>
    </div>
  )
}

export default MaterialsPreview
