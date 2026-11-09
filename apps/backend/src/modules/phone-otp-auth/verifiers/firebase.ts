import { createRemoteJWKSet, jwtVerify } from "jose"

/**
 * Verifies a Firebase Authentication ID token — the proof the browser gets
 * after Firebase has texted the user a code and they typed it in — without
 * the heavyweight firebase-admin SDK: an ID token is a plain RS256 JWT
 * signed by Google, so checking signature + claims is all that's needed.
 * Needs no service-account secret, only the (public) Firebase project id.
 *
 * Returns the phone number Firebase verified, E.164. Throws on anything
 * wrong (bad signature, wrong project, expired, no phone claim, stale).
 */
const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
)

// An ID token lives for an hour, but a login should follow the SMS code
// within minutes — rejecting older sign-ins shrinks the window in which a
// leaked token could be replayed.
const MAX_AUTH_AGE_SECONDS = 5 * 60

export async function verifyFirebasePhoneToken(
  idToken: string,
  projectId: string
): Promise<string> {
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"],
  })

  const firebase = payload.firebase as { sign_in_provider?: string } | undefined
  if (firebase?.sign_in_provider !== "phone") {
    throw new Error("Token was not issued by a phone sign-in.")
  }

  const phone = payload.phone_number
  if (typeof phone !== "string" || !phone) {
    throw new Error("Token carries no verified phone number.")
  }

  const authTime = payload.auth_time
  if (
    typeof authTime !== "number" ||
    Date.now() / 1000 - authTime > MAX_AUTH_AGE_SECONDS
  ) {
    throw new Error("Sign-in is too old.")
  }

  return phone
}
