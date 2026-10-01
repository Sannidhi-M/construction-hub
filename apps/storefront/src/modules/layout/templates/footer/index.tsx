import { listCategories } from "@lib/data/categories";
import { Text } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import LogoMark from "@modules/common/icons/logo-mark";
import { SITE_NAME, SITE_LOCATION, SITE_PHONE } from "@lib/constants";

const serviceLinks = [
  { label: "Labour & Manpower", href: "/labour" },
  { label: "Engineering Services", href: "/engineering" },
  { label: "Contact Us", href: "/contact" },
];

export default async function Footer() {
  const productCategories = await listCategories();

  return (
    <footer className="bg-gray-900 text-gray-300 w-full">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 py-16">
          <div className="flex flex-col gap-y-3">
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
          </div>

          {productCategories && productCategories.length > 0 && (
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-white">Materials</span>
              <ul
                className="grid grid-cols-1 gap-2"
                data-testid="footer-categories"
              >
                {productCategories
                  .filter((c) => !c.parent_category)
                  .slice(0, 6)
                  .map((c) => (
                    <li key={c.id} className="txt-small text-gray-400">
                      <LocalizedClientLink
                        className="hover:text-white"
                        href={`/categories/${c.handle}`}
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-y-2">
            <span className="txt-small-plus text-white">Services</span>
            <ul className="grid grid-cols-1 gap-y-2 txt-small text-gray-400">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink className="hover:text-white" href={link.href}>
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-y-2">
            <span className="txt-small-plus text-white">Contact</span>
            <ul className="grid grid-cols-1 gap-y-2 txt-small text-gray-400">
              <li>{SITE_LOCATION}</li>
              <li>
                <a
                  href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`}
                  className="hover:text-white"
                >
                  {SITE_PHONE}
                </a>
              </li>
            </ul>
          </div>
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
