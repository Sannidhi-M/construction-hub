"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Adjustments, MagnifyingGlass } from "@medusajs/icons"

/**
 * Wired to the real `q` search param (Medusa's Store Product List API
 * supports full-text search natively — see `listProducts`/
 * `PaginatedProducts`) rather than being decorative. Debounced so typing
 * doesn't trigger a navigation on every keystroke.
 */
const MaterialsSearch = ({ resultCount }: { resultCount: number }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set("q", value)
      } else {
        params.delete("q")
      }
      params.delete("page")

      router.push(`${pathname}?${params.toString()}`)
    }, 400)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search materials, brands..."
          className="w-full h-10 rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
        <Adjustments />
        {resultCount} {resultCount === 1 ? "product" : "products"}
      </div>
    </div>
  )
}

export default MaterialsSearch
