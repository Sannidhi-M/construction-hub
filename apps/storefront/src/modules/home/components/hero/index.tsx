import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { SITE_LOCATION } from "@lib/constants"

const Hero = () => {
  return (
    <div
      className={
        // Fills the viewport on first load (fold = right below the sticky
        // nav) on any device, minus a deliberate 28px "peek" of the next
        // (white) section so the fold hints there's more to scroll to —
        // the two nav-height numbers here (64px header only on mobile,
        // +40px top bar from `small` up) must stay in sync with
        // src/modules/layout/templates/nav/index.tsx's own h-16/h-10.
        // `svh` (not `vh`) so mobile browser chrome doesn't clip the fold.
        "w-full bg-gray-900 relative overflow-hidden flex items-center " +
        "min-h-[calc(100svh-64px-28px)] small:min-h-[calc(100svh-104px-28px)]"
      }
    >
      <Image
        src="/images/hero-construction.jpg"
        alt="Construction site"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/60" />
      <div className="content-container relative z-10 flex flex-col items-center text-center py-10 small:py-16 gap-4 small:gap-6">
        <span className="inline-flex items-center rounded-full bg-brand-600/20 text-brand-400 px-4 py-1 txt-compact-small-plus">
          {SITE_LOCATION}&apos;s Construction Platform
        </span>
        <Heading
          level="h1"
          className="text-3xl small:text-6xl leading-tight text-white font-bold max-w-3xl"
        >
          Everything Your Construction Needs,{" "}
          <span className="text-brand-500">Delivered Locally.</span>
        </Heading>
        <Text className="text-gray-300 txt-large max-w-xl">
          Materials, skilled labour, and engineering services — all in one
          place for builders in {SITE_LOCATION}.
        </Text>
        <div className="flex flex-col xsmall:flex-row gap-4 mt-2">
          <LocalizedClientLink href="/store">
            <Button variant="primary" size="large">
              Shop Materials
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/engineering">
            <Button variant="outline-light" size="large">
              Explore Services
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default Hero
