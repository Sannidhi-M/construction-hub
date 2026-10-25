import { Clock } from "@medusajs/icons"
import PlatformBanner from "@modules/common/components/platform-banner"

const MaterialsBanner = () => {
  return (
    <PlatformBanner
      platform="Platform 1"
      title="Construction Materials"
      description="Prices updated every morning. Order online, delivered to your site."
      aside={
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm w-fit">
          <Clock />
          Rates last updated: Today morning
        </div>
      }
    />
  )
}

export default MaterialsBanner
