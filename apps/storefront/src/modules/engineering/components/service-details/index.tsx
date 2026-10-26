import { CheckCircleSolid } from "@medusajs/icons"
import { Text } from "@modules/common/components/ui"
import { ServiceSlide } from "@lib/data/engineering-service-slides"

/**
 * The detail text for the two services on the active slide — a paragraph and
 * bullets each, as real page text (readable at any size, selectable, and
 * visible to search engines, unlike text baked into a picture).
 *
 * All the slides' panels share ONE grid cell and fade between each other, so
 * the column is always as tall as the tallest one and the page doesn't jump
 * when the text lengths differ.
 */
const ServiceDetails = ({
  slides,
  index,
}: {
  slides: ServiceSlide[]
  index: number
}) => (
  <div className="grid" data-testid="engineering-service-details">
    {slides.map((slide, slideIndex) => (
      <div
        key={slide.headline}
        className={`col-start-1 row-start-1 flex flex-col gap-y-6 transition-opacity duration-300 motion-reduce:transition-none ${
          slideIndex === index ? "opacity-100" : "invisible opacity-0"
        }`}
        aria-hidden={slideIndex !== index}
      >
        {slide.services.map((service, serviceIndex) => (
          <div
            key={service.number}
            className={serviceIndex > 0 ? "border-t border-gray-200 pt-6" : ""}
          >
            <div className="flex items-baseline gap-x-3">
              <span className="text-3xl font-extrabold text-brand-500">
                {service.number}
              </span>
              <Text className="text-xl font-bold text-gray-900">
                {service.name}
              </Text>
            </div>
            <Text className="mt-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
              {service.tagline}
            </Text>
            <Text className="mt-2 text-base text-gray-600">
              {service.description}
            </Text>
            <ul className="mt-3 flex flex-col gap-y-1.5">
              {service.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-x-2 text-sm text-gray-700"
                >
                  <CheckCircleSolid className="mt-0.5 shrink-0 text-brand-500" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ))}
  </div>
)

export default ServiceDetails
