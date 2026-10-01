import { Suspense } from "react"
import { User } from "@medusajs/icons"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import LogoMark from "@modules/common/icons/logo-mark"
import NavLinks from "@modules/layout/components/nav-links"
import { SITE_NAME, SITE_LOCATION, SITE_PHONE } from "@lib/constants"

const primaryNavLinks = [
  { label: "Materials", href: "/store" },
  { label: "Labour & Manpower", href: "/labour" },
  { label: "Engineering Services", href: "/engineering" },
  { label: "Contact", href: "/contact" },
]

export default async function Nav() {
  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      {/* Top utility bar — real contact info (src/lib/constants.tsx), not
          the Airo reference's placeholder number. */}
      <div className="hidden small:block bg-brand-500 text-white">
        <div className="content-container flex items-center justify-center gap-x-2 h-10 text-sm font-medium">
          <span>Serving {SITE_LOCATION}</span>
          <span aria-hidden="true">|</span>
          <a href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`} className="hover:underline">
            Call us: {SITE_PHONE}
          </a>
        </div>
      </div>

      <header className="relative h-16 mx-auto bg-white border-b border-ui-border-base shadow-sm">
        <nav className="content-container flex items-center justify-between w-full h-full">
          <div className="flex items-center h-full gap-x-4">
            <div className="h-full small:hidden">
              <SideMenu />
            </div>
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-x-2"
              data-testid="nav-store-link"
            >
              <LogoMark size="30" color="#F97415" />
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                {SITE_NAME}
              </span>
            </LocalizedClientLink>
          </div>

          <div className="hidden small:flex items-center gap-x-1 h-full">
            <NavLinks links={primaryNavLinks} />
          </div>

          <div className="flex items-center gap-x-6 h-full">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="flex items-center gap-x-1.5 text-sm font-semibold text-gray-900 hover:text-brand-500 transition-colors"
                href="/account"
                data-testid="nav-account-link"
              >
                <User />
                Sign In
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="inline-flex items-center gap-x-2 rounded-md bg-brand-500 text-white px-3 h-9 text-sm font-semibold hover:bg-brand-600 transition-colors"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
