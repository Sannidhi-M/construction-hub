"use client"

import { useEffect } from "react"
import StatusPage from "@modules/common/components/status-page"
import { Button } from "@modules/common/components/ui"

/**
 * Shown when a page throws while rendering. `reset` re-attempts the render,
 * which fixes transient failures (e.g. the backend being briefly unreachable).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusPage
      code="Oops"
      title="Something went wrong"
      message="We hit a problem loading this page. Please try again — if it keeps happening, contact us and we'll sort it out."
      action={
        <Button variant="primary" size="large" onClick={reset}>
          Try again
        </Button>
      }
    />
  )
}
