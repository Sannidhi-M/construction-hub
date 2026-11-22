import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { LABOUR_BOOKING_MODULE } from "../modules/labour-booking"
import LabourBookingModuleService from "../modules/labour-booking/service"

/**
 * The file-module key of a photo uploaded through the Admin, taken from its
 * saved address (`http://host/static/<key>` locally, `https://bucket-host/<key>`
 * on S3/R2). Addresses that are not absolute (the storefront's built-in
 * fallback photos, like `/labour/masonry.jpg`) are not uploads: null.
 */
export function uploadedFileKey(url: string | null | undefined): string | null {
  if (!url || !/^https?:\/\//i.test(url)) {
    return null
  }
  try {
    const key = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "")
    return key || null
  } catch {
    return null
  }
}

/**
 * Deletes the stored file behind an uploaded photo's address — unless another
 * product image or labour service still uses the same address. Never throws:
 * a file that cannot be deleted is just left behind (and logged), it must not
 * undo or fail the deletion that triggered this.
 */
export async function deleteUploadedFileIfUnused(
  container: MedusaContainer,
  url: string | null | undefined
): Promise<void> {
  const key = uploadedFileKey(url)
  if (!key) {
    return
  }
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { images: { url: url as string } },
    })
    const labourService: LabourBookingModuleService =
      container.resolve(LABOUR_BOOKING_MODULE)
    const services = await labourService.listLabourServices({
      image_url: url as string,
    })
    if (products.length > 0 || services.length > 0) {
      return
    }

    await container.resolve(Modules.FILE).deleteFiles(key)
  } catch (error) {
    logger.warn(
      `Could not delete the uploaded file for ${url}: ${(error as Error).message}`
    )
  }
}
