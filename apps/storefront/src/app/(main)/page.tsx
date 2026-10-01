import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import MaterialsPreview from "@modules/home/components/materials-preview"
import LabourPreview from "@modules/home/components/labour-preview"
import EngineeringPreview from "@modules/home/components/engineering-preview"
import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "Construction materials, skilled labour, and engineering services — delivered in Davangere.",
}

export default async function Home() {
  const region = await getRegion()
  const categories = await listCategories()

  if (!region) {
    return null
  }

  return (
    <>
      <Hero />
      <MaterialsPreview categories={categories ?? []} region={region} />
      <LabourPreview />
      <EngineeringPreview />
    </>
  )
}
