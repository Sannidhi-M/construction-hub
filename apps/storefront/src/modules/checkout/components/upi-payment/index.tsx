"use client"

import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import { convertToLocale } from "@lib/util/money"

const UPI_VPA = process.env.NEXT_PUBLIC_UPI_VPA
const UPI_PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME ?? "Construction Hub"

/**
 * §2.4/§4.2 — runs *after* `completeCartWorkflow` has already created the
 * order (this component only ever renders on the order-confirmation page,
 * never gates checkout). One UPI intent string, two presentations chosen by
 * a simple mobile check: a tappable "Pay via UPI app" button on mobile
 * (opens the customer's own UPI app with the amount prefilled — a QR code
 * is useless when the phone showing it is also the phone that would have
 * to scan it), or a QR code image on desktop.
 */
const UpiPayment = ({ order }: { order: HttpTypes.StoreOrder }) => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const amount = Number(order.total ?? 0)

  const upiUri = UPI_VPA
    ? `upi://pay?pa=${encodeURIComponent(UPI_VPA)}&pn=${encodeURIComponent(
        UPI_PAYEE_NAME
      )}&am=${amount}&cu=INR&tn=${encodeURIComponent(
        `Order ${order.display_id}`
      )}`
    : null

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    if (!upiUri || isMobile) {
      return
    }

    let cancelled = false

    import("qrcode").then(({ default: QRCode }) => {
      QRCode.toDataURL(upiUri, { width: 240, margin: 1 }).then((url) => {
        if (!cancelled) {
          setQrDataUrl(url)
        }
      })
    })

    return () => {
      cancelled = true
    }
  }, [upiUri, isMobile])

  if (!upiUri) {
    return null
  }

  return (
    <div data-testid="upi-payment-container">
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Pay via UPI
      </Heading>
      <Text className="mb-4">
        Amount due:{" "}
        <span className="font-semibold" data-testid="upi-amount">
          {convertToLocale({ amount, currency_code: order.currency_code })}
        </span>{" "}
        — pay to <span className="font-semibold">{UPI_VPA}</span> and
        reference order <span className="font-semibold">{order.display_id}</span>.
        We'll confirm your payment once it's received; you can check the
        status any time from your account.
      </Text>
      {isMobile ? (
        <a
          href={upiUri}
          className="inline-flex items-center justify-center rounded-md bg-ui-button-inverted px-6 py-3 text-base font-medium text-white"
          data-testid="upi-pay-button"
        >
          Pay via UPI app
        </a>
      ) : qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qrDataUrl}
          alt="Scan this QR code with a UPI app to pay"
          data-testid="upi-qr-code"
          width={240}
          height={240}
        />
      ) : null}
    </div>
  )
}

export default UpiPayment
