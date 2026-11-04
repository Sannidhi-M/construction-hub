import { Metadata } from "next"
import LegalPage, {
  LegalSection,
} from "@modules/legal/components/legal-page"
import { SITE_EMAIL, SITE_NAME, SITE_PHONE } from "@lib/constants"

export const metadata: Metadata = {
  title: `Engineering Services Terms | ${SITE_NAME}`,
  description: `The terms for design, estimation, construction and installation work quoted through ${SITE_NAME}: quotes, payments, revisions, approvals and handover.`,
}

const sections: LegalSection[] = [
  {
    id: "scope",
    title: "About these terms",
    content: (
      <>
        <p>
          These terms apply to every engineering service quoted or provided
          through {SITE_NAME}. They cover two kinds of work:
        </p>
        <ul>
          <li>
            <strong>Design and advisory work</strong> &mdash; floor plans, 3D
            elevations, structural drawings, interior and space planning, BOQ
            and quantity estimation, cost estimation, and property valuation or
            assessment.
          </li>
          <li>
            <strong>Construction and installation work</strong> &mdash; turnkey
            construction and renovation, and works such as precast compound
            walls, steel fabrication, gates and grills, UPVC and aluminium doors
            and windows, glazing, waterproofing, roofing and solar water
            heaters.
          </li>
        </ul>
        <p>
          They add to our Terms &amp; Conditions, Refund &amp; Cancellation
          Policy and Disclaimer. If they conflict on an engineering job, these
          terms apply.
        </p>
      </>
    ),
  },
  {
    id: "quotes",
    title: "Quotes",
    content: (
      <ul>
        <li>
          Submitting a quote request on the site is free and creates no
          obligation for either side.
        </li>
        <li>
          Our team will contact you to understand the work and, where needed,
          visit or ask for details of the site. The quote we send states the
          scope, price, timeline, payment plan and anything excluded.
        </li>
        <li>
          A quote is an estimate based on the information and drawings you gave
          us. It is valid for <strong>30 days</strong> unless it says otherwise,
          after which prices (especially for materials) may change.
        </li>
        <li>
          The work is agreed only when you accept the quote, in writing, by
          message or on a call that we confirm in writing, and pay any advance
          asked for.
        </li>
      </ul>
    ),
  },
  {
    id: "payment",
    title: "Prices and payment",
    content: (
      <ul>
        <li>
          Prices are in Indian Rupees. GST and other taxes are added as required
          by law and shown in the quote or invoice.
        </li>
        <li>
          The payment plan is set out in the quote. It is usually an advance to
          start, followed by stage payments (for example, on delivery of
          drawings, on completion of a stage of site work) and a balance on
          completion or handover.
        </li>
        <li>
          You can pay by UPI or as we agree in the quote. As with other orders, a
          payment counts once we have verified that it has reached us.
        </li>
        <li>
          Work on a stage may pause if the payment due for the previous stage is
          late, and delivery dates move accordingly.
        </li>
      </ul>
    ),
  },
  {
    id: "yours",
    title: "What we need from you",
    content: (
      <ul>
        <li>
          Accurate information: plot size and dimensions, existing drawings,
          ownership and land documents where relevant, your requirements and
          budget. We rely on what you give us.
        </li>
        <li>
          Access to the site for measurement, inspection or work, with the
          site clear and safe.
        </li>
        <li>
          Timely decisions and approvals. Delays on your side can move our dates
          and may change the price.
        </li>
        <li>
          Permissions and approvals for your project (building plan sanction,
          municipal or panchayat approvals, utility connections and similar),
          unless the quote says we will arrange them.
        </li>
      </ul>
    ),
  },
  {
    id: "design",
    title: "Design and advisory work",
    content: (
      <ul>
        <li>
          Drawings, 3D views, BOQs and estimates are prepared for your project
          from your brief. The quote states the deliverables and how many
          rounds of changes are included (we normally include a reasonable
          number of revisions to the same brief).
        </li>
        <li>
          Changes beyond the agreed brief, such as a new layout, additional
          floors or extra areas, are new work and may be quoted separately.
        </li>
        <li>
          <strong>Estimates are not fixed prices.</strong> Cost estimates and
          quantity take-offs depend on assumptions in the quote, current rates
          and site conditions. Actual cost can differ.
        </li>
        <li>
          <strong>Structural and statutory approvals.</strong> Where a design
          needs review or sign-off from a licensed structural engineer,
          architect or local authority, the quote states who provides it. We do
          not imply approval where we have not stated it, and you must not build
          from drawings that require approval until it is obtained.
        </li>
        <li>
          <strong>Property valuation or assessment</strong> is an indicative
          opinion based on the inspection and information available. It is not a
          bank or government valuation unless the report says so.
        </li>
      </ul>
    ),
  },
  {
    id: "works",
    title: "Construction and installation work",
    content: (
      <ul>
        <li>
          Work is done to the scope, specifications and materials in the quote.
          Substitute materials of equal or better quality may be used if
          something is unavailable, and we will tell you of any change in price.
        </li>
        <li>
          The site must be ready, accessible and safe on the agreed dates, with
          power and water available if the work needs them, unless the quote
          says otherwise.
        </li>
        <li>
          Hidden site conditions (for example soft ground, existing damage,
          concealed pipes or wiring) can change the work needed. We will tell you
          and agree the extra cost with you before going ahead.
        </li>
        <li>
          Extra work you ask for during the job is a <strong>variation</strong>.
          We will tell you the cost and time and start it once you agree.
        </li>
        <li>
          Timelines are estimates. Weather, material supply, site access, your
          delays and approvals can move them, and we will keep you updated.
        </li>
        <li>
          On completion we will walk the work through with you. Please tell us
          of any defects at handover or within a reasonable time, and let us
          inspect and correct them.
        </li>
      </ul>
    ),
  },
  {
    id: "warranty",
    title: "Workmanship and warranty",
    content: (
      <p>
        We stand behind the quality of our workmanship. Where a warranty or
        defect-correction period applies to a service, it is stated in the
        quote. It does not cover damage from misuse, lack of maintenance,
        changes made by others, or events such as floods or accidents.
        Manufacturers&apos; warranties on materials and products, such as
        windows, glass or solar heaters, are given by the manufacturer on their
        own terms.
      </p>
    ),
  },
  {
    id: "ip",
    title: "Drawings and ownership of work",
    content: (
      <ul>
        <li>
          Once paid in full, you may use the drawings and documents we prepare
          for the project they were made for.
        </li>
        <li>
          We keep ownership of the design concepts, templates and methods we use
          in general, and may keep copies of drawings for our records. You may
          not reuse or sell the drawings for a different project without our
          permission.
        </li>
        <li>
          We may show photos of completed work as examples of our work, without
          showing your personal details, unless you ask us not to.
        </li>
      </ul>
    ),
  },
  {
    id: "cancel",
    title: "Cancellation and changes",
    content: (
      <p>
        Cancelling a job and any refund are covered in the Refund &amp;
        Cancellation Policy: advance for work not yet started is refunded, and
        you pay for work already done. We may stop work if payment due is not
        made, if the site is unsafe, or if we are asked to do something
        unlawful.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    content: (
      <p>
        Our liability for an engineering job is limited as described in the
        Terms &amp; Conditions and Disclaimer. We are not responsible for losses
        arising from information you gave incorrectly, from work by other
        contractors, from approvals that were refused or delayed, or from use of
        drawings or estimates beyond the project they were made for.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <p>
        Questions about a quote or a job? Call {SITE_PHONE} or email{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>. For formal
        complaints, see our Grievance Redressal page.
      </p>
    ),
  },
]

export default function EngineeringTermsPage() {
  return (
    <LegalPage
      title="Engineering Services Terms"
      description="The terms for design, estimation, construction and installation work: quotes, payments, revisions, approvals and handover."
      lastUpdated="4 November 2026"
      sections={sections}
    />
  )
}
