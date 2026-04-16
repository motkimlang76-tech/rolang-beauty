import { readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { siteData } from '../src/data/site-data.js';

const STORE_DOMAIN = process.env.SHOPIFY_STORE ?? 'rolangbeauty.myshopify.com';
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? '2026-01';
const RAW_BASE = 'https://raw.githubusercontent.com/motkimlang76-tech/rolang-beauty/main/';
const STORE_CONFIG_PATH =
  process.env.SHOPIFY_STORE_CONFIG_PATH ??
  path.join(os.homedir(), 'Library/Preferences/shopify-cli-store-nodejs/config.json');
const OUTPUT_PATH = new URL('../shopify-import/rolang-draft-catalog-report.json', import.meta.url);
const INVENTORY_SETTINGS = Object.freeze({
  tracked: false,
  inventoryPolicy: 'CONTINUE',
  requiresShipping: true,
});
const LAUNCH_TITLES = new Set([
  'SKIN1004 Madagascar Centella Ampoule',
  'SKIN1004 Centella Light Cleansing Oil',
  'SKIN1004 Hyalu-Cica Water-Fit Sun Serum',
  'COSRX Advanced Snail 96 Mucin Essence',
  'COSRX Low pH Good Morning Gel Cleanser',
  'COSRX Acne Pimple Master Patch',
  'Isntree Hyaluronic Acid Watery Sun Gel',
  'ANUA Heartleaf 77% Soothing Toner',
  'ANUA Peach 70% Niacinamide Serum',
  'Medicube Collagen Niacinamide Jelly Cream',
  'Medicube Zero Pore Pad 2.0',
]);

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildDescription(product) {
  const detailItems = (product.details ?? [])
    .map((detail) => `<li><strong>${escapeHtml(detail.label)}:</strong> ${escapeHtml(detail.value)}</li>`)
    .join('');

  return [
    `<p>${escapeHtml(product.description)}</p>`,
    detailItems ? `<ul>${detailItems}</ul>` : '',
  ].join('');
}

function buildSeoDescription(product) {
  const detailSummary = (product.details ?? [])
    .map((detail) => `${detail.label}: ${detail.value}`)
    .join(' ');

  return `${product.description} ${detailSummary}`.trim().slice(0, 320);
}

function buildTags(product) {
  const skinTypeTags = (product.skinTypes ?? []).map((item) => `${item[0].toUpperCase()}${item.slice(1)} Skin`);

  return Array.from(
    new Set([
      'Catalog Draft',
      'Pending Pricing',
      product.brand,
      product.category,
      ...(product.stack ?? []).slice(0, 2),
      ...skinTypeTags,
    ].filter(Boolean)),
  );
}

function buildSku(product) {
  return `RB-${slugify(product.title).toUpperCase().replace(/-/g, '-')}`;
}

function buildInventoryMode(overrides = {}) {
  const inventoryMode = { ...INVENTORY_SETTINGS, ...overrides };

  return {
    ...inventoryMode,
    sellWhenOutOfStock: inventoryMode.inventoryPolicy === 'CONTINUE',
  };
}

function loadStoreToken(storeDomain) {
  const config = JSON.parse(readFileSync(STORE_CONFIG_PATH, 'utf8'));
  const candidates = [];

  for (const entry of Object.values(config)) {
    const sessionsByUserId = entry?.myshopify?.com?.sessionsByUserId;
    if (!sessionsByUserId) continue;

    for (const session of Object.values(sessionsByUserId)) {
      if (!(session.scopes ?? []).includes('write_products')) continue;

      if (session?.store === storeDomain) {
        return session.accessToken;
      }

      candidates.push(session);
    }
  }

  if (candidates.length === 1) {
    return candidates[0].accessToken;
  }

  const candidateStores = candidates.map((session) => session.store).filter(Boolean);

  throw new Error(
    `No Shopify CLI store token with write_products scope found for ${storeDomain}. Available token stores: ${candidateStores.join(', ') || 'none'}.`,
  );
}

async function adminFetch(query, variables = {}) {
  const response = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': loadStoreToken(STORE_DOMAIN),
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Shopify Admin API request failed (${response.status}): ${JSON.stringify(data)}`);
  }

  if (data.errors?.length) {
    throw new Error(`Shopify Admin API GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

function assertNoUserErrors(action, userErrors) {
  if (!userErrors?.length) return;
  throw new Error(`${action} failed: ${JSON.stringify(userErrors)}`);
}

async function findProductByHandle(handle) {
  const data = await adminFetch(
    `
      query FindProduct($query: String!) {
        products(first: 1, query: $query) {
          nodes {
            id
            title
            handle
            status
            featuredImage {
              url
            }
            variants(first: 1) {
              nodes {
                id
                price
              }
            }
          }
        }
      }
    `,
    { query: `handle:${handle}` },
  );

  return data.products.nodes[0] ?? null;
}

async function upsertDraftProduct(product) {
  const handle = slugify(product.title);
  const existing = await findProductByHandle(handle);
  const media = [
    {
      originalSource: `${RAW_BASE}${product.image}`,
      alt: product.imageAlt ?? product.title,
      mediaContentType: 'IMAGE',
    },
  ];
  const sharedInput = {
    title: product.title,
    handle,
    descriptionHtml: buildDescription(product),
    vendor: product.brand,
    productType: product.category,
    tags: buildTags(product),
    status: existing?.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
    seo: {
      title: product.title,
      description: buildSeoDescription(product),
    },
  };

  let savedProduct;

  if (existing) {
    const data = await adminFetch(
      `
        mutation UpdateProduct($product: ProductUpdateInput!, $media: [CreateMediaInput!]) {
          productUpdate(product: $product, media: $media) {
            product {
              id
              handle
              status
              featuredImage {
                url
              }
              variants(first: 1) {
                nodes {
                  id
                  price
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        product: {
          id: existing.id,
          ...sharedInput,
        },
        media: existing.featuredImage ? [] : media,
      },
    );

    assertNoUserErrors('productUpdate', data.productUpdate.userErrors);
    savedProduct = data.productUpdate.product;
  } else {
    const data = await adminFetch(
      `
        mutation CreateProduct($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
          productCreate(product: $product, media: $media) {
            product {
              id
              handle
              status
              featuredImage {
                url
              }
              variants(first: 1) {
                nodes {
                  id
                  price
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        product: sharedInput,
        media,
      },
    );

    assertNoUserErrors('productCreate', data.productCreate.userErrors);
    savedProduct = data.productCreate.product;
  }

  const variantId = savedProduct?.variants?.nodes?.[0]?.id;

  if (!variantId) {
    throw new Error(`No default variant returned for ${product.title}.`);
  }

  const preservedPrice = Number(savedProduct?.variants?.nodes?.[0]?.price ?? existing?.variants?.nodes?.[0]?.price ?? 0);
  const inventoryMode = buildInventoryMode({
    sku: buildSku(product),
  });
  const variantData = await adminFetch(
    `
      mutation UpdateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(
          productId: $productId
          variants: $variants
          allowPartialUpdates: false
        ) {
          productVariants {
            id
            price
            inventoryItem {
              tracked
              requiresShipping
              sku
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      productId: savedProduct.id,
      variants: [
        {
          id: variantId,
          price: preservedPrice > 0 ? preservedPrice.toFixed(2) : '0.00',
          inventoryPolicy: inventoryMode.inventoryPolicy,
          taxable: true,
          inventoryItem: {
            sku: inventoryMode.sku,
            tracked: inventoryMode.tracked,
            requiresShipping: inventoryMode.requiresShipping,
          },
        },
      ],
    },
  );

  assertNoUserErrors('productVariantsBulkUpdate', variantData.productVariantsBulkUpdate.userErrors);

  return {
    id: savedProduct.id,
    title: product.title,
    handle,
    status: sharedInput.status,
    price: preservedPrice,
    sku: inventoryMode.sku,
    existed: Boolean(existing),
  };
}

async function main() {
  const draftCatalogProducts = siteData.projects.filter((product) => !LAUNCH_TITLES.has(product.title));
  const savedProducts = [];
  let createdCount = 0;
  let updatedCount = 0;
  let activePreservedCount = 0;

  for (const product of draftCatalogProducts) {
    const saved = await upsertDraftProduct(product);
    savedProducts.push(saved);

    if (saved.existed) {
      updatedCount += 1;
    } else {
      createdCount += 1;
    }

    if (saved.status === 'ACTIVE') {
      activePreservedCount += 1;
    }
  }

  const report = {
    store: STORE_DOMAIN,
    generatedAt: new Date().toISOString(),
    totalCatalogProducts: siteData.projects.length,
    launchProductsSkipped: LAUNCH_TITLES.size,
    draftCatalogProducts: savedProducts.length,
    createdCount,
    updatedCount,
    activePreservedCount,
    inventoryMode: buildInventoryMode(),
    products: savedProducts,
  };

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`Synced ${savedProducts.length} draft catalog products to ${STORE_DOMAIN}`);
  console.log(`Created ${createdCount} draft products and updated ${updatedCount} existing products`);
  console.log(`Preserved ${activePreservedCount} active products outside the launch set`);
  console.log(
    `Inventory mode: tracked=${INVENTORY_SETTINGS.tracked}, inventoryPolicy=${INVENTORY_SETTINGS.inventoryPolicy}, requiresShipping=${INVENTORY_SETTINGS.requiresShipping}`,
  );
  console.log(`Wrote report to ${OUTPUT_PATH.pathname}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
