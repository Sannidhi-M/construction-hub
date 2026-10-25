import ContactMessageModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const CONTACT_MESSAGE_MODULE = "contact_message"

export default Module(CONTACT_MESSAGE_MODULE, {
  service: ContactMessageModuleService,
})
