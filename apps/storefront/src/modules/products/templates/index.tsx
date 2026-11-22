import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading } from "@modules/common/components/ui"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const category = product.categories?.[0]

  return (
    <>
      <div
        className="content-container max-w-5xl py-6"
        data-testid="product-container"
      >
        <nav
          aria-label="Breadcrumb"
          className="txt-small text-ui-fg-subtle flex flex-wrap items-center gap-x-2"
        >
          <LocalizedClientLink href="/" className="hover:text-ui-fg-base">
            Home
          </LocalizedClientLink>
          <span aria-hidden>/</span>
          <LocalizedClientLink href="/store" className="hover:text-ui-fg-base">
            Materials
          </LocalizedClientLink>
          {category && (
            <>
              <span aria-hidden>/</span>
              <LocalizedClientLink
                href={`/store?category=${category.handle}`}
                className="hover:text-ui-fg-base"
              >
                {category.name}
              </LocalizedClientLink>
            </>
          )}
          <span aria-hidden>/</span>
          <span className="text-ui-fg-base">{product.title}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-8 medium:grid-cols-2 medium:gap-10">
          <div className="medium:sticky medium:top-32 medium:self-start">
            <ImageGallery images={images} title={product.title} />
          </div>
          <div className="flex flex-col gap-y-4">
            <div>
              {category && (
                <LocalizedClientLink
                  href={`/store?category=${category.handle}`}
                  className="text-xs font-semibold uppercase tracking-widest text-brand-600"
                >
                  {category.name}
                </LocalizedClientLink>
              )}
              <Heading
                level="h1"
                className="mt-1 text-3xl small:text-4xl font-bold leading-tight text-gray-900"
                data-testid="product-title"
              >
                {product.title}
              </Heading>
            </div>
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
        </div>

        <div className="mt-10">
          <ProductTabs product={product} />
        </div>
      </div>
      <div
        className="content-container max-w-5xl my-16 small:my-20"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
