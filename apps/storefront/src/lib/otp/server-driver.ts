import { sendServerOtp } from "@lib/data/customer"
import { OtpDriver, OtpError } from "./types"

/**
 * "server" mode: the backend generates the OTP and texts it through its
 * Notification provider (MSG91). The browser only relays: asking for the code
 * is a server action, and the typed code itself is the credential — the
 * backend compares it with the one it issued.
 */
export const serverOtpDriver: OtpDriver = {
  async send(phone) {
    const result = await sendServerOtp(phone)
    if (result?.state === "error") {
      throw new OtpError(result.error)
    }
  },

  async confirm(_phone, code) {
    return code
  },
}
