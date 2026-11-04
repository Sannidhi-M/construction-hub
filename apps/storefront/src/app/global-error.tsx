"use client"

import { SITE_EMAIL, SITE_NAME, SITE_PHONE } from "@lib/constants"

/**
 * Last-resort screen for when the root layout itself fails. It replaces the
 * whole document, so it can't rely on the site's layout or shared components
 * and is deliberately self-contained, with inline styles.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 24,
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f9fafb",
          color: "#111827",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28 }}>Something went wrong</h1>
        <p style={{ margin: 0, maxWidth: 420, color: "#4b5563" }}>
          {SITE_NAME} ran into a problem. Please try again, or contact us on{" "}
          {SITE_PHONE} / {SITE_EMAIL}.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 8,
            padding: "10px 20px",
            border: 0,
            borderRadius: 8,
            background: "#ea580c",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
