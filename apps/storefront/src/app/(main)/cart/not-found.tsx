import { Metadata } from "next"
import StatusPage from "@modules/common/components/status-page"

export const metadata: Metadata = {
  title: "Cart not found",
  description: "We couldn't find that cart.",
}

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Cart not found"
      message="We couldn't find that cart. Clear your browser cookies and try again, or start a new cart from the shop."
    />
  )
}
