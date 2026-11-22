"use client"

import { useState } from "react"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import { Button, clx } from "@modules/common/components/ui"
import { usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Modal from "@modules/common/components/modal"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import User from "@modules/common/icons/user"
import { IconProps } from "types/icon"

// `shortLabel` is the phone tab's label; the side navigation uses `label`.
const navItems = [
  { href: "/account/profile", label: "Profile Information", shortLabel: "Profile", icon: User, testId: "profile-link" },
  { href: "/account/addresses", label: "Manage Addresses", shortLabel: "Addresses", icon: MapPin, testId: "addresses-link" },
  { href: "/account/orders", label: "My Orders & Requests", shortLabel: "Orders", icon: Package, testId: "orders-link" },
]

// A section stays highlighted on its sub-pages too (an order's details page is
// still "Orders").
const isActive = (route: string, href: string) =>
  route === href || route.startsWith(`${href}/`)

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()

  // Logging out is one mis-click away from losing the session (and an
  // unfinished booking or cart), so it asks first.
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div data-testid="account-nav">
      {/* Phone: a compact strip (name and Log out on one line, the sections as
          tabs under it) instead of a stacked card that pushes the page down.
          From the `small` width it becomes the side navigation below. */}
      <div className="small:hidden" data-testid="account-nav-mobile">
        <div className="flex items-center justify-between px-1 pb-3">
          <span className="text-small-regular text-gray-500">
            Hello {customer?.first_name}
          </span>
          <button
            type="button"
            onClick={() => setConfirmingLogout(true)}
            className="inline-flex items-center gap-x-1.5 text-small-regular font-medium text-gray-600 hover:text-rose-600"
            data-testid="logout-button-mobile"
          >
            <ArrowRightOnRectangle />
            Log out
          </button>
        </div>
        <ul className="flex gap-x-2 overflow-x-auto pb-1 -mx-1 px-1">
          {navItems.map(({ href, shortLabel, icon: Icon, testId }) => {
            const active = isActive(route!, href)
            return (
              <li key={href} className="shrink-0">
                <LocalizedClientLink
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={clx(
                    "inline-flex items-center gap-x-2 rounded-full border px-4 py-2 text-small-regular font-medium whitespace-nowrap transition-colors",
                    active
                      ? "border-brand-500 bg-brand-50 text-brand-600"
                      : "border-gray-200 bg-white text-gray-600"
                  )}
                  data-testid={`${testId}-mobile`}
                >
                  <Icon size={18} />
                  {shortLabel}
                </LocalizedClientLink>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="hidden small:block p-2">
      <div className="px-2 pt-2 pb-3 text-small-regular text-gray-500">
        Hello {customer?.first_name}
      </div>
      <ul className="flex flex-col gap-y-1">
        {navItems.map(({ href, label, icon: Icon, testId }) => (
          <li key={href}>
            <AccountNavLink href={href} route={route!} icon={Icon} data-testid={testId}>
              {label}
            </AccountNavLink>
          </li>
        ))}
        <li className="mt-2 pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setConfirmingLogout(true)}
            className="flex items-center gap-x-3 w-full rounded-md px-4 py-3 text-small-regular font-medium text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition-colors"
            data-testid="logout-button"
          >
            <ArrowRightOnRectangle />
            Log out
          </button>
        </li>
      </ul>
      </div>

      <Modal
        isOpen={confirmingLogout}
        close={() => !loggingOut && setConfirmingLogout(false)}
        size="small"
        data-testid="logout-confirm-modal"
      >
        <Modal.Title>Log out?</Modal.Title>
        <Modal.Description>
          Are you sure you want to log out of your account?
        </Modal.Description>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setConfirmingLogout(false)}
            disabled={loggingOut}
            data-testid="logout-cancel-button"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleLogout}
            isLoading={loggingOut}
            data-testid="logout-confirm-button"
          >
            Log out
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  icon: React.FC<IconProps>
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  icon: Icon,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const active = isActive(route, href)
  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "flex items-center gap-x-3 rounded-md px-4 py-3 text-small-regular font-medium transition-colors",
        active
          ? "bg-brand-50 text-brand-600"
          : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
      )}
      data-testid={dataTestId}
    >
      <Icon size={20} />
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
