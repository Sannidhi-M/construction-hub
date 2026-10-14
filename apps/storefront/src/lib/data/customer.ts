"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { normalizeIndianPhone } from "@lib/util/phone"
import { HttpTypes } from "@medusajs/types"
import { FetchError } from "@medusajs/js-sdk"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  getPendingCustomer,
  removeAuthToken,
  removeCartId,
  removePendingCustomer,
  setAuthToken,
  setPendingCustomer,
} from "./cookies"

export type CustomerAuthState =
  | { state: "error"; error: string }
  | { state: "verification_required"; email: string }
  | { state: "otp_sent"; phone: string }
  | { state: "not_found"; phone: string }
  | { state: "email_required"; phone: string; token: string }
  | { state: "success" }
  | null

// Requests a verification email for the given customer. The request must be
// authenticated with a token tied to the auth identity (the token returned by
// register or by a login that requires verification).
async function requestVerificationEmail(email: string, token: string) {
  await sdk.auth.verification.request(
    {
      entity_id: email,
      entity_type: "email",
    },
    {
      authorization: `Bearer ${token}`,
    }
  )
}

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password,
    })
  } catch (error) {
    const fetchError = error as FetchError
    // An existing identity (for example, an admin user with the same email) is
    // expected and handled: the customer can still log in to link a customer
    // record. Any other error is surfaced.
    if (
      fetchError.statusText !== "Unauthorized" ||
      fetchError.message !== "Identity with email already exists"
    ) {
      return { state: "error", error: String(error) }
    }
  }

  // Persist the extra signup fields. The customer record is created during
  // login, which is deferred until after email verification when the backend
  // requires it.
  await setPendingCustomer(customerForm)

  // Continue by logging in. The login response tells us whether the backend
  // requires email verification — we don't need a storefront-side flag.
  return completeLogin(customerForm.email, password)
}

export async function login(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  return completeLogin(email, password)
}

// Logs the customer in and reconciles the customer record. The behavior is
// driven entirely by the backend's login response, so it works whether or not
// email verification is enabled.
async function completeLogin(
  email: string,
  password: string
): Promise<CustomerAuthState> {
  let result: Awaited<ReturnType<typeof sdk.auth.login>>

  try {
    result = await sdk.auth.login("customer", "emailpass", { email, password })
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  // A `location` is returned by third-party auth providers, which this flow
  // doesn't support.
  if (typeof result === "object" && "location" in result) {
    return {
      state: "error",
      error: "This login method isn't supported by the storefront.",
    }
  }

  // The backend requires email verification and the customer hasn't verified
  // yet. Send the verification email and ask them to check their inbox.
  if (
    typeof result === "object" &&
    "verification_required" in result &&
    result.verification_required
  ) {
    try {
      await requestVerificationEmail(email, result.token)
    } catch {
      // Ignore: the customer can resend from the verification page.
    }
    return { state: "verification_required", email }
  }

  if (typeof result !== "string") {
    return {
      state: "error",
      error: "Authentication requires additional steps that aren't supported.",
    }
  }

  let token = result

  // The token may not be tied to a customer record yet — right after
  // registration, or after verifying a brand-new account. Ask the backend:
  // `/store/customers/me` rejects tokens without a registered actor, so a
  // failed retrieve means we still need to create the customer, then log in
  // again to obtain a customer-bound token.
  const customerExists = await sdk.store.customer
    .retrieve({}, { authorization: `Bearer ${token}` })
    .then(() => true)
    .catch(() => false)

  if (!customerExists) {
    const pending = await getPendingCustomer()

    try {
      await sdk.store.customer.create(
        {
          email,
          first_name: pending?.first_name,
          last_name: pending?.last_name,
          phone: pending?.phone,
        },
        {},
        { authorization: `Bearer ${token}` }
      )

      token = (await sdk.auth.login("customer", "emailpass", {
        email,
        password,
      })) as string
    } catch (error) {
      return { state: "error", error: String(error) }
    }

    await removePendingCustomer()
  }

  await setAuthToken(token)

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  try {
    await transferCart()
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  return { state: "success" }
}

// Phone/OTP login (§3.1/§4.2 of the architecture doc). A single unified flow
// for both new and returning customers — there's no separate "register with
// phone" screen; the backend creates the auth identity on the first
// successful OTP verification (see phone-otp-auth's validateCallback).

// Sign In (not checkout) can require the phone to already have an account
// before sending an OTP for it, so a first-time visitor sees "no account"
// immediately instead of verifying a code only to be told that afterwards.
// Checkout's own phone step never sets this — it deliberately lets a
// brand-new number sign up inline.
export async function requestPhoneOtp(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const phone = formData.get("phone") as string
  const requireExistingAccount = formData.get("require_existing") === "true"

  try {
    if (requireExistingAccount) {
      const exists = await sdk.client
        .fetch<{ exists: boolean }>("/store/customers/phone-exists", {
          query: { phone },
        })
        .then((res) => res.exists)
        .catch(() => true) // fail open — don't block sign-in over a check failing

      if (!exists) {
        return { state: "not_found", phone }
      }
    }

    const result = await sdk.auth.login("customer", "phone-auth", { phone })

    // phone-auth's authenticate() always returns `{ location: "otp" }` — it
    // never returns a token directly; requesting an OTP is always step one
    // of two. A `location` here just means "advance to the OTP-entry step",
    // not a third-party redirect (unlike an OAuth provider using this same
    // response shape).
    if (typeof result === "object" && "location" in result) {
      return { state: "otp_sent", phone }
    }

    return { state: "error", error: "Unexpected response requesting the OTP." }
  } catch (error) {
    return { state: "error", error: String(error) }
  }
}

export async function verifyPhoneOtp(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const phone = formData.get("phone") as string
  const otp = formData.get("otp") as string

  // sdk.auth.callback() is built for GET-with-query-params OAuth callbacks
  // (code/state in the URL) — unsuitable for a POST-body OTP submission,
  // and putting an OTP in a query string would land it in server logs and
  // browser history. Medusa's own framework-generated route for
  // validateCallback accepts POST with a body, so this calls it directly.
  let token: string
  try {
    const response = await sdk.client.fetch<{ token: string }>(
      "/auth/customer/phone-auth/callback",
      { method: "POST", body: { phone, otp } }
    )
    token = response.token
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  // A returning customer's token is already bound to their customer record
  // — finish logging in. A brand-new phone identity isn't: Medusa's own
  // customer-account-creation workflow requires an email unconditionally
  // (confirmed the hard way — the store API's input schema marks it
  // optional, but a deeper workflow-level business rule enforces it
  // regardless), and the business wants email collected for every
  // customer anyway (shipping/invoicing), so a brand-new phone signup is
  // routed to one more step (completePhoneSignup) rather than silently
  // synthesizing a placeholder email.
  const customerExists = await sdk.store.customer
    .retrieve({}, { authorization: `Bearer ${token}` })
    .then(() => true)
    .catch(() => false)

  if (!customerExists) {
    return { state: "email_required", phone, token }
  }

  await setAuthToken(token)

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  try {
    await transferCart()
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  return { state: "success" }
}

// Second step for a brand-new phone signup only (see verifyPhoneOtp above)
// — collects the email Medusa's customer-account-creation workflow
// requires. `token` is the actorless token from the just-verified OTP,
// carried forward via a hidden form field; it's single-use for creating
// this specific pending account and short-lived, the same pattern the
// SDK's own OAuth callback flow uses for an unprovisioned token.
export async function completePhoneSignup(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const rawPhone = formData.get("phone") as string
  const email = formData.get("email") as string
  const token = formData.get("token") as string
  const firstName = (formData.get("first_name") as string) || undefined
  const lastName = (formData.get("last_name") as string) || undefined

  // Store the same normalized form the auth identity itself uses — not
  // whatever raw string the customer happened to type — so customer.phone
  // is always in a consistent, lookup-able format (confirmed the hard way:
  // without this, existing records ended up a mix of "9009009009" and
  // "+919009009009" depending on which screen created them).
  const phone = normalizeIndianPhone(rawPhone) ?? rawPhone

  let boundToken: string
  try {
    await sdk.store.customer.create(
      { phone, email, first_name: firstName, last_name: lastName },
      {},
      { authorization: `Bearer ${token}` }
    )

    // Same "actorless token -> bound token" mechanism as completeLogin's
    // email/password path would use a second login for — phone-auth has
    // no secret to re-submit synchronously, so this uses refresh() instead,
    // matching the SDK's own OAuth-callback flow for this exact problem.
    const refreshed = await sdk.auth.refresh({
      authorization: `Bearer ${token}`,
    })
    if (!("token" in refreshed) || typeof refreshed.token !== "string") {
      return {
        state: "error",
        error: "Authentication requires additional steps that aren't supported.",
      }
    }
    boundToken = refreshed.token
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  await setAuthToken(boundToken)

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  try {
    await transferCart()
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  return { state: "success" }
}

// Confirms a customer's email using the token from the verification link.
//
// The confirm route doesn't require authentication, so this works even when the
// customer opens the link on a different device than the one they signed up on.
export async function confirmEmailVerification(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await sdk.auth.verification.confirm({ code: token })
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function signout() {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
