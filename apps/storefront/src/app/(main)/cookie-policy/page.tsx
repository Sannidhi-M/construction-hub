import { Metadata } from "next"
import LegalPage, {
  LegalSection,
} from "@modules/legal/components/legal-page"
import { SITE_EMAIL, SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `Cookie Policy | ${SITE_NAME}`,
  description: `The cookies ${SITE_NAME} uses to keep you signed in and remember your cart, and how to control them.`,
}

// Keep in step with the cookies actually set in lib/data/cookies.ts and
// middleware.ts — add a row whenever a new cookie is introduced.
const cookies = [
  {
    name: "_medusa_jwt",
    purpose: "Keeps you signed in to your account.",
    duration: "7 days",
  },
  {
    name: "_medusa_cart_id",
    purpose: "Remembers your cart while you shop and check out.",
    duration: "1 day",
  },
  {
    name: "_medusa_cache_id",
    purpose: "Helps the site show you up-to-date pages and prices.",
    duration: "1 day",
  },
  {
    name: "_medusa_pending_customer",
    purpose: "Holds your details briefly while you verify a new account.",
    duration: "1 day",
  },
]

const sections: LegalSection[] = [
  {
    id: "what",
    title: "What cookies are",
    content: (
      <p>
        Cookies are small text files that a website stores in your browser. They
        let the site remember things between pages and visits, such as that you
        are signed in or what is in your cart.
      </p>
    ),
  },
  {
    id: "use",
    title: "How we use them",
    content: (
      <>
        <p>
          {SITE_NAME} uses only <strong>essential cookies</strong>. These are
          needed for the site to work: signing in, keeping your cart and
          completing checkout. They are set when you use those features.
        </p>
        <p>
          We do <strong>not</strong> currently use cookies for advertising,
          tracking you across other websites, or analytics. If that changes,
          we will update this page and ask for your consent first where the
          law requires it.
        </p>
      </>
    ),
  },
  {
    id: "list",
    title: "The cookies we set",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border border-gray-200">
          <thead className="bg-gray-50 text-gray-900">
            <tr>
              <th className="px-3 py-2 font-semibold">Cookie</th>
              <th className="px-3 py-2 font-semibold">Purpose</th>
              <th className="px-3 py-2 font-semibold">Lasts</th>
            </tr>
          </thead>
          <tbody>
            {cookies.map((c) => (
              <tr key={c.name} className="border-t border-gray-200 align-top">
                <td className="px-3 py-2 font-mono text-xs">{c.name}</td>
                <td className="px-3 py-2">{c.purpose}</td>
                <td className="px-3 py-2 whitespace-nowrap">{c.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "third-party",
    title: "Third-party cookies",
    content: (
      <p>
        If you tap a link or button that opens another service, such as
        WhatsApp or Google Maps, that service may set its own cookies under its
        own policy. We do not control them.
      </p>
    ),
  },
  {
    id: "control",
    title: "Controlling cookies",
    content: (
      <>
        <p>
          You can block or delete cookies in your browser settings. Because ours
          are essential, blocking them means you will not be able to stay signed
          in, keep a cart or place an order. Signing out removes your login
          cookie, and completing or emptying your cart removes the cart cookie.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Questions",
    content: (
      <p>
        See our Privacy Policy for how we handle personal information, or
        contact us at <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>.
      </p>
    ),
  },
]

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      description="The cookies we use to keep you signed in and remember your cart, and how to control them."
      lastUpdated="4 November 2026"
      sections={sections}
    />
  )
}
