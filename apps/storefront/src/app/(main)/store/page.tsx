import { Metadata } from "next"

import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `Construction Materials | ${SITE_NAME}`,
  description: "Construction materials, priced daily, delivered to your site.",
}

type StorePageSearchParams = Record<string, string | string[] | undefined> & {
  sortBy?: SortOptions
  page?: string
  optionValueIds?: string | string[]
  q?: string
  category?: string
}

type Params = {
  searchParams: Promise<StorePageSearchParams>
}

export default async function StorePage(props: Params) {
  const searchParams = await props.searchParams;
  const { sortBy, page, q, category } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      optionValueIds={optionValueIds}
      q={q}
      category={category}
    />
  )
}
