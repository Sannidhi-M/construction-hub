import DeliveryAreaModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const DELIVERY_AREA_MODULE = "delivery_area"

export default Module(DELIVERY_AREA_MODULE, {
  service: DeliveryAreaModuleService,
})
