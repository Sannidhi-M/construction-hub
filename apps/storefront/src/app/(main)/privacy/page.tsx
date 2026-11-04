import { Metadata } from "next"
import LegalPage, {
  LegalSection,
} from "@modules/legal/components/legal-page"
import { SITE_EMAIL, SITE_LOCATION, SITE_NAME, SITE_PHONE } from "@lib/constants"

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: `What personal information ${SITE_NAME} collects, why we collect it, and the choices you have.`,
}

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About this policy",
    content: (
      <>
        <p>
          This Privacy Policy explains how {SITE_NAME} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;), based in {SITE_LOCATION}, collects, uses, shares
          and protects your personal information when you use this website to
          buy materials, book labour or request engineering services. We handle
          your data in line with the Information Technology Act, 2000 and the
          Digital Personal Data Protection Act, 2023.
        </p>
        <p>
          By using the site or giving us your information, you agree to the
          practices described here.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    title: "What we collect",
    content: (
      <>
        <ul>
          <li>
            <strong>Account details:</strong> name, email address and phone
            number. If you sign up with email, we also hold your password,
            stored in hashed form and never in plain text. If you sign in with
            your phone number, you use a one-time code instead.
          </li>
          <li>
            <strong>Addresses:</strong> delivery, billing and site addresses you
            enter, including those saved from past orders and bookings.
          </li>
          <li>
            <strong>Orders, bookings and quotes:</strong> what you bought or
            requested, dates, amounts, site details and any notes or files you
            send with a quote request.
          </li>
          <li>
            <strong>Messages:</strong> what you write in the Contact form, and
            messages you send us on WhatsApp.
          </li>
          <li>
            <strong>Verification codes:</strong> one-time passwords (OTP) sent to
            your email or phone to verify your account.
          </li>
          <li>
            <strong>Payment information:</strong> the payment method you chose
            (UPI or Cash on Delivery), the amount, and whether you tapped
            &ldquo;I&apos;ve Paid&rdquo;. We do not run a card or net-banking
            gateway and never ask for your card number, PIN or UPI PIN. For UPI
            you pay from your own UPI app to our UPI ID, and we verify the
            payment manually by checking our bank or UPI account. This means
            your name, UPI ID and the amount may be visible to us in our payment
            records, and your bank or UPI app handles the rest.
          </li>
          <li>
            <strong>Technical data:</strong> device and browser type, IP address
            and pages visited, collected through cookies and similar technology
            (see Cookies below).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    content: (
      <>
        <ul>
          <li>To create and secure your account and verify who you are.</li>
          <li>To process orders, deliver goods, schedule labour and prepare quotes.</li>
          <li>To verify payments we receive, issue tax invoices and handle refunds.</li>
          <li>To send order, booking and quote updates by email, SMS or WhatsApp.</li>
          <li>To answer your questions and resolve complaints.</li>
          <li>To prevent fraud and keep the site secure.</li>
          <li>To improve the site and our services.</li>
          <li>To meet legal, tax and accounting obligations.</li>
        </ul>
        <p>
          We send marketing messages only if you have agreed to receive them,
          and you can opt out at any time. Service messages about an order or
          booking you have made are not marketing.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    content: (
      <>
        <p>We do not sell your personal information. We share it only with:</p>
        <ul>
          <li>
            <strong>Delivery partners and labour/site staff</strong>, limited to
            what is needed to deliver your order or reach your site (name, phone
            and address).
          </li>
          <li>
            <strong>Your bank and UPI network</strong>, which process UPI
            payments and refunds between you and us under their own privacy
            terms.
          </li>
          <li>
            <strong>Service providers</strong> that help us run the site, such
            as hosting, email and SMS delivery, who may use the data only to
            provide that service to us.
          </li>
          <li>
            <strong>Authorities</strong>, when required by law, a court order or
            to protect our rights and the safety of others.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and similar technology",
    content: (
      <>
        <p>
          We use cookies and browser storage to keep you signed in, remember
          your cart and region, and keep the site working. You can block or
          delete cookies in your browser settings, but some parts of the site,
          such as the cart, checkout and your account, will not work without
          them. See our Cookie Policy for details.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    content: (
      <p>
        We keep your information while your account is active and as long as
        needed to provide our services. Order and invoice records are kept for
        the period required by tax and accounting law. When data is no longer
        needed, we delete it or anonymise it.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <p>
        We use reasonable technical and organisational measures to protect your
        information, including encrypted connections (HTTPS) and hashed
        passwords. No system is completely secure, so we cannot guarantee
        absolute security. Please keep your password and OTPs private.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your choices and rights",
    content: (
      <>
        <p>You may, subject to applicable law:</p>
        <ul>
          <li>access the personal information we hold about you;</li>
          <li>correct inaccurate or incomplete information;</li>
          <li>
            ask us to delete your information (we may need to keep some records
            for legal reasons);
          </li>
          <li>withdraw consent you have given, such as for marketing;</li>
          <li>nominate someone to exercise these rights on your behalf;</li>
          <li>make a complaint about how your data is handled.</li>
        </ul>
        <p>
          You can edit your profile and addresses from your account. For
          anything else, contact us using the details below and we will respond
          within a reasonable time.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    content: (
      <p>
        The site is meant for adults. We do not knowingly collect personal
        information from anyone under 18. If you believe a child has given us
        their data, contact us and we will delete it.
      </p>
    ),
  },
  {
    id: "links",
    title: "Third-party links",
    content: (
      <p>
        The site may link to other websites, such as WhatsApp or Google Maps.
        They have their own privacy practices and we are not responsible for
        them.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy. The &ldquo;Last updated&rdquo; date above
        shows the current version. For material changes we will take extra steps
        to tell you, such as a notice on the site.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact and grievances",
    content: (
      <p>
        For privacy questions, requests or complaints, email{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> or call {SITE_PHONE}.
        You can also reach our Grievance Officer as described on the Grievance
        Redressal page.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="What personal information we collect, why we collect it, and the choices you have."
      lastUpdated="31 October 2026"
      sections={sections}
    />
  )
}
