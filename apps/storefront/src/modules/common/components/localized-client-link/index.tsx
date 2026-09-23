"use client"

import Link from "next/link"
import React from "react"

/**
 * Thin wrapper around Next.js `<Link />`. Kept as its own component (rather
 * than replacing every usage with `next/link` directly) so call sites don't
 * need to change if a locale/region prefix is reintroduced later.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: unknown
}) => {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
