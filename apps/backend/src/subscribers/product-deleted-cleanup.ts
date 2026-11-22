import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deleteUploadedFileIfUnused } from "../lib/uploaded-files"

/**
 * A deleted product's photos used to stay in storage forever. The product's
 * image rows are soft deleted (they keep their address), so once the product
 * is gone this finds them and removes the stored files, skipping any file
 * another image or labour service still uses.
 */
export default async function productDeletedCleanup({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "images.url"],
      filters: { id: data.id },
      withDeleted: true,
    })

    for (const image of products[0]?.images ?? []) {
      await deleteUploadedFileIfUnused(container, image?.url)
    }
  } catch (error) {
    logger.warn(
      `Could not clean up photos of deleted product ${data.id}: ${(error as Error).message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "product.deleted",
}
