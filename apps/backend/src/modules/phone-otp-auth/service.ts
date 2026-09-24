import {
  AbstractAuthModuleProvider,
  MedusaError,
  isString,
} from "@medusajs/framework/utils"
import {
  AuthenticationInput,
  AuthenticationResponse,
  AuthIdentityDTO,
  AuthIdentityProviderService,
  IEventBusModuleService,
  Logger,
} from "@medusajs/framework/types"
import jwt from "jsonwebtoken"
import { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js"
import { getRedisClient } from "../../lib/redis"

type Options = {
  jwtSecret?: string
  otpTtlSeconds?: number
  cooldownSeconds?: number
  maxAttempts?: number
  maxRequestsPerHour?: number
  defaultCountry?: CountryCode
}

/**
 * The first constructor argument for an auth provider is the module's own
 * awilix cradle — plain property access resolves a registration (e.g.
 * `container.logger`), unlike the `MedusaContainer`-with-`.resolve()` object
 * passed to workflow steps/routes/subscribers elsewhere in this codebase.
 * Confirmed by a real AwilixResolutionError when this was first written as
 * `container.resolve(...)`.
 */
type InjectedDependencies = {
  logger: Logger
  event_bus: IEventBusModuleService
}

const DEFAULT_OPTIONS: Required<Omit<Options, "jwtSecret">> = {
  otpTtlSeconds: 5 * 60,
  cooldownSeconds: 60,
  maxAttempts: 5,
  maxRequestsPerHour: 5,
  defaultCountry: "IN",
}

type OtpJwtPayload = {
  phone: string
  otp: string
}

const REDIS_KEY_PREFIX = "phone-otp"

/**
 * Phone + OTP authentication, per docs/ARCHITECTURE.md §3.1. Mirrors the
 * structure of Medusa's own `auth-emailpass` provider, adapted for a
 * passwordless, two-step (request OTP -> verify OTP) flow:
 *
 *  - authenticate(): the "request OTP" step. Never talks to an SMS
 *    provider directly — emits `phone-auth.otp.generated` on the event bus;
 *    a subscriber (src/subscribers/send-otp.ts) resolves the Notification
 *    Module to actually send it. This keeps a slow/unreachable SMS provider
 *    from blocking or failing the auth request itself.
 *  - validateCallback(): the "verify OTP" step. Creates the auth identity
 *    on first successful verification (register-on-first-login, standard
 *    for passwordless auth — there's no separate "create account" screen).
 *  - register(): not part of this flow's real UX (no separate signup step
 *    exists for phone/OTP), but the framework expects it to be implemented;
 *    delegates to the same "request OTP" logic as authenticate().
 */
class PhoneOtpAuthService extends AbstractAuthModuleProvider {
  // Must match the provider `id` configured in medusa-config.ts — the auth
  // module tags each created provider_identity's `provider` field with the
  // configured id, and `this.identifier` (used below to find "our own"
  // provider_identity on a shared AuthIdentityDTO) reflects this static
  // property, not the configured id. A mismatch here means every OTP
  // lookup silently fails with "No active OTP" — confirmed the hard way.
  static identifier = "phone-auth"
  static DISPLAY_NAME = "Phone/OTP Authentication"

  protected readonly eventBus_: IEventBusModuleService
  protected readonly logger_: Logger
  protected readonly jwtSecret_: string
  protected readonly options_: Required<Omit<Options, "jwtSecret">>

  static validateOptions(options: Record<string, unknown>) {
    if (!options.jwtSecret && !process.env.JWT_SECRET) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "phone-otp-auth requires a jwtSecret option or a JWT_SECRET env var."
      )
    }
  }

  constructor({ logger, event_bus }: InjectedDependencies, options: Options) {
    // @ts-ignore — matches @medusajs/auth-emailpass's own reference
    // implementation; `arguments` isn't a statically-typed tuple, but
    // AbstractAuthModuleProvider's base constructor expects to receive it
    // as-is.
    super(...arguments)

    this.logger_ = logger
    this.eventBus_ = event_bus
    this.jwtSecret_ = options?.jwtSecret ?? process.env.JWT_SECRET!
    this.options_ = { ...DEFAULT_OPTIONS, ...options }
  }

  async authenticate(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const rawPhone = data.body?.phone
    if (!rawPhone || !isString(rawPhone)) {
      return { success: false, error: "Phone number is required." }
    }

    let phone: string
    try {
      phone = this.normalizePhone_(rawPhone)
    } catch {
      return { success: false, error: "Invalid phone number." }
    }

    const redis = getRedisClient()
    const cooldownKey = this.redisKey_("cooldown", phone)
    const cooldownSet = await redis.set(
      cooldownKey,
      "1",
      "EX",
      this.options_.cooldownSeconds,
      "NX"
    )
    if (cooldownSet === null) {
      return {
        success: false,
        error: `Please wait ${this.options_.cooldownSeconds} seconds before requesting another OTP.`,
      }
    }

    const rateLimitKey = this.redisKey_("ratelimit", phone)
    const requestCount = await redis.incr(rateLimitKey)
    if (requestCount === 1) {
      await redis.expire(rateLimitKey, 3600)
    }
    if (requestCount > this.options_.maxRequestsPerHour) {
      return {
        success: false,
        error: "Too many OTP requests for this number. Please try again later.",
      }
    }

    let authIdentity: AuthIdentityDTO | undefined
    try {
      authIdentity = await authIdentityProviderService.retrieve({
        entity_id: phone,
      })
    } catch (error) {
      if (error.type !== MedusaError.Types.NOT_FOUND) {
        return { success: false, error: error.message }
      }
    }

    const otp = this.generateOtp_()
    const signedOtp = jwt.sign({ phone, otp } satisfies OtpJwtPayload, this.jwtSecret_, {
      expiresIn: this.options_.otpTtlSeconds,
    })

    if (authIdentity) {
      await authIdentityProviderService.update(phone, {
        provider_metadata: { otp: signedOtp },
      })
    } else {
      await authIdentityProviderService.create({
        entity_id: phone,
        provider_metadata: { otp: signedOtp },
      })
    }

    // A fresh challenge resets the attempt budget from any previous one.
    await redis.del(this.redisKey_("attempts", phone))

    await this.eventBus_
      .emit({ name: "phone-auth.otp.generated", data: { phone, otp } })
      .catch((error) => {
        // Never let an event-bus hiccup fail the OTP request itself — the
        // OTP has already been generated and stored; the customer can
        // still verify it if the SMS somehow gets through, and can always
        // request a fresh one otherwise.
        this.logger_.error(
          `phone-otp-auth: failed to emit phone-auth.otp.generated for ${phone}: ${error.message}`
        )
      })

    return { success: true, location: "otp" }
  }

  async register(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    return this.authenticate(data, authIdentityProviderService)
  }

  async validateCallback(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const rawPhone = data.body?.phone
    const submittedOtp = data.body?.otp

    if (!rawPhone || !isString(rawPhone)) {
      return { success: false, error: "Phone number is required." }
    }
    if (!submittedOtp || !isString(submittedOtp)) {
      return { success: false, error: "OTP is required." }
    }

    let phone: string
    try {
      phone = this.normalizePhone_(rawPhone)
    } catch {
      return { success: false, error: "Invalid phone number." }
    }

    let authIdentity: AuthIdentityDTO
    try {
      authIdentity = await authIdentityProviderService.retrieve({
        entity_id: phone,
      })
    } catch (error) {
      if (error.type === MedusaError.Types.NOT_FOUND) {
        return {
          success: false,
          error: "No OTP was requested for this phone number.",
        }
      }
      return { success: false, error: error.message }
    }

    const redis = getRedisClient()
    const attemptsKey = this.redisKey_("attempts", phone)

    const currentAttempts = parseInt((await redis.get(attemptsKey)) ?? "0", 10)
    if (currentAttempts >= this.options_.maxAttempts) {
      return {
        success: false,
        error: "Too many incorrect attempts. Please request a new OTP.",
      }
    }

    const recordFailedAttempt = async (): Promise<void> => {
      const attempts = await redis.incr(attemptsKey)
      if (attempts === 1) {
        await redis.expire(attemptsKey, this.options_.otpTtlSeconds)
      }
      if (attempts >= this.options_.maxAttempts) {
        // Invalidate outright — don't let a correctly-guessed-later OTP be
        // retried again inside its own TTL window once the attempt budget
        // for it is exhausted.
        await authIdentityProviderService.update(phone, {
          provider_metadata: { otp: null },
        })
      }
    }

    const providerIdentity = authIdentity.provider_identities?.find(
      (pi) => pi.provider === this.identifier
    )
    const storedSignedOtp = providerIdentity?.provider_metadata?.otp as
      | string
      | null
      | undefined

    if (!storedSignedOtp) {
      await recordFailedAttempt()
      return { success: false, error: "No active OTP. Please request a new one." }
    }

    let decoded: OtpJwtPayload
    try {
      decoded = jwt.verify(storedSignedOtp, this.jwtSecret_) as OtpJwtPayload
    } catch {
      await recordFailedAttempt()
      return { success: false, error: "OTP has expired. Please request a new one." }
    }

    if (decoded.phone !== phone || decoded.otp !== submittedOtp) {
      await recordFailedAttempt()
      return { success: false, error: "Incorrect OTP." }
    }

    // Success — single-use: clear the OTP so a captured/replayed code can't
    // be verified again inside its own TTL, and reset the attempt budget.
    await authIdentityProviderService.update(phone, {
      provider_metadata: { otp: null },
    })
    await redis.del(attemptsKey)

    return { success: true, authIdentity: this.sanitizeAuthIdentity_(authIdentity) }
  }

  private normalizePhone_(raw: string): string {
    const phoneNumber = parsePhoneNumberFromString(raw, this.options_.defaultCountry)
    if (!phoneNumber || !phoneNumber.isValid()) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid phone number")
    }
    return phoneNumber.number
  }

  private generateOtp_(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  private redisKey_(kind: "cooldown" | "ratelimit" | "attempts", phone: string): string {
    return `${REDIS_KEY_PREFIX}:${kind}:${phone}`
  }

  private sanitizeAuthIdentity_(authIdentity: AuthIdentityDTO): AuthIdentityDTO {
    const copy = JSON.parse(JSON.stringify(authIdentity)) as AuthIdentityDTO
    const providerIdentity = copy.provider_identities?.find(
      (pi) => pi.provider === this.identifier
    )
    if (providerIdentity?.provider_metadata) {
      delete providerIdentity.provider_metadata.otp
    }
    return copy
  }
}

export default PhoneOtpAuthService
