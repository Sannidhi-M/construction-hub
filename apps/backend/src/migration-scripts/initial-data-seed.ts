import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";
import { DELIVERY_AREA_MODULE } from "../modules/delivery-area";
import DeliveryAreaModuleService from "../modules/delivery-area/service";

/**
 * Phase 0 + Phase 1 seed: store, region, stock location, shipping, product
 * catalog and the pincode allowlist. Real business data (product prices,
 * pincodes) supplied by the business — see docs/PROGRESS.md (Phase 1) for
 * the placeholders introduced where source data was incomplete (unnamed
 * brands, missing prices, unnamed block sizes) and why. This script is a
 * one-shot dev/initial-setup seed, not idempotent — re-running it against
 * a non-empty database will create duplicates.
 */
export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    Modules.FULFILLMENT
  );

  // A core Medusa loader auto-provisions a default store/sales channel/
  // publishable key on first boot, before this script runs — clean those up
  // so we don't end up with both "Medusa Store" and "Construction Hub".
  const storeModuleService = container.resolve(Modules.STORE);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const apiKeyModuleService = container.resolve(Modules.API_KEY);

  const defaultStores = await storeModuleService.listStores({ name: "Medusa Store" });
  if (defaultStores.length) {
    await storeModuleService.deleteStores(defaultStores.map((s) => s.id));
  }
  const defaultSalesChannels = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });
  if (defaultSalesChannels.length) {
    await salesChannelModuleService.deleteSalesChannels(
      defaultSalesChannels.map((sc) => sc.id)
    );
  }
  const defaultApiKeys = await apiKeyModuleService.listApiKeys({
    title: "Default Publishable API Key",
  });
  if (defaultApiKeys.length) {
    await apiKeyModuleService.revoke(
      { id: defaultApiKeys.map((k) => k.id) },
      { revoked_by: "seed-script" }
    );
    await apiKeyModuleService.deleteApiKeys(defaultApiKeys.map((k) => k.id));
  }

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Construction Hub",
          description: "Default sales channel",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Construction Hub",
          supported_currencies: [
            {
              currency_code: "inr",
              is_default: true,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Karnataka",
          currency_code: "inr",
          countries: ["in"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  // GST/tax deferred per architecture decision — tax-inclusive flat pricing for v1,
  // no Tax module region configured. See docs/ARCHITECTURE.md §6 Open Items.

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Construction Hub Yard",
          address: {
            city: "Davangere",
            country_code: "IN",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  // Created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Construction Hub delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Davangere",
        geo_zones: [
          {
            country_code: "in",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Business Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Business Delivery",
          description: "Delivered by Construction Hub's own vehicle.",
          code: "business-delivery",
        },
        prices: [
          {
            currency_code: "inr",
            amount: 0,
          },
          {
            region_id: region.id,
            amount: 0,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  // Medusa's auto-slugify keeps literal "/" and "&" from a name — both break
  // the storefront's routes (confirmed: "/" turns one path segment into two,
  // "&" 404s outright). Derive a clean handle for every category and product
  // instead of relying on the default, so this holds for any future catalog
  // entry too, not just the ones caught during this seed's own testing.
  const toHandle = (title: string) =>
    title
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  logger.info("Seeding product categories...");
  const categoryNames = [
    "Cement",
    "Steel & TMT Bars",
    "Sand",
    "Aggregates/Jelly",
    "Bricks & Blocks",
    "Tiles",
  ];
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: categoryNames.map((name) => ({
        name,
        handle: toHandle(name),
        is_active: true,
      })),
    },
  });
  const categoryIdByName = (name: string) =>
    categoryResult.find((c) => c.name === name)!.id;
  logger.info("Finished seeding product categories.");

  logger.info("Seeding product catalog...");

  // Simple single-option ("Pack Size") products with one variant each.
  // Prices in INR, from the business's own catalog. A blank `price` means
  // the source catalog had no rate yet (e.g. SK/JSW steel) — the variant is
  // created unpriced and can't be purchased until priced via Admin.
  const simpleProducts: {
    title: string;
    sku: string;
    category: string;
    packLabel: string;
    price?: number;
  }[] = [
    // Cement — sold by the standard 50kg bag.
    { title: "Ultratech Cement", sku: "CEMENT-ULTRATECH", category: "Cement", packLabel: "Bag (50kg)", price: 330 },
    { title: "JK Cement", sku: "CEMENT-JK", category: "Cement", packLabel: "Bag (50kg)", price: 320 },
    { title: "Maha Cement", sku: "CEMENT-MAHA", category: "Cement", packLabel: "Bag (50kg)", price: 310 },
    { title: "Shree Cement", sku: "CEMENT-SHREE", category: "Cement", packLabel: "Bag (50kg)", price: 300 },
    // Steel — sold per kg. "Steel (Standard)" is a placeholder name for a
    // catalog row with a rate (₹66) but no brand given.
    { title: "Shree Ram Steel", sku: "STEEL-SHREERAM", category: "Steel & TMT Bars", packLabel: "Per Kg", price: 64 },
    { title: "Kamadhenu Turbo Steel", sku: "STEEL-KAMADHENU-TURBO", category: "Steel & TMT Bars", packLabel: "Per Kg", price: 68 },
    { title: "Turbo Steel", sku: "STEEL-TURBO", category: "Steel & TMT Bars", packLabel: "Per Kg", price: 69 },
    { title: "Steel (Standard)", sku: "STEEL-STANDARD", category: "Steel & TMT Bars", packLabel: "Per Kg", price: 66 },
    { title: "SK Steel", sku: "STEEL-SK", category: "Steel & TMT Bars", packLabel: "Per Kg" },
    { title: "JSW Steel", sku: "STEEL-JSW", category: "Steel & TMT Bars", packLabel: "Per Kg" },
    // Bricks
    { title: "Clay / Mud Bricks", sku: "BRICK-CLAY", category: "Bricks & Blocks", packLabel: "Per Piece", price: 10 },
    { title: "Superior Quality Mud Bricks", sku: "BRICK-SUPERIOR", category: "Bricks & Blocks", packLabel: "Per Piece", price: 14 },
  ];

  const loadSizes = ["6-Wheeler Load", "8-Wheeler Load", "10-Wheeler Load"];

  const { result: createdProducts } = await createProductsWorkflow(container).run({
    input: {
      products: [
        ...simpleProducts.map((p) => ({
          title: p.title,
          handle: toHandle(p.title),
          category_ids: [categoryIdByName(p.category)],
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          sales_channels: [{ id: defaultSalesChannel.id }],
          options: [{ title: "Pack Size", values: [p.packLabel] }],
          variants: [
            {
              title: p.packLabel,
              sku: p.sku,
              manage_inventory: true,
              options: { "Pack Size": p.packLabel },
              prices: p.price !== undefined ? [{ amount: p.price, currency_code: "inr" }] : [],
            },
          ],
        })),
        // Concrete blocks — two sizes, no size names given by the business
        // yet, so "Size 1"/"Size 2" are placeholders (rename via Admin).
        {
          title: "Concrete Blocks",
          handle: toHandle("Concrete Blocks"),
          category_ids: [categoryIdByName("Bricks & Blocks")],
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          sales_channels: [{ id: defaultSalesChannel.id }],
          options: [{ title: "Size", values: ["Size 1", "Size 2"] }],
          variants: [
            {
              title: "Size 1",
              sku: "BLOCK-CONCRETE-SIZE1",
              manage_inventory: true,
              options: { Size: "Size 1" },
              prices: [{ amount: 48, currency_code: "inr" }],
            },
            {
              title: "Size 2",
              sku: "BLOCK-CONCRETE-SIZE2",
              manage_inventory: true,
              options: { Size: "Size 2" },
              prices: [{ amount: 52, currency_code: "inr" }],
            },
          ],
        },
        // Sand — two independent choices (Type, then Load Size), so every
        // Type/Load-Size combination is its own priced variant, e.g.
        // "M-Sand / 6-Wheeler Load". No rates given yet — unpriced.
        {
          title: "Sand",
          handle: toHandle("Sand"),
          category_ids: [categoryIdByName("Sand")],
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          sales_channels: [{ id: defaultSalesChannel.id }],
          options: [
            { title: "Type", values: ["M-Sand", "P-Sand", "Dust"] },
            { title: "Load Size", values: loadSizes },
          ],
          variants: ["M-Sand", "P-Sand", "Dust"].flatMap((type) =>
            loadSizes.map((loadSize) => ({
              title: `${type} / ${loadSize}`,
              sku: `SAND-${type.replace(/[^A-Z]/gi, "").toUpperCase()}-${loadSize.split("-")[0]}W`,
              manage_inventory: true,
              options: { Type: type, "Load Size": loadSize },
              prices: [],
            }))
          ),
        },
        // Aggregates/Jelly — one type, priced by load size. No rates given
        // yet — unpriced.
        {
          title: "Crushed Stone / Aggregate",
          handle: toHandle("Crushed Stone / Aggregate"),
          category_ids: [categoryIdByName("Aggregates/Jelly")],
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          sales_channels: [{ id: defaultSalesChannel.id }],
          options: [{ title: "Load Size", values: loadSizes }],
          variants: loadSizes.map((loadSize) => ({
            title: loadSize,
            sku: `AGGREGATE-${loadSize.split("-")[0]}W`,
            manage_inventory: true,
            options: { "Load Size": loadSize },
            prices: [],
          })),
        },
      ],
    },
  });
  logger.info("Finished seeding product catalog.");

  logger.info("Seeding inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 500,
        inventory_item_id: item.id,
      })),
    },
  });
  logger.info(`Finished seeding inventory levels for ${createdProducts.length} products.`);

  logger.info("Seeding delivery-area pincode allowlist...");
  // Davangere-district pincodes supplied by the business, deduplicated.
  // One out-of-district pincode (581119, Ranebennur/Haveri) from the
  // source list was dropped — see docs/PROGRESS.md (Phase 1).
  const davangerePincodes = [
    "577001", "577002", "577003", "577004", "577005", "577006",
    "577213", "577215", "577217", "577218", "577219", "577221",
    "577223", "577224", "577225", "577230", "577231", "577243",
    "577502", "577512", "577513", "577514", "577516", "577518",
    "577525", "577528", "577530", "577534", "577544", "577551",
    "577552", "577553", "577556", "577557", "577566", "577589",
    "577601", "583125", "583127", "583131", "583137", "583213",
  ];

  const deliveryAreaModuleService: DeliveryAreaModuleService = container.resolve(
    DELIVERY_AREA_MODULE
  );
  await deliveryAreaModuleService.createServiceablePincodes(
    davangerePincodes.map((pincode) => ({ pincode, is_active: true }))
  );
  logger.info(`Finished seeding ${davangerePincodes.length} serviceable pincodes.`);
}
