import { Metadata } from "next"
import StatusPage from "@modules/common/components/status-page"

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for doesn't exist.",
}

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      message="The page you were looking for doesn't exist or may have moved. Check the address, or head back and pick up from here."
    />
  )
}
