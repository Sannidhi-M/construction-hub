import { Metadata } from "next"
import LegalPage, {
  LegalSection,
} from "@modules/legal/components/legal-page"
import { SITE_EMAIL, SITE_NAME, SITE_PHONE } from "@lib/constants"

export const metadata: Metadata = {
  title: `Refund & Cancellation Policy | ${SITE_NAME}`,
  description: `How to cancel an order, booking or quote with ${SITE_NAME}, and when and how refunds are paid.`,
}

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <p>
        This policy explains how to cancel an order, labour booking or
        engineering quote, and when you are entitled to a refund. It forms part
        of our Terms &amp; Conditions. To cancel or ask for a refund, contact us
        on {SITE_PHONE} or at <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>{" "}
        with your order or booking number.
      </p>
    ),
  },
  {
    id: "materials-cancel",
    title: "Materials: cancelling an order",
    content: (
      <ul>
        <li>
          <strong>Before dispatch:</strong> you can cancel for a full refund.
        </li>
        <li>
          <strong>After dispatch:</strong> once the goods are on the way we may
          not be able to cancel. If the delivery can be turned back, the actual
          transport charges incurred may be deducted from your refund.
        </li>
        <li>
          <strong>Made-to-order, cut, mixed or custom-sized items</strong>{" "}
          (for example, cut steel or ready-mix) cannot be cancelled once
          preparation has started.
        </li>
        <li>
          If we cancel an order (for example, out of stock or an address we
          cannot reach), you receive a full refund.
        </li>
      </ul>
    ),
  },
  {
    id: "materials-returns",
    title: "Materials: damaged, wrong or short deliveries",
    content: (
      <>
        <p>
          Please check the goods when they arrive, ideally before the delivery
          person leaves. Report a problem within <strong>48 hours</strong> of
          delivery with your order number and clear photos.
        </p>
        <ul>
          <li>
            <strong>Damaged, defective or wrong item:</strong> we will replace it
            or refund it, at your choice where stock allows, and we bear the
            return transport.
          </li>
          <li>
            <strong>Short quantity:</strong> we will deliver the missing
            quantity or refund its value.
          </li>
          <li>
            <strong>Change of mind:</strong> bulk construction materials are not
            returnable once delivered, because they cannot be resold after
            handling. Unopened, undamaged items may be accepted back at our
            discretion, with return transport and a handling fee charged to you.
          </li>
          <li>
            Items used, mixed, cut, wet, or damaged after delivery are not
            eligible.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "labour",
    title: "Labour bookings",
    content: (
      <ul>
        <li>
          <strong>More than 24 hours before the start time:</strong> cancel free
          of charge for a full refund.
        </li>
        <li>
          <strong>Within 24 hours of the start time:</strong> a cancellation
          charge of up to one day&apos;s wages per booked worker may apply, as
          workers will already be set aside for you.
        </li>
        <li>
          <strong>No-show or site not ready:</strong> if workers arrive and
          cannot start because of the site, access or your instructions, the
          day&apos;s wages are charged.
        </li>
        <li>
          <strong>If we cannot supply workers</strong> or cancel for any reason
          of our own, you receive a full refund of what you paid.
        </li>
        <li>
          If you end a booking early, you pay for the days or hours already
          worked and are refunded the unused balance.
        </li>
      </ul>
    ),
  },
  {
    id: "engineering",
    title: "Engineering services and quotes",
    content: (
      <ul>
        <li>
          Requesting a quote is free, and you can decline it at any time.
        </li>
        <li>
          <strong>Before work starts:</strong> an advance paid for a quote you
          accepted is refunded, less any payment-processing cost already
          incurred.
        </li>
        <li>
          <strong>After work has started:</strong> you pay for the work done up
          to the point of cancellation, and the rest of the advance is
          refunded.
        </li>
        <li>
          <strong>Completed and delivered work</strong> (drawings, estimates,
          reports) is not refundable. If it does not match the agreed scope, we
          will correct it, and if we cannot, we will refund the affected part.
        </li>
      </ul>
    ),
  },
  {
    id: "how-refunds",
    title: "How refunds are paid",
    content: (
      <ul>
        <li>
          <strong>UPI payments:</strong> refunded to the UPI ID or bank account
          you paid from, or another account in your name that you confirm to us.
        </li>
        <li>
          <strong>Cash on Delivery:</strong> if nothing was paid, there is
          nothing to refund. If you paid cash and are owed a refund, we will
          pay it by UPI or bank transfer to an account in your name.
        </li>
        <li>
          <strong>Timeline:</strong> we start the refund within{" "}
          <strong>3 working days</strong> of approving it, and it normally
          reaches you within <strong>5&ndash;7 working days</strong>, depending
          on your bank.
        </li>
        <li>
          We will tell you by phone, email or WhatsApp when the refund is sent.
          Keep the transaction reference we share if you need to follow it up
          with your bank.
        </li>
      </ul>
    ),
  },
  {
    id: "unverified",
    title: "Payments we could not verify",
    content: (
      <p>
        Our UPI payments are verified manually. If you paid but your order was
        not confirmed, or you paid twice, contact us with the transaction
        reference and a screenshot. We will check, confirm your order, or
        refund the extra amount, using the timeline above.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <p>
        Questions about a cancellation or refund? Call {SITE_PHONE} or email{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>. If you are not
        satisfied with our response, see the Grievance Redressal page.
      </p>
    ),
  },
]

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      description="How to cancel an order, booking or quote, and when and how refunds are paid."
      lastUpdated="31 October 2026"
      sections={sections}
    />
  )
}
