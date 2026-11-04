import { Metadata } from "next"
import LegalPage, {
  LegalSection,
} from "@modules/legal/components/legal-page"
import { SITE_EMAIL, SITE_LOCATION, SITE_NAME, SITE_PHONE } from "@lib/constants"

export const metadata: Metadata = {
  title: `Terms & Conditions | ${SITE_NAME}`,
  description: `The terms that apply when you buy materials, book labour or request engineering services on ${SITE_NAME}.`,
}

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    content: (
      <>
        <p>
          These Terms &amp; Conditions govern your use of this website and the
          services offered through it by {SITE_NAME} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;), based in {SITE_LOCATION}. By browsing the site,
          creating an account or placing an order, booking or quote request,
          you agree to these terms.
        </p>
        <p>
          If you do not agree, please do not use the site. We may update these
          terms from time to time; the &ldquo;Last updated&rdquo; date above
          shows the current version, and continued use after a change means you
          accept it.
        </p>
      </>
    ),
  },
  {
    id: "services",
    title: "What we offer",
    content: (
      <>
        <p>{SITE_NAME} provides three kinds of service:</p>
        <ul>
          <li>
            <strong>Construction materials</strong> &mdash; cement, steel,
            aggregates, bricks and similar products sold for delivery.
          </li>
          <li>
            <strong>Labour &amp; manpower</strong> &mdash; booking of skilled
            and unskilled workers for a site, for a stated period.
          </li>
          <li>
            <strong>Engineering services</strong> &mdash; quotes and delivery of
            design, estimation and related engineering work.
          </li>
        </ul>
        <p>
          Each service is also subject to the policies linked in the footer
          (shipping, refunds and cancellation, and so on). If a service-specific
          policy conflicts with these terms, the service-specific policy
          applies to that service.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility and your account",
    content: (
      <>
        <ul>
          <li>You must be at least 18 years old and able to enter a binding contract.</li>
          <li>
            If you buy on behalf of a company or firm, you confirm you are
            authorised to do so.
          </li>
          <li>
            You must give accurate name, phone, email and address details, and
            keep them up to date. Orders, bookings and quotes may be delayed or
            cancelled if the details are wrong.
          </li>
          <li>
            You are responsible for activity on your account and for keeping
            your login and one-time passwords (OTP) confidential. Tell us
            immediately if you suspect misuse.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "pricing",
    title: "Prices, taxes and payment",
    content: (
      <>
        <ul>
          <li>All prices are in Indian Rupees (INR).</li>
          <li>
            Material rates can change with the market. The price that applies
            is the one shown when you place the order and confirmed in your
            order summary.
          </li>
          <li>
            GST and any other applicable taxes are shown or added as required by
            law. A tax invoice is issued for every order.
          </li>
          <li>
            Delivery, loading/unloading and similar charges, where they apply,
            are shown before you confirm.
          </li>
          <li>
            We may correct an obvious pricing or listing error. If that happens
            after you order, we will contact you and you may cancel for a full
            refund.
          </li>
          <li>
            You can pay by UPI or Cash on Delivery, as offered at checkout. For
            UPI, you pay from your own UPI app using the QR code or payment
            link shown after you order. Tapping &ldquo;I&apos;ve Paid&rdquo;
            only tells us you have sent the payment; your order is confirmed
            once we verify that the money has reached our account, which may
            take some time. We never ask for your card number, PIN or UPI PIN.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "orders",
    title: "Orders and acceptance",
    content: (
      <>
        <p>
          Placing an order is an offer to buy. A contract is formed when we
          confirm the order. We may decline or cancel an order for reasons such
          as stock or availability, an address we cannot deliver to, a pricing
          error, or suspected fraud. If we cancel after you have paid, you will
          be refunded in full.
        </p>
      </>
    ),
  },
  {
    id: "materials",
    title: "Materials: delivery and acceptance",
    content: (
      <>
        <ul>
          <li>
            Delivery dates are estimates. Delays outside our control (weather,
            road restrictions, supplier delays) do not make us liable beyond
            refunding any amount for goods not delivered.
          </li>
          <li>
            Someone must be present to receive and check the goods. Please
            inspect on delivery and report damage or shortage to us promptly,
            as set out in the Refund &amp; Cancellation Policy.
          </li>
          <li>
            Product descriptions, images and specifications are indicative.
            Colour, size or finish of natural and bulk materials can vary
            slightly between batches.
          </li>
          <li>
            Risk in the goods passes to you on delivery. Unloading and stacking
            at the site are your responsibility unless we have agreed otherwise
            in writing.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "labour",
    title: "Labour bookings",
    content: (
      <>
        <ul>
          <li>
            A booking reserves workers for the date, duration and trade you
            select. Final allocation depends on availability, and we will tell
            you if a substitute is needed.
          </li>
          <li>
            You must provide a safe working site, access, and any safety
            equipment or conditions required for the work you describe. You must
            not assign work different from what was booked without our
            agreement.
          </li>
          <li>
            Wages and charges are those shown at booking. Extra hours or days
            are charged at the stated rate.
          </li>
          <li>
            Cancellation and no-show terms are set out in the Refund &amp;
            Cancellation Policy.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "engineering",
    title: "Engineering services and quotes",
    content: (
      <>
        <ul>
          <li>
            A quote is an estimate based on the information you give. It is
            valid for the period stated on it and may change if the scope,
            site conditions or your requirements change.
          </li>
          <li>
            Work starts once the quote is accepted and any advance payment is
            received.
          </li>
          <li>
            Drawings, estimates and reports are prepared for the project they
            were commissioned for. Where a structure needs approval or sign-off
            from a licensed professional or local authority, that is stated in
            the scope and is not implied otherwise.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cancellation",
    title: "Cancellations, returns and refunds",
    content: (
      <p>
        Cancellations, returns and refunds are handled under our Refund &amp;
        Cancellation Policy and Shipping &amp; Delivery Policy. Those policies
        form part of these terms.
      </p>
    ),
  },
  {
    id: "use",
    title: "Acceptable use",
    content: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>give false information or impersonate anyone;</li>
          <li>attempt to access accounts, systems or data you are not authorised to;</li>
          <li>interfere with the site, use bots or scrape it without permission;</li>
          <li>use the site for any unlawful purpose.</li>
        </ul>
        <p>
          We may suspend or close an account that breaks these rules or is used
          fraudulently.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    title: "Intellectual property",
    content: (
      <p>
        The site&apos;s name, logo, design, text and software belong to{" "}
        {SITE_NAME} or its licensors, except where credited to a third party
        (for example, some photographs credited in the footer). You may not
        copy or reuse them without our written permission.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: (
      <>
        <p>
          We take care over the accuracy of the site and our services, but
          information is provided &ldquo;as is&rdquo;. See also our Disclaimer.
        </p>
        <p>
          To the extent the law allows, our total liability for any claim
          connected with an order, booking or quote is limited to the amount you
          paid for it, and we are not liable for indirect or consequential loss
          such as lost profit or project delay. Nothing in these terms limits
          liability that cannot lawfully be limited, or your rights as a
          consumer under Indian law.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "Privacy",
    content: (
      <p>
        How we collect and use your personal information is explained in our
        Privacy Policy.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law and disputes",
    content: (
      <p>
        These terms are governed by the laws of India. Courts at{" "}
        {SITE_LOCATION} have jurisdiction over disputes, subject to any rights
        you have as a consumer to approach a consumer forum. Please contact us
        first &mdash; most issues are resolved quickly without a dispute.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> or call {SITE_PHONE}.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="The terms that apply when you buy materials, book labour or request engineering services."
      lastUpdated="31 October 2026"
      sections={sections}
    />
  )
}
