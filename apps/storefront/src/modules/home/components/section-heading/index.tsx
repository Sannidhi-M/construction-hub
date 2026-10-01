import { ChevronRight } from "@medusajs/icons"
import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description: string
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
        <Text className="text-sm font-semibold text-brand-500 mb-1">
          {eyebrow}
        </Text>
        <Heading level="h2" className="text-3xl font-extrabold text-gray-900">
          {title}
        </Heading>
        <Text className="text-base text-gray-500 mt-1 max-w-2xl">
          {description}
        </Text>
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
