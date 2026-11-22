import { listCategories } from "@lib/data/categories";
import { Text } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import LogoMark from "@modules/common/icons/logo-mark";
import { Envelope, MapPin, Phone } from "@medusajs/icons";
import {
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_GSTIN,
  SITE_LEGAL_NAME,
  SITE_LOCATION,
  SITE_NAME,
  SITE_PHONE,
} from "@lib/constants";

const serviceLinks = [
  { label: "Labour & Manpower", href: "/labour" },
  { label: "Engineering Services", href: "/engineering" },
  { label: "Get an Engineering Quote", href: "/engineering/quote" },
];

const supportLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "My Orders", href: "/account/orders" },
  { label: "Grievance Redressal", href: "/grievance" },
];

const legalLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund & Cancellation", href: "/refund-policy" },
  { label: "Shipping & Delivery", href: "/shipping-policy" },
  { label: "Labour Service Terms", href: "/labour-terms" },
  { label: "Engineering Services Terms", href: "/engineering-terms" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
];

// One footer column: a heading over a vertical list of links.
const LinkColumn = ({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) => (
  <div className="flex flex-col gap-y-3">
    <span className="txt-small-plus uppercase tracking-wide text-white">
      {title}
    </span>
    <ul className="flex flex-col gap-y-2 txt-small text-gray-400">
      {links.map((link) => (
        <li key={link.href}>
          <LocalizedClientLink className="hover:text-white" href={link.href}>
            {link.label}
          </LocalizedClientLink>
        </li>
      ))}
    </ul>
  </div>
);

export default async function Footer() {
  const productCategories = await listCategories();
  const shopLinks = (productCategories ?? [])
    .filter((c) => !c.parent_category)
    .slice(0, 6)
    .map((c) => ({ label: c.name, href: `/store?category=${c.handle}` }));

  return (
    <footer className="bg-gray-900 text-gray-300 w-full">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] py-16">
          <div className="flex flex-col gap-y-4">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-x-2 text-white hover:text-brand-400"
            >
              <LogoMark size="24" color="#FB8B3D" />
              <span className="txt-compact-xlarge-plus">{SITE_NAME}</span>
            </LocalizedClientLink>
            <Text className="txt-small text-gray-400">
              {SITE_LOCATION}&apos;s one-stop platform for construction
              materials, skilled labour, and engineering services.
            </Text>
            <ul className="flex flex-col gap-y-3 txt-small text-gray-400">
              <li className="flex items-center gap-x-3">
                <Envelope className="shrink-0" />
                <a href={`mailto:${SITE_EMAIL}`} className="hover:text-white">
                  {SITE_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-x-3">
                <Phone className="shrink-0" />
                <a
                  href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`}
                  className="hover:text-white"
                >
                  {SITE_PHONE}
                </a>
              </li>
              <li className="flex items-start gap-x-3">
                <MapPin className="shrink-0 mt-0.5" />
                <span>
                  {SITE_LEGAL_NAME && (
                    <>
                      {SITE_LEGAL_NAME}
                      <br />
                    </>
                  )}
                  {SITE_ADDRESS || SITE_LOCATION}
                </span>
              </li>
              {SITE_GSTIN && <li>GSTIN: {SITE_GSTIN}</li>}
            </ul>
          </div>

          {shopLinks.length > 0 && <LinkColumn title="Shop" links={shopLinks} />}
          <LinkColumn title="Services" links={serviceLinks} />
          <LinkColumn title="Support" links={supportLinks} />
          <LinkColumn title="Legal" links={legalLinks} />
        </div>
        <div className="flex flex-col gap-y-2 w-full py-6 border-t border-gray-800 text-gray-500">
          <div className="flex flex-col small:flex-row small:items-center small:justify-between gap-2">
            <Text className="txt-compact-small text-gray-500">
              © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </Text>
          </div>
          {/* Placeholder category photos, pending real product photography
              (see docs/PROGRESS.md) — three are CC-BY licensed and require
              this credit line; the rest are CC0/public domain. */}
          <Text className="txt-compact-small text-gray-600">
            Category photos:{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Stone_crushed_into_building_material.jpg"
              className="hover:text-gray-400"
              target="_blank"
              rel="noreferrer"
            >
              BogTar201213
            </a>
            ,{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Rebar_01.JPG"
              className="hover:text-gray-400"
              target="_blank"
              rel="noreferrer"
            >
              Vsolymossy
            </a>
            ,{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Stacks_of_red_bricks_and_concrete_blocks_at_a_construction_site_during_the_day_in_an_urban_environment.jpg"
              className="hover:text-gray-400"
              target="_blank"
              rel="noreferrer"
            >
              Shixart1985
            </a>{" "}
            (CC BY, via Wikimedia Commons).
          </Text>
          <Text className="txt-compact-small text-gray-600">
            Labour service photos:{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Bricklayer.jpg"
              className="hover:text-gray-400"
              target="_blank"
              rel="noreferrer"
            >
              hdptcar.net
            </a>
            ,{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Electrician_installing_socket.jpg"
              className="hover:text-gray-400"
              target="_blank"
              rel="noreferrer"
            >
              Santeri Viinamäki
            </a>
            ,{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Carrying_the_bricks.jpg"
              className="hover:text-gray-400"
              target="_blank"
              rel="noreferrer"
            >
              Ayman Nakib Badhan
            </a>
            ,{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Carpenter_in_his_workshop_2.jpg"
              className="hover:text-gray-400"
              target="_blank"
              rel="noreferrer"
            >
              A7med3ssam9
            </a>{" "}
            (CC BY, via Wikimedia Commons).
          </Text>
        </div>
      </div>
    </footer>
  );
}
