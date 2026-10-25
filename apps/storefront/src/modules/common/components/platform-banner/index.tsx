import { ReactNode } from "react"
import { Heading, Text } from "@modules/common/components/ui"

type PlatformBannerProps = {
  // "Platform 1" / "Platform 2" / "Platform 3" — the same label the
  // homepage's section headings use.
  platform: string
  // The platform's name, as in the nav ("Construction Materials", ...).
  title: string
  description: string
  // Optional content on the right of the banner (e.g. Materials' "Rates
  // last updated" pill).
  aside?: ReactNode
}

/**
 * The dark header band at the top of each platform's own page (Materials,
 * Labour & Manpower, Engineering Services), so the three read as one
 * family. Styling (bg color, spacing) was confirmed against the Airo
 * design reference's own computed styles, not eyeballed from a screenshot —
 * it's the Materials banner's, extracted so the other platforms can't drift
 * from it.
 */
const PlatformBanner = ({
  platform,
  title,
  description,
  aside,
}: PlatformBannerProps) => {
  return (
    <div className="w-full bg-gray-900">
      <div className="content-container py-10 flex flex-col small:flex-row small:items-center small:justify-between gap-4">
        <div>
          <Text className="text-sm font-semibold text-brand-500 mb-1">
            {platform}
          </Text>
          <Heading level="h1" className="text-3xl font-extrabold text-white">
            {title}
          </Heading>
          <Text className="text-white/60 mt-1">{description}</Text>
        </div>
        {aside}
      </div>
    </div>
  )
}

export default PlatformBanner
