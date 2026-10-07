"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ensureDefaultShippingMethod } from "@lib/data/cart"

/**
 * Self-heals a cart that has an address but no shipping method (e.g. the
 * address was set before auto-assignment existed, or the method it had got
 * removed) — otherwise the "Delivery" card stays stuck empty forever.
 *
 * This must run as a client effect, not inline during CheckoutForm's render:
 * `ensureDefaultShippingMethod` calls `revalidateTag`, which Next.js only
 * allows from a Server Action/Route Handler, never during render (confirmed
 * the hard way — it throws "used revalidateTag ... during render").
 */
const EnsureShippingMethod = ({ cartId }: { cartId: string }) => {
  const router = useRouter()
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) {
      return
    }
    ranRef.current = true

    ensureDefaultShippingMethod(cartId).then((assigned) => {
      if (assigned) {
        router.refresh()
      }
    })
  }, [cartId, router])

  return null
}

export default EnsureShippingMethod
