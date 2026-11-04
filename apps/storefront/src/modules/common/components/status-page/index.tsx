import Link from "next/link"
import { ReactNode } from "react"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { SITE_EMAIL, SITE_PHONE } from "@lib/constants"

type StatusPageProps = {
  // Big label above the title, e.g. "404".
  code: string
  title: string
  message: ReactNode
  // Optional extra action (e.g. "Try again" on the error page).
  action?: ReactNode
}

const quickLinks = [
  { label: "Shop Materials", href: "/store" },
  { label: "Book Labour", href: "/labour" },
  { label: "Engineering Services", href: "/engineering" },
  { label: "Contact Us", href: "/contact" },
]

/**
 * Shared "something isn't here / went wrong" page, so the 404 and error
 * screens read as part of the site and always offer a way forward. Uses a
 * plain next/link (not LocalizedClientLink) so it also works in the root
 * not-found, which renders outside the (main) layout.
 */
const StatusPage = ({ code, title, message, action }: StatusPageProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-y-4 min-h-[calc(100vh-64px)] px-4 py-16 bg-gray-50">
      <Text className="text-6xl font-extrabold text-brand-500">{code}</Text>
      <Heading level="h1" className="text-2xl small:text-3xl font-bold text-gray-900">
        {title}
      </Heading>
      <Text className="text-gray-600 max-w-md">{message}</Text>

      <div className="flex flex-col xsmall:flex-row gap-3 mt-2">
        {action}
        <Link href="/">
          <Button variant={action ? "secondary" : "primary"} size="large">
            Go to homepage
          </Button>
        </Link>
      </div>

      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4 text-sm">
        {quickLinks.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-brand-600 hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <Text className="text-sm text-gray-500 mt-2">
        Need help? Call {SITE_PHONE} or email{" "}
        <a href={`mailto:${SITE_EMAIL}`} className="text-brand-600 hover:underline">
          {SITE_EMAIL}
        </a>
        .
      </Text>
    </div>
  )
}

export default StatusPage
