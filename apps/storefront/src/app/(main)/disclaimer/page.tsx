import { Metadata } from "next"
import LegalPage, {
  LegalSection,
} from "@modules/legal/components/legal-page"
import { SITE_EMAIL, SITE_NAME, SITE_PHONE } from "@lib/constants"

export const metadata: Metadata = {
  title: `Disclaimer | ${SITE_NAME}`,
  description: `Important limits on the information, estimates and services offered through ${SITE_NAME}.`,
}

const sections: LegalSection[] = [
  {
    id: "general",
    title: "General",
    content: (
      <p>
        The information on this website is provided in good faith for general
        guidance. We try to keep it accurate and current, but we make no promise
        that it is complete or error-free. You use it at your own risk. This
        Disclaimer is part of our Terms &amp; Conditions.
      </p>
    ),
  },
  {
    id: "materials",
    title: "Materials: prices, specifications and images",
    content: (
      <ul>
        <li>
          Material rates move with the market. The rate that applies to you is
          the one confirmed in your order. A rate shown on a page, or one you
          saw earlier, is not an offer if it has since changed.
        </li>
        <li>
          Photos are for illustration. The product you receive may differ
          slightly in colour, size, texture or packaging between batches. We
          supply the brand you ordered; we do not swap it for another brand
          without asking you first.
        </li>
        <li>
          Specifications, grades and quantities listed are as supplied by
          manufacturers or typical for the product. Check that a material suits
          your use before ordering, and ask us if you are unsure.
        </li>
        <li>
          Quantity guides and calculators, where shown, are estimates and do
          not account for wastage, site conditions or your particular design.
        </li>
        <li>
          Brand names and trademarks belong to their owners. Their use does not
          imply endorsement of us or by us.
        </li>
      </ul>
    ),
  },
  {
    id: "labour",
    title: "Labour and manpower",
    content: (
      <ul>
        <li>
          We arrange workers for the trade and period you book. Skill level and
          output can vary between individuals, and we do not guarantee the
          amount of work completed in a day.
        </li>
        <li>
          Workers carry out the tasks you direct at your site. You are
          responsible for site safety, supervision, tools, safety equipment and
          the work they are asked to do, as set out in our Terms.
        </li>
        <li>
          We are not responsible for loss or damage arising from work you
          direct, an unsafe site, or instructions that differ from what was
          booked, except where the law makes us liable.
        </li>
      </ul>
    ),
  },
  {
    id: "engineering",
    title: "Engineering services and estimates",
    content: (
      <ul>
        <li>
          Quotes, cost estimates and quantity take-offs are based on the
          information you give and on assumptions that we state. Actual cost and
          time depend on site conditions, material prices and changes in scope,
          and may differ.
        </li>
        <li>
          Our services are not a substitute for statutory approvals, inspections
          or sign-off from a licensed structural engineer, architect or the local
          authority where those are required. If your project needs them, the
          scope will say so; you remain responsible for obtaining them unless we
          have agreed in writing to do so.
        </li>
        <li>
          Information on the website about engineering, construction methods or
          codes is general and not professional advice for your specific project.
        </li>
      </ul>
    ),
  },
  {
    id: "results",
    title: "No guarantee of results",
    content: (
      <p>
        Construction outcomes depend on many factors outside our control,
        including workmanship by others, weather, ground conditions and the way
        materials are used. We do not guarantee any particular result, timeline
        or cost saving from using our materials or services.
      </p>
    ),
  },
  {
    id: "availability",
    title: "Availability and technical issues",
    content: (
      <p>
        We try to keep the site running, but it may sometimes be unavailable,
        slow, or show errors, including out-of-date stock or rates. We are not
        liable for losses from downtime, delays in messages or notifications
        (such as OTPs, emails or WhatsApp), or technical faults outside our
        control. If you suspect an error in your order, contact us before
        relying on it.
      </p>
    ),
  },
  {
    id: "links",
    title: "External links",
    content: (
      <p>
        Links to other sites, such as WhatsApp or maps, are offered for
        convenience. We do not control or endorse their content and are not
        responsible for it.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limits of liability",
    content: (
      <p>
        To the fullest extent the law allows, we are not liable for indirect or
        consequential loss arising from use of this site or our services. Our
        liability is limited as set out in the Terms &amp; Conditions. Nothing
        here removes any right you have under Indian consumer law that cannot be
        excluded.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <p>
        If something on the site looks wrong or unclear, tell us on {SITE_PHONE}{" "}
        or at <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>.
      </p>
    ),
  },
]

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      description="Important limits on the information, estimates and services offered on this site."
      lastUpdated="3 November 2026"
      sections={sections}
    />
  )
}
