"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

export type NavLink = {
  label: string
  href: string
}

const NavLinks = ({ links }: { links: NavLink[] }) => {
  const pathname = usePathname()

  return (
    <>
      {links.map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)

        return (
          <LocalizedClientLink
            key={link.href}
            href={link.href}
            className={clx(
              "px-4 py-2 text-sm font-semibold rounded-md transition-colors",
              isActive
                ? "text-brand-500 bg-brand-50"
                : "text-gray-900 hover:text-brand-500 hover:bg-brand-50"
            )}
            data-testid={`nav-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-link`}
          >
            {link.label}
          </LocalizedClientLink>
        )
      })}
    </>
  )
}

export default NavLinks
