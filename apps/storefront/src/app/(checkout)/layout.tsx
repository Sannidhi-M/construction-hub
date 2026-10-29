import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import LogoMark from "@modules/common/icons/logo-mark"
import WhatsAppButton from "@modules/layout/components/whatsapp-button"
import { SITE_NAME } from "@lib/constants"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-gray-50 relative small:min-h-screen">
      <div className="h-16 bg-white border-b border-gray-200 shadow-sm">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="flex items-center gap-x-2 text-sm font-semibold text-gray-600 hover:text-brand-500 transition-colors flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="hidden small:block">Back to shopping cart</span>
            <span className="block small:hidden">Back</span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="flex items-center gap-x-2"
            data-testid="store-link"
          >
            <LogoMark size="28" color="#F97415" />
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">
              {SITE_NAME}
            </span>
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
      <WhatsAppButton />
    </div>
  )
}
