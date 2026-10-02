import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

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
  return (
    <div className="flex-1 bg-gray-50 py-8 small:py-12" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto flex flex-col gap-y-6">
        <div className="grid grid-cols-1 small:grid-cols-[260px_1fr] gap-6">
          {customer && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-fit">
              <AccountNav customer={customer} />
            </div>
          )}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-8">
            {children}
          </div>
        </div>
        <div className="flex flex-col small:flex-row items-start small:items-end justify-between gap-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-8">
          <div>
            <h3 className="text-xl-semi mb-2 text-gray-900">Got questions?</h3>
            <span className="txt-medium text-gray-600">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              Customer Service
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
