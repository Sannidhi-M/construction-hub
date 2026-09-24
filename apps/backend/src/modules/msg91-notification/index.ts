import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import Msg91NotificationService from "./service"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [Msg91NotificationService],
})
