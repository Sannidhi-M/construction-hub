"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

/**
 * Description and specifications, each shown only when the product has
 * something to say — a product with no description and no specification
 * values renders nothing at all (rather than a table of dashes). Open by
 * default: there are at most two short sections.
 */
const ProductTabs = ({ product }: ProductTabsProps) => {
  const specs = specifications(product)
  const tabs = [
    product.description?.trim()
      ? {
          label: "Description",
          component: (
            <p className="text-small-regular py-4 whitespace-pre-line text-ui-fg-subtle">
              {product.description}
            </p>
          ),
        }
      : null,
    specs.length
      ? {
          label: "Specifications",
          component: (
            <dl className="grid grid-cols-[150px_1fr] gap-x-4 gap-y-2 py-4 text-small-regular">
              {specs.map(([name, value]) => (
                <div key={name} className="contents">
                  <dt className="font-medium text-gray-900">{name}</dt>
                  <dd className="text-ui-fg-subtle">{value}</dd>
                </div>
              ))}
            </dl>
          ),
        }
      : null,
  ].filter((tab): tab is NonNullable<typeof tab> => !!tab)

  if (!tabs.length) {
    return null
  }

  return (
    <div className="w-full" data-testid="product-details">
      <Accordion type="multiple" defaultValue={tabs.map((tab) => tab.label)}>
        {tabs.map((tab) => (
          <Accordion.Item
            key={tab.label}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const specifications = (product: HttpTypes.StoreProduct) =>
  (
    [
      ["Material", product.material],
      ["Type", product.type?.value],
      ["Country of origin", product.origin_country],
      ["Weight", product.weight ? `${product.weight} g` : null],
      [
        "Dimensions",
        product.length && product.width && product.height
          ? `${product.length}L x ${product.width}W x ${product.height}H`
          : null,
      ],
    ] as [string, string | null | undefined][]
  ).filter((row): row is [string, string] => !!row[1])

export default ProductTabs
