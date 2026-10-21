import LabourBookingModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const LABOUR_BOOKING_MODULE = "labour_booking"

export default Module(LABOUR_BOOKING_MODULE, {
  service: LabourBookingModuleService,
})
