import { ReactNode } from "react"
import PlatformBanner from "@modules/common/components/platform-banner"
import { Heading, Text } from "@modules/common/components/ui"

export type LegalSection = {
  // Anchor id for the table of contents.
  id: string
  title: string
  content: ReactNode
}

type LegalPageProps = {
  title: string
  description: string
  // Shown as "Last updated"; bump it whenever the policy text changes.
  lastUpdated: string
  sections: LegalSection[]
}

/**
 * Shared layout for the policy pages (Terms, Privacy, Refunds, ...): the dark
 * banner, a table of contents and numbered sections, so every legal page
 * reads the same and only the text differs.
 */
const LegalPage = ({
  title,
  description,
  lastUpdated,
  sections,
}: LegalPageProps) => {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <PlatformBanner eyebrow="Legal" title={title} description={description} />
      <div className="content-container py-10">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 small:p-8 max-w-4xl mx-auto">
          <Text className="text-sm text-ui-fg-subtle">
            Last updated: {lastUpdated}
          </Text>

          <nav aria-label="Contents" className="mt-6 mb-8">
            <Heading level="h2" className="text-lg font-bold text-gray-900 mb-2">
              Contents
            </Heading>
            <ol className="list-decimal pl-5 grid gap-y-1 text-sm text-brand-600">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex flex-col gap-y-8">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <Heading level="h2" className="text-xl font-bold text-gray-900 mb-3">
                  {i + 1}. {s.title}
                </Heading>
                <div className="flex flex-col gap-y-3 text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-y-1.5 [&_a]:text-brand-600 [&_a:hover]:underline">
                  {s.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegalPage
