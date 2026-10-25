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
    <div className="flex flex-col small:flex-row small:items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <Text className="text-sm font-semibold text-brand-500 mb-1">
            {eyebrow}
          </Text>
        )}
        <Heading level="h2" className="text-3xl font-extrabold text-gray-900">
          {title}
        </Heading>
        {description && (
          <Text className="text-base text-gray-500 mt-1 max-w-2xl">
            {description}
          </Text>
        )}
      </div>
      {viewAllHref && (
        <LocalizedClientLink href={viewAllHref} className="hidden xsmall:block">
          <Button variant="outline-brand">
            {viewAllLabel}
            <ChevronRight />
          </Button>
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default SectionHeading
