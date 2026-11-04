import { Metadata } from "next"
import LegalPage, {
  LegalSection,
} from "@modules/legal/components/legal-page"
import {
  GRIEVANCE_HOURS,
  GRIEVANCE_OFFICER_NAME,
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_LOCATION,
  SITE_NAME,
  SITE_PHONE,
} from "@lib/constants"

export const metadata: Metadata = {
  title: `Grievance Redressal | ${SITE_NAME}`,
  description: `How to raise a complaint with ${SITE_NAME}, who handles it, and how quickly we respond.`,
}

const sections: LegalSection[] = [
  {
    id: "officer",
    title: "Grievance Officer",
    content: (
      <>
        <p>
          In line with the Consumer Protection (E-Commerce) Rules, 2020 and the
          Information Technology Act, 2000, we have appointed a Grievance
          Officer to handle complaints about our products, services, orders,
          bookings, quotes and your personal data.
        </p>
        <ul>
          <li>
            <strong>Name:</strong> {GRIEVANCE_OFFICER_NAME}
          </li>
          <li>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
          </li>
          <li>
            <strong>Phone:</strong> {SITE_PHONE}
          </li>
          <li>
            <strong>Available:</strong> {GRIEVANCE_HOURS}
          </li>
          <li>
            <strong>Address:</strong> {SITE_ADDRESS || SITE_LOCATION}
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "raise",
    title: "How to raise a complaint",
    content: (
      <>
        <p>
          Contact us by email, phone or the Contact page, and include:
        </p>
        <ul>
          <li>your name and the phone number or email on your account;</li>
          <li>
            your order, booking or quote number, if the complaint relates to
            one;
          </li>
          <li>what went wrong and what you would like us to do;</li>
          <li>
            photos, screenshots or a payment reference, where they help explain
            the problem.
          </li>
        </ul>
        <p>
          For a faster fix, please start with the team at the number above.
          If the problem is not resolved, ask for it to be treated as a
          grievance and we will log it formally.
        </p>
      </>
    ),
  },
  {
    id: "timeline",
    title: "What happens next",
    content: (
      <ul>
        <li>
          We will <strong>acknowledge</strong> your complaint within{" "}
          <strong>48 hours</strong> and give you a reference.
        </li>
        <li>
          We will <strong>resolve</strong> it within <strong>one month</strong>{" "}
          of receiving it, and sooner where we can.
        </li>
        <li>
          We will tell you the outcome and, if we cannot do what you asked, the
          reason.
        </li>
      </ul>
    ),
  },
  {
    id: "escalate",
    title: "If you are not satisfied",
    content: (
      <>
        <p>
          You can write back asking for a review of our decision. You may also
          approach:
        </p>
        <ul>
          <li>
            the <strong>National Consumer Helpline</strong> at 1915, or at{" "}
            <a href="https://consumerhelpline.gov.in" target="_blank" rel="noreferrer">
              consumerhelpline.gov.in
            </a>
            ;
          </li>
          <li>your local District Consumer Disputes Redressal Commission.</li>
        </ul>
      </>
    ),
  },
  {
    id: "privacy",
    title: "Privacy and data requests",
    content: (
      <p>
        To access, correct or delete your personal data, or withdraw consent,
        send your request to the same contact above. See our Privacy Policy for
        details.
      </p>
    ),
  },
]

export default function GrievancePage() {
  return (
    <LegalPage
      title="Grievance Redressal"
      description="How to raise a complaint, who handles it, and how quickly we respond."
      lastUpdated="4 November 2026"
      sections={sections}
    />
  )
}
