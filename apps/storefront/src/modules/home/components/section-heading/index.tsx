import { ChevronRight } from "@medusajs/icons"
import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SectionHeadingProps = {
  // Optional: the homepage labels each section "Platform N", but a section
  // on a platform's own page (e.g. /engineering) doesn't need that label.
  eyebrow?: string
  title: string
  // Optional: a section whose body already carries its own copy (e.g.
  // Engineering Services, which pairs a slider with its own text + CTA)
  // shows just the eyebrow and title.
  description?: string
  viewAllHref?: string
  viewAllLabel?: string
}

const SectionHeading = ({
  eyebrow,
  title,
  description,
  viewAllHref,
  viewAllLabel = "View All",
}: SectionHeadingProps) => {
  return (
    // Heading and "View All" share a row on every width: on a phone the
    // heading is a size smaller and the button compact so both fit, with the
    // description (if any) under them; from `small` up the description sits
    // under the heading and the button lines up with the bottom of the block.
    <div className="mb-6 small:mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-3 gap-y-1">
      <div className="min-w-0 col-start-1 row-start-1">
        {eyebrow && (
          <Text className="text-sm font-semibold text-brand-500 mb-1">
            {eyebrow}
          </Text>
        )}
        <Heading
          level="h2"
          className="text-2xl small:text-3xl font-extrabold text-gray-900"
        >
          {title}
        </Heading>
      </div>
      {description && (
        <Text className="col-span-2 row-start-2 small:col-span-1 text-base text-gray-500 max-w-2xl">
          {description}
        </Text>
      )}
      {viewAllHref && (
        <LocalizedClientLink
          href={viewAllHref}
          className="col-start-2 row-start-1 small:row-span-2 self-end shrink-0"
        >
          <Button
            variant="outline-brand"
            className="max-small:!h-8 max-small:!px-3 max-small:!text-sm whitespace-nowrap"
          >
            {viewAllLabel}
            <ChevronRight />
          </Button>
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default SectionHeading
