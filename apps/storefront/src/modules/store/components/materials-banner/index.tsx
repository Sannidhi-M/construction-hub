import { Clock } from "@medusajs/icons"
import { Heading, Text } from "@modules/common/components/ui"

/**
 * Styling (bg color, spacing, pill treatment) confirmed against the Airo
 * design reference's own computed styles, not eyeballed from a
 * screenshot.
 */
const MaterialsBanner = () => {
  return (
    <div className="w-full bg-gray-900">
      <div className="content-container py-10 flex flex-col small:flex-row small:items-center small:justify-between gap-4">
        <div>
          <Text className="text-sm font-semibold text-brand-500 mb-1">
            Platform 1
          </Text>
          <Heading level="h1" className="text-3xl font-extrabold text-white">
            Construction Materials
          </Heading>
          <Text className="text-white/60 mt-1">
            Prices updated every morning. Order online, delivered to your site.
          </Text>
        </div>
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm w-fit">
          <Clock />
          Rates last updated: Today morning
        </div>
      </div>
    </div>
  )
}

export default MaterialsBanner
