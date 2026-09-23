import { NextRequest, NextResponse } from "next/server"

/**
 * Single-region storefront (Karnataka/India, INR) — see
 * docs/ARCHITECTURE.md §5. There is no country-code routing to resolve or
 * redirect any more; this middleware only keeps the `_medusa_cache_id`
 * cookie that the rest of the app's cache-tag helpers rely on.
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")

  if (cacheIdCookie) {
    return NextResponse.next()
  }

  const cacheId = crypto.randomUUID()
  const response = NextResponse.next()
  response.cookies.set("_medusa_cache_id", cacheId, {
    maxAge: 60 * 60 * 24,
  })

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
