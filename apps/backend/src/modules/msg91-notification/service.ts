import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"

type Options = {
  authKey?: string
  flowId?: string
  senderId?: string
}

type InjectedDependencies = {
  logger: Logger
}

/**
 * SMS delivery via MSG91's Flow API, for the "sms" notification channel.
 * Per docs/ARCHITECTURE.md §3.1, this is the *only* place MSG91's API is
 * called from — auth logic (phone-otp-auth) never talks to MSG91 directly,
 * it only emits an event.
 *
 * No MSG91 account was available to verify against while building this —
 * see docs/PROGRESS.md (Phase 2). When `authKey`/`flowId` aren't configured
 * (e.g. in dev), sends are logged instead of attempted, so the OTP flow is
 * fully testable without a real MSG91 account.
 */
class Msg91NotificationService extends AbstractNotificationProviderService {
  static identifier = "msg91-notification"

  protected readonly logger_: Logger
  protected readonly options_: Options

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options ?? {}
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    if (notification.channel !== "sms") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `msg91-notification only supports the "sms" channel, got "${notification.channel}".`
      )
    }

    if (!this.options_.authKey || !this.options_.flowId) {
      this.logger_.info(
        `[dev] SMS to ${notification.to} (template "${notification.template}"): ` +
          `${JSON.stringify(notification.data)} — MSG91 not configured, logged instead of sent.`
      )
      return {}
    }

    return this.sendViaMsg91_(notification)
  }

  /**
   * MSG91's Flow API (https://control.msg91.com/api/v5/flow/) sends a
   * templated message: `flow_id` identifies the template (created in the
   * MSG91 dashboard), `mobiles` is the recipient without a leading "+", and
   * the template's own variables are passed as top-level keys alongside
   * them. This has NOT been verified against a real MSG91 account/template
   * — the exact variable key names (here, spreading `notification.data`
   * directly, e.g. `{ otp: "123456" }`) must match whatever placeholder
   * names were configured for the flow_id in use, and may need adjusting.
   */
  private async sendViaMsg91_(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const response = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        authkey: this.options_.authKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flow_id: this.options_.flowId,
        sender: this.options_.senderId,
        mobiles: notification.to.replace(/^\+/, ""),
        ...notification.data,
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `MSG91 send failed (${response.status}): ${body || response.statusText}`
      )
    }

    const result = (await response.json().catch(() => ({}))) as { request_id?: string }
    return { id: result.request_id }
  }
}

export default Msg91NotificationService
