import { Metadata } from "next"
import LegalPage, {
  LegalSection,
} from "@modules/legal/components/legal-page"
import {
  SITE_EMAIL,
  SITE_LOCATION,
  SITE_NAME,
  SITE_PHONE,
} from "@lib/constants"

export const metadata: Metadata = {
  title: `Shipping & Delivery Policy | ${SITE_NAME}`,
  description: `Where ${SITE_NAME} delivers, how long it takes, delivery charges, and what to do when your materials arrive.`,
}

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <p>
        This policy covers delivery of construction materials ordered from{" "}
        {SITE_NAME}. It applies to goods only; labour and engineering services
        are provided at your site or remotely and are covered in our Terms
        &amp; Conditions. This policy is part of those terms.
      </p>
    ),
  },
  {
    id: "area",
    title: "Where we deliver",
    content: (
      <>
        <p>
          We deliver within a limited area around {SITE_LOCATION}. When you
          enter your pincode at checkout, the site tells you straight away
          whether we can deliver there. If your pincode is not covered, you will
          not be able to place the order.
        </p>
        <p>
          Not sure if we reach your site? Call {SITE_PHONE} before ordering. For
          sites outside the listed area we may be able to deliver by special
          arrangement.
        </p>
      </>
    ),
  },
  {
    id: "time",
    title: "Delivery time",
    content: (
      <ul>
        <li>
          Where stock is available, we usually deliver on the{" "}
          <strong>same day</strong> your order is confirmed. If you choose a
          different delivery date when ordering, we deliver on that date
          instead.
        </li>
        <li>
          Delivery times can vary with the material, quantity, stock and
          distance. The date shown when you order, or told to you when we
          confirm, is an estimate, not a guarantee.
        </li>
        <li>
          Orders are processed after your order is confirmed. For UPI orders
          that is after we have verified your payment, so the clock starts then.
        </li>
        <li>
          Bulk and heavy items (cement, steel, sand, aggregates, bricks) are
          sent on trucks or tempos and may be scheduled for a time slot.
        </li>
        <li>
          Delays caused by weather, road or traffic restrictions, supplier
          shortages, strikes or events outside our control are not a breach by
          us. We will keep you informed.
        </li>
      </ul>
    ),
  },
  {
    id: "charges",
    title: "Delivery charges",
    content: (
      <ul>
        <li>
          Delivery charges, if any, depend on the order and your location and
          are shown at checkout before you confirm. Some orders may qualify for
          free delivery above a minimum order value, when the site says so.
        </li>
        <li>
          Charges for unloading or carrying the goods up floors, waiting time
          caused by an unready site, or a second delivery attempt because
          nobody could receive the goods, may be charged extra, and we will tell
          you the amount first.
        </li>
        <li>
          Prices shown include applicable GST as described in your order
          summary and invoice.
        </li>
      </ul>
    ),
  },
  {
    id: "receiving",
    title: "Receiving your delivery",
    content: (
      <ul>
        <li>
          Please make sure someone is at the address to receive and check the
          goods, and that the vehicle can reach the site. Narrow lanes, soft
          ground or restricted access may mean goods are unloaded at the nearest
          point the vehicle can safely reach.
        </li>
        <li>
          Unless agreed otherwise, unloading and stacking at the site are your
          responsibility.
        </li>
        <li>
          If nobody can receive the goods and we cannot reach you, the vehicle
          may return and a re-delivery charge may apply.
        </li>
        <li>
          Cash on Delivery orders must be paid in full on delivery, and may be
          limited to certain orders or areas.
        </li>
      </ul>
    ),
  },
  {
    id: "inspect",
    title: "Checking your goods",
    content: (
      <p>
        Check the quantity, brand and condition of the goods when they arrive,
        before the delivery person leaves if you can. If something is wrong,
        note it on the delivery slip, take photos, and report it within 48 hours
        as described in our Refund &amp; Cancellation Policy. Risk in the goods
        passes to you on delivery.
      </p>
    ),
  },
  {
    id: "quantity",
    title: "Quantities, weights and variation",
    content: (
      <p>
        Bulk materials such as sand, aggregates and bricks are measured by
        weight, volume or count, and small variations are normal. Colour, grain
        and finish of natural materials can vary between batches. Steel and
        cement are supplied in the brand and grade shown in your order.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <p>
        Questions about a delivery? Call {SITE_PHONE} or email{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> with your order
        number.
      </p>
    ),
  },
]

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping & Delivery Policy"
      description="Where we deliver, how long it takes, delivery charges, and what to check when your materials arrive."
      lastUpdated="31 October 2026"
      sections={sections}
    />
  )
}
