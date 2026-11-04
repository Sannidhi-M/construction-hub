import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"

// Public pages that are always present. Keep in step with the page list;
// private pages (cart, checkout, account, ...) are deliberately left out
// and are also disallowed in robots.ts.
const staticPaths = [
  "",
  "/store",
  "/labour",
  "/engineering",
  "/engineering/quote",
  "/engineering/other-services/quote",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/shipping-policy",
  "/cookie-policy",
  "/disclaimer",
  "/grievance",
  "/labour-terms",
  "/engineering-terms",
]

const PRODUCT_PAGE_SIZE = 100

// Fetches product handles page by page. Any backend failure here returns
// what was collected so far instead of failing the whole sitemap, so a
// temporarily unreachable backend never makes /sitemap.xml an error page.
const listProductHandles = async (): Promise<string[]> => {
  const handles: string[] = []
  try {
    let pageParam: number | null = 1
    while (pageParam) {
      const { response, nextPage } = await listProducts({
        pageParam,
        queryParams: { limit: PRODUCT_PAGE_SIZE, fields: "handle" },
      })
      handles.push(...response.products.map((p) => p.handle!).filter(Boolean))
      pageParam = nextPage
    }
  } catch (error) {
    console.error("sitemap: could not list products", error)
  }
  return handles
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()
  const lastModified = new Date()

  const [handles, categories, collections] = await Promise.all([
    listProductHandles(),
    listCategories().catch(() => []),
    listCollections().catch(() => ({ collections: [] })),
  ])

  return [
    ...staticPaths.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified,
      priority: path === "" ? 1 : 0.7,
    })),
    ...categories.map((c) => ({
      url: `${baseUrl}/categories/${c.handle}`,
      lastModified,
      priority: 0.8,
    })),
    ...collections.collections.map((c) => ({
      url: `${baseUrl}/collections/${c.handle}`,
      lastModified,
      priority: 0.6,
    })),
    ...handles.map((handle) => ({
      url: `${baseUrl}/products/${handle}`,
      lastModified,
      priority: 0.9,
    })),
  ]
}
