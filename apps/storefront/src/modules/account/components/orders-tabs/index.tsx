import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type OrdersTab = "materials" | "labour" | "engineering"

const TABS: { id: OrdersTab; label: string; href: string }[] = [
  { id: "materials", label: "Materials", href: "/account/orders" },
  { id: "labour", label: "Labour", href: "/account/orders?tab=labour" },
  { id: "engineering", label: "Engineering", href: "/account/orders?tab=engineering" },
]

// Plain links driven by a `?tab=` search param (not client state), so each
// tab is bookmarkable/shareable and the page only fetches the active tab's
// data — Materials stays the default, so the existing /account/orders URL
// (and every link to it) keeps working unchanged.
const OrdersTabs = ({ active }: { active: OrdersTab }) => (
  <nav
    className="flex gap-x-6 border-b border-gray-200 mb-8"
    aria-label="Order types"
    data-testid="orders-tabs"
  >
    {TABS.map((tab) => {
      const isActive = tab.id === active
      return (
        <LocalizedClientLink
          key={tab.id}
          href={tab.href}
          aria-current={isActive ? "page" : undefined}
          className={`pb-3 -mb-px border-b-2 txt-medium-plus ${
            isActive
              ? "border-brand-500 text-brand-600"
              : "border-transparent text-ui-fg-subtle hover:text-ui-fg-base"
          }`}
          data-testid={`orders-tab-${tab.id}`}
        >
          {tab.label}
        </LocalizedClientLink>
      )
    })}
  </nav>
)

export default OrdersTabs
