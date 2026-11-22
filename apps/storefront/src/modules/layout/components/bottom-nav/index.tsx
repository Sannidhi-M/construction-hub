"use client"

import { usePathname } from "next/navigation"
import { House, Phone, ShoppingBag, Tools, Users } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

type Item = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  // Pages that count as "inside" this item, for the highlight: the store
  // section covers product and category pages too.
  matches: string[]
}

const ITEMS: Item[] = [
  {
    label: "Materials",
    href: "/store",
    icon: ShoppingBag,
    matches: ["/store", "/products", "/categories", "/collections", "/cart"],
  },
  { label: "Labour", href: "/labour", icon: Users, matches: ["/labour"] },
  // Home sits in the middle.
  { label: "Home", href: "/", icon: House, matches: [] },
  {
    label: "Engineering",
    href: "/engineering",
    icon: Tools,
    matches: ["/engineering"],
  },
  { label: "Contact", href: "/contact", icon: Phone, matches: ["/contact"] },
]

/**
 * The phone's bottom tab bar: the same sections as the top navigation, which
 * a phone collapses into the Menu button, within thumb's reach. Shown only
 * below the `small` width (1024px), where the top links are hidden; rendered
 * by the (main) layout, so checkout (its own layout) doesn't have it. Its
 * height is 4rem plus the phone's bottom safe area; the WhatsApp button, the
 * free-shipping popup and the product page's fixed Add to cart bar sit above
 * it (they share `--bottom-nav-offset`, see globals.css).
 */
const BottomNav = () => {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main"
      className="small:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_8px_rgba(0,0,0,0.05)]"
      data-testid="bottom-nav"
    >
      <ul className="grid h-16 grid-cols-5">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : item.matches.some((prefix) => pathname.startsWith(prefix))
          const Icon = item.icon

          return (
            <li key={item.href} className="min-w-0">
              <LocalizedClientLink
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clx(
                  "flex h-full flex-col items-center justify-center gap-y-1 px-1 text-[11px] font-medium leading-none",
                  active ? "text-brand-600" : "text-gray-500"
                )}
                data-testid={`bottom-nav-${item.label.toLowerCase()}`}
              >
                <span
                  className={clx(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active ? "bg-brand-50" : ""
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="max-w-full truncate">{item.label}</span>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
