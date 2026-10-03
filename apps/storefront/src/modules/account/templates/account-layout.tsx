import React from "react"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  // Signed out: a single centered card (sign in / create account) — there's
  // no sidebar to balance against, so this doesn't use the dashboard's
  // full-width grid at all.
  if (!customer) {
    return (
      <div
        className="flex-1 bg-gray-50 py-8 small:py-16"
        data-testid="account-page"
      >
        <div className="content-container flex flex-col items-center gap-y-6">
          <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-8">
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 py-8 small:py-12" data-testid="account-page">
      <div className="flex-1 content-container h-full flex flex-col gap-y-6">
        <div className="grid grid-cols-1 small:grid-cols-[260px_1fr] gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-fit">
            <AccountNav customer={customer} />
          </div>
          <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
