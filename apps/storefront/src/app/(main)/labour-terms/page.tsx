import { Metadata } from "next"
import LegalPage, {
  LegalSection,
} from "@modules/legal/components/legal-page"
import { SITE_EMAIL, SITE_NAME, SITE_PHONE } from "@lib/constants"

export const metadata: Metadata = {
  title: `Labour Service Terms | ${SITE_NAME}`,
  description: `The terms for booking skilled and unskilled workers through ${SITE_NAME}: confirmation, wages, site safety, cancellation and disputes.`,
}

const sections: LegalSection[] = [
  {
    id: "scope",
    title: "About these terms",
    content: (
      <p>
        These terms apply to every labour and manpower booking made through{" "}
        {SITE_NAME}. They add to our Terms &amp; Conditions, Refund &amp;
        Cancellation Policy and Disclaimer. If they conflict on a labour
        booking, these terms apply.
      </p>
    ),
  },
  {
    id: "booking",
    title: "How a booking works",
    content: (
      <ul>
        <li>
          Choosing a trade, number of workers, dates and time on the site sends
          us a <strong>booking request</strong>. It is not confirmed until our
          team calls or messages you and confirms the details.
        </li>
        <li>
          We confirm based on worker availability for your dates and area. If we
          cannot supply the workers, we will tell you and you will not be
          charged.
        </li>
        <li>
          Please check the trade, number of workers, address, start time and
          duration in your confirmation. Tell us straight away if anything is
          wrong.
        </li>
        <li>
          Workers may be substituted with others of the same trade and similar
          skill where needed, for example because of illness.
        </li>
      </ul>
    ),
  },
  {
    id: "rates",
    title: "Rates and payment",
    content: (
      <ul>
        <li>
          Bookings are charged per day or per hour as shown when you book, in
          Indian Rupees, per worker. The total shown is an estimate based on the
          dates or hours you selected.
        </li>
        <li>
          If work runs longer than booked, or more days are needed, the extra
          time is charged at the same rate once you agree to it.
        </li>
        <li>
          You can pay by UPI, using the QR code or link shown after you book, or
          as agreed with us when we confirm. A booking is treated as paid once
          we have verified the payment.
        </li>
        <li>
          Wages are paid to workers by us. Please do not pay workers extra or
          make separate payment arrangements for the booked hours unless we have
          agreed to it.
        </li>
        <li>
          GST and any other applicable taxes are added as required by law.
        </li>
      </ul>
    ),
  },
  {
    id: "workers",
    title: "Status of the workers",
    content: (
      <ul>
        <li>
          Workers are arranged by {SITE_NAME} to carry out work at your site
          under your day-to-day direction for the booked period. They are not
          your employees, and you do not take on any employer obligations to
          them beyond those in these terms.
        </li>
        <li>
          Workers are skilled or unskilled as the trade you book describes.
          Output varies between individuals, and we do not guarantee how much
          work is done in a day.
        </li>
      </ul>
    ),
  },
  {
    id: "site",
    title: "Your responsibilities at the site",
    content: (
      <>
        <p>You agree to:</p>
        <ul>
          <li>give accurate information about the site, the work and any hazards;</li>
          <li>
            keep the site safe, with safe access, suitable working conditions
            and drinking water, and not ask workers to work in conditions that
            are dangerous;
          </li>
          <li>
            provide the materials, tools and equipment the job needs, and
            safety gear such as helmets, harnesses and scaffolding where the
            work calls for it, unless we have agreed to provide them;
          </li>
          <li>
            direct workers only to the trade and tasks booked. Work that is
            different, or more dangerous, needs our prior agreement and may cost
            more;
          </li>
          <li>
            not make workers work beyond the booked hours without agreement, and
            treat them with respect;
          </li>
          <li>
            have the site ready and be available (or nominate someone) when the
            workers arrive.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "safety",
    title: "Safety, accidents and insurance",
    content: (
      <ul>
        <li>
          Workers may refuse a task they reasonably believe is unsafe, and we
          may withdraw them from a site that is.
        </li>
        <li>
          If a worker is injured or something is damaged, tell us immediately and
          arrange first aid or emergency care first. We will help with
          follow-up.
        </li>
        <li>
          Unless these terms or the law say otherwise, you are responsible for
          loss or damage that happens because of an unsafe site, a lack of
          proper equipment, or your instructions. Our liability is limited as
          stated in the Terms &amp; Conditions and Disclaimer.
        </li>
      </ul>
    ),
  },
  {
    id: "cancel",
    title: "Cancellation, no-shows and ending a booking",
    content: (
      <>
        <p>
          The details are in the Refund &amp; Cancellation Policy. In short:
        </p>
        <ul>
          <li>
            cancelling more than 24 hours before the start time is free;
          </li>
          <li>
            within 24 hours of the start, up to one day&apos;s wages per worker may
            be charged;
          </li>
          <li>
            if workers arrive and cannot start because the site is not ready or
            you are not reachable, the day&apos;s wages are charged;
          </li>
          <li>
            if we cannot supply workers or cancel for our own reasons, you are
            refunded in full.
          </li>
        </ul>
        <p>
          We may end a booking and withdraw workers, with payment due for time
          already worked, if workers are mistreated, asked to do unsafe work, or
          if payment due is not made.
        </p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "Conduct, theft and damage",
    content: (
      <ul>
        <li>
          We expect workers to behave honestly and professionally. Report any
          misconduct to us at once and we will deal with it, including
          replacing the worker.
        </li>
        <li>
          Please secure valuables and keep tools and materials you cannot afford
          to lose out of reach. If you suspect theft or damage, tell us and
          report it to the police if you wish. We will cooperate with an
          inquiry, but we are not responsible for items left unsecured.
        </li>
      </ul>
    ),
  },
  {
    id: "complaints",
    title: "Complaints and disputes",
    content: (
      <p>
        If the workers or work did not meet what was booked, tell us on the day
        or within 24 hours so we can send a replacement or fix it, and see our
        Grievance Redressal page for formal complaints. Disputes are governed by
        the Terms &amp; Conditions.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <p>
        Questions about a booking? Call {SITE_PHONE} or email{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> with your booking
        number.
      </p>
    ),
  },
]

export default function LabourTermsPage() {
  return (
    <LegalPage
      title="Labour Service Terms"
      description="The terms for booking skilled and unskilled workers: confirmation, wages, site safety, cancellation and disputes."
      lastUpdated="4 November 2026"
      sections={sections}
    />
  )
}
