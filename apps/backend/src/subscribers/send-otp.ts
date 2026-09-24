import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"

type OtpGeneratedEvent = {
  phone: string
  otp: string
}

export default async function sendOtpHandler({
  event: { data },
  container,
}: SubscriberArgs<OtpGeneratedEvent>) {
  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  await notificationModuleService.createNotifications({
    to: data.phone,
    channel: "sms",
    template: "otp",
    data: { otp: data.otp },
  })
}

export const config: SubscriberConfig = {
  event: "phone-auth.otp.generated",
}
