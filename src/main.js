import {
  renderCollections,
  renderNavigation,
  renderPrinciples,
  renderProjects,
  renderSocialLinks,
  renderStats,
  renderSteps,
  renderToolbox,
} from "./components/templates.js";
import { siteData } from "./data/site-data.js";

const app = document.querySelector("#app");

document.title = siteData.seo.title;

const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription) {
  metaDescription.setAttribute("content", siteData.seo.description);
}

const brandInitials =
  siteData.profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("") || "RB";

const cartProducts = siteData.projects.filter((product) => product.cartEnabled);
const hasCartProducts = cartProducts.length > 0;

app.innerHTML = `
  <header class="site-header container">
    <a class="brand" href="#top" aria-label="Go to homepage">
      <span class="brand-mark">
        ${
          siteData.profile.brandImage
            ? `<img src="${siteData.profile.brandImage}" alt="${siteData.profile.brandImageAlt ?? ""}" />`
            : brandInitials
        }
      </span>
      <span class="brand-copy">
        <strong>${siteData.profile.name}</strong>
        <span>${siteData.profile.role}</span>
      </span>
    </a>
    <nav class="nav" aria-label="Primary navigation">
      ${renderNavigation(siteData.navigation)}
    </nav>
  </header>

  <main id="top">
    <section class="hero container section-gap">
      <div class="hero-copy">
        <div class="hero-photo" aria-hidden="true"></div>
        <div class="hero-sprinkles" aria-hidden="true">
          <span class="hero-bloom hero-bloom-one"></span>
          <span class="hero-bloom hero-bloom-two"></span>
          <span class="hero-bloom hero-bloom-three"></span>
          <span class="hero-drop hero-drop-one"></span>
          <span class="hero-drop hero-drop-two"></span>
          <span class="hero-drop hero-drop-three"></span>
          <span class="hero-cream hero-cream-one"></span>
          <span class="hero-cream hero-cream-two"></span>
          <span class="hero-bubble hero-bubble-one"></span>
          <span class="hero-bubble hero-bubble-two"></span>
          <span class="hero-bubble hero-bubble-three"></span>
        </div>
        <p class="status-pill">${siteData.profile.availability}</p>
        <p class="eyebrow">${siteData.profile.location}</p>
        <h1>${siteData.profile.intro}</h1>
        <p class="lede">${siteData.profile.summary}</p>
        <div class="hero-actions">
          <a class="button button-primary" href="${siteData.profile.primaryLink.href}">
            ${siteData.profile.primaryLink.label}
          </a>
          <a class="button button-secondary" href="${siteData.profile.secondaryLink.href}">
            ${siteData.profile.secondaryLink.label}
          </a>
        </div>
        <div class="hero-note-row" aria-label="Store highlights">
          ${siteData.home.notes.map((note) => `<span class="hero-note">${note}</span>`).join("")}
        </div>
      </div>
      <aside class="hero-panel" aria-label="Featured Korean beauty set">
        <div class="spotlight-card">
          <div class="spotlight-header">
            <p class="eyebrow">${siteData.featured.eyebrow}</p>
            <span class="spotlight-price">${siteData.featured.price}</span>
          </div>
          <h2>${siteData.home.spotlightTitle}</h2>
          <p>${siteData.home.spotlightDescription}</p>
          <div class="showcase-grid">
            ${siteData.home.showcase
              .map(
                (item) => `
                  <article class="showcase-product">
                    <div class="showcase-product-image">
                      <img src="${item.image}" alt="${item.imageAlt}" loading="lazy" />
                    </div>
                    <div class="showcase-product-copy">
                      <strong>${item.name}</strong>
                      <span>${item.product}</span>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
          <ul class="spotlight-list">
            ${siteData.featured.items.map((item) => `<li>${item}</li>`).join("")}
          </ul>
          <p class="spotlight-note">${siteData.featured.note}</p>
        </div>
        <div class="stat-grid">
          ${renderStats(siteData.stats)}
        </div>
      </aside>
    </section>

    <section class="container section-gap" id="about">
      <div class="section-heading">
        <p class="eyebrow">${siteData.sections.about.eyebrow}</p>
        <h2>${siteData.sections.about.title}</h2>
        <p>${siteData.sections.about.description}</p>
      </div>
      <div class="journey-grid">
        ${renderSteps(siteData.shoppingSteps)}
      </div>
      <div class="principle-grid">
        ${renderPrinciples(siteData.principles)}
      </div>
    </section>

    <section class="container section-gap" id="brands">
      <div class="section-heading">
        <p class="eyebrow">${siteData.sections.brands.eyebrow}</p>
        <h2>${siteData.sections.brands.title}</h2>
        <p>${siteData.sections.brands.description}</p>
      </div>
      <div class="collection-grid">
        ${renderCollections(siteData.collections)}
      </div>
      <div class="brand-board">
        <div class="brand-grid">
          ${siteData.brands
            .map(
              (brand) => `
                <article class="brand-tile">
                  <div class="brand-tile-decor" aria-hidden="true">
                    <span class="brand-heart brand-heart-one"></span>
                    <span class="brand-heart brand-heart-two"></span>
                    <span class="brand-heart brand-heart-three"></span>
                    <span class="brand-flower brand-flower-one"></span>
                    <span class="brand-flower brand-flower-two"></span>
                    <span class="brand-flower brand-flower-three"></span>
                  </div>
                  <div class="brand-tile-copy">
                    <span class="brand-tile-kicker">Featured pick</span>
                    <strong class="brand-tile-name">${brand.name}</strong>
                    <p class="brand-pick">${brand.pick}</p>
                    <p>${brand.note}</p>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="container section-gap" id="shop">
      <div class="section-heading">
        <p class="eyebrow">${siteData.sections.shop.eyebrow}</p>
        <h2>${siteData.sections.shop.title}</h2>
        ${siteData.sections.shop.description ? `<p>${siteData.sections.shop.description}</p>` : ""}
      </div>
      <div class="shop-toolbar">
        <div class="shop-toolbar-copy">
          <p class="eyebrow">Skin Type Filter</p>
          <p>Use the filter buttons to narrow the guide quickly by the skin type you want to shop for.</p>
        </div>
        <div class="skin-filter-bar" role="toolbar" aria-label="Filter products by skin type">
          ${siteData.shopFilters
            .map(
              (filter) => `
                <button
                  class="skin-filter-button${filter.value === "all" ? " is-active" : ""}"
                  type="button"
                  data-skin-filter="${filter.value}"
                  aria-pressed="${filter.value === "all"}"
                >
                  ${filter.label}
                </button>
              `
            )
            .join("")}
        </div>
        <p id="product-filter-status" class="product-filter-status">Showing all ${siteData.projects.length} products.</p>
      </div>
      <div class="shop-focus-card">
        <div class="shop-focus-copy">
          <p class="eyebrow">${siteData.shopFocus.eyebrow}</p>
          <h3>${siteData.shopFocus.title}</h3>
          <p>${siteData.shopFocus.description}</p>
          <div class="tag-row">
            ${siteData.shopFocus.highlights.map((item) => `<span class="tag tag-soft">${item}</span>`).join("")}
          </div>
        </div>
        <div class="shop-focus-visual">
          <img src="${siteData.shopFocus.image}" alt="${siteData.shopFocus.imageAlt}" loading="lazy" />
          <p class="shop-focus-note">${siteData.shopFocus.note}</p>
        </div>
      </div>
      <div class="product-grid">
        ${renderProjects(siteData.projects)}
      </div>
    </section>

    ${
      hasCartProducts
        ? `
          <section class="container section-gap" id="cart">
            <div class="cart-card">
              <div class="cart-shell">
                <div class="cart-copy">
                  <p class="eyebrow">${siteData.sections.cart.eyebrow}</p>
                  <h2>${siteData.sections.cart.title}</h2>
                  <p>${siteData.sections.cart.description}</p>
                </div>
                <div class="cart-panel">
                  <div class="cart-summary-row">
                    <span>Items in cart</span>
                    <strong id="cart-count">0</strong>
                  </div>
                  <div id="cart-items" class="cart-items"></div>
                  <p id="cart-empty" class="cart-empty">${siteData.cart.empty}</p>
                  <div class="cart-total-row">
                    <span>Total</span>
                    <strong id="cart-total">RM0</strong>
                  </div>
                  <p class="cart-note">${siteData.cart.note}</p>
                  <div class="cart-actions">
                    <button id="clear-cart" class="button button-secondary" type="button">
                      ${siteData.cart.clearLabel}
                    </button>
                    <a id="checkout-link" class="button button-primary is-disabled" href="#shop" aria-disabled="true">
                      ${siteData.cart.disabledCheckoutLabel}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        `
        : ""
    }

    <section class="container section-gap" id="routine">
      <div class="section-heading">
        <p class="eyebrow">${siteData.sections.routine.eyebrow}</p>
        <h2>${siteData.sections.routine.title}</h2>
      </div>
      <div class="toolbox-grid">
        ${renderToolbox(siteData.toolbox)}
      </div>
    </section>

    <section class="container section-gap" id="contact">
      <div class="contact-card">
        <div class="contact-copy">
          <p class="eyebrow">Contact</p>
          <h2>${siteData.contact.title}</h2>
          <p>${siteData.contact.description}</p>
        </div>
        <div class="contact-actions">
          <a class="button button-primary" href="mailto:${siteData.profile.email}">
            ${siteData.profile.email}
          </a>
          <div class="contact-status">
            <strong>${siteData.contact.statusTitle}</strong>
            <span>${siteData.contact.statusNote}</span>
          </div>
          <div class="social-list">
            ${renderSocialLinks(siteData.socialLinks)}
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer container">
    <p>
      <span>${siteData.profile.name}</span>
      <span>•</span>
      <span>${siteData.profile.role}</span>
      <span>•</span>
      <span id="current-year"></span>
    </p>
    <a href="#top">Back to top</a>
  </footer>
`;

const currentYear = document.querySelector("#current-year");
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const productCards = Array.from(document.querySelectorAll(".product-card[data-skin-types]"));
const skinFilterButtons = Array.from(document.querySelectorAll("[data-skin-filter]"));
const productFilterStatus = document.querySelector("#product-filter-status");

function applySkinFilter(filterValue) {
  let visibleCount = 0;

  productCards.forEach((card) => {
    const supportedTypes = card.dataset.skinTypes?.split(" ").filter(Boolean) ?? [];
    const shouldShow =
      filterValue === "all" || supportedTypes.includes("all") || supportedTypes.includes(filterValue);
    card.hidden = !shouldShow;

    if (shouldShow) {
      visibleCount += 1;
    }
  });

  skinFilterButtons.forEach((button) => {
    const isActive = button.dataset.skinFilter === filterValue;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (productFilterStatus) {
    const activeButton = skinFilterButtons.find((button) => button.dataset.skinFilter === filterValue);
    const activeLabel = activeButton?.textContent?.trim() ?? "All";

    productFilterStatus.textContent =
      filterValue === "all"
        ? `Showing all ${visibleCount} products.`
        : `Showing ${visibleCount} products for ${activeLabel.toLowerCase()} skin.`;
  }
}

if (productCards.length && skinFilterButtons.length) {
  skinFilterButtons.forEach((button) => {
    button.addEventListener("click", () => applySkinFilter(button.dataset.skinFilter));
  });

  applySkinFilter("all");
}

const CART_KEY = "rolang-beauty-cart";
const productMap = new Map(cartProducts.map((product) => [product.id, product]));

function formatPrice(value) {
  return `RM${value}`;
}

function readCart() {
  try {
    const stored = window.localStorage.getItem(CART_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        id: item?.id,
        quantity: Number(item?.quantity),
      }))
      .filter((item) => productMap.has(item.id) && Number.isInteger(item.quantity) && item.quantity > 0);
  } catch {
    return [];
  }
}

function saveCart(cart) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // Ignore storage failures and keep the in-memory cart usable.
  }
}

let cart = readCart();

function getItemCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getTotalPrice() {
  return cart.reduce((total, item) => {
    const product = productMap.get(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function buildCheckoutHref() {
  if (!cart.length) {
    return "#shop";
  }

  const lines = [
    "Hello ROLANG BEAUTY,",
    "",
    "I want to place this online order:",
    ...cart.map((item) => {
      const product = productMap.get(item.id);
      const lineTotal = product ? product.price * item.quantity : 0;
      return `- ${product?.title ?? item.id} x${item.quantity} = ${formatPrice(lineTotal)}`;
    }),
    "",
    `Total: ${formatPrice(getTotalPrice())}`,
    "",
    "My name:",
    "Phone number:",
    "Delivery address:",
    "",
    "Thank you.",
  ];

  return `mailto:${siteData.profile.email}?subject=${encodeURIComponent("ROLANG BEAUTY Online Order")}&body=${encodeURIComponent(lines.join("\n"))}`;
}

function updateCartStatus() {
  const countNode = document.querySelector("#cart-count");
  const totalNode = document.querySelector("#cart-total");
  const emptyNode = document.querySelector("#cart-empty");
  const checkoutLink = document.querySelector("#checkout-link");
  const clearButton = document.querySelector("#clear-cart");

  if (countNode) {
    countNode.textContent = String(getItemCount());
  }

  if (totalNode) {
    totalNode.textContent = formatPrice(getTotalPrice());
  }

  if (emptyNode) {
    emptyNode.hidden = cart.length > 0;
  }

  if (checkoutLink) {
    const hasItems = cart.length > 0;
    checkoutLink.href = buildCheckoutHref();
    checkoutLink.textContent = hasItems ? siteData.cart.checkoutLabel : siteData.cart.disabledCheckoutLabel;
    checkoutLink.classList.toggle("is-disabled", !hasItems);
    checkoutLink.setAttribute("aria-disabled", String(!hasItems));
  }

  if (clearButton) {
    clearButton.disabled = cart.length === 0;
  }
}

function renderCart() {
  const itemsNode = document.querySelector("#cart-items");

  if (!itemsNode) {
    return;
  }

  itemsNode.innerHTML = cart
    .map((item) => {
      const product = productMap.get(item.id);

      if (!product) {
        return "";
      }

      return `
        <article class="cart-item">
          <div class="cart-item-copy">
            <strong>${product.title}</strong>
            <span class="cart-item-meta">${product.category} • ${formatPrice(product.price)} each</span>
            <span class="cart-line-total">${formatPrice(product.price * item.quantity)}</span>
          </div>
          <div class="cart-item-controls">
            <button class="qty-button" type="button" data-cart-action="decrease" data-product-id="${item.id}">-</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-button" type="button" data-cart-action="increase" data-product-id="${item.id}">+</button>
            <button class="cart-remove" type="button" data-cart-action="remove" data-product-id="${item.id}">
              ${siteData.cart.removeLabel}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  updateCartStatus();
}

function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart = [...cart, { id: productId, quantity: 1 }];
  }

  saveCart(cart);
  renderCart();
}

function updateQuantity(productId, change) {
  cart = cart
    .map((item) => (item.id === productId ? { ...item, quantity: item.quantity + change } : item))
    .filter((item) => item.quantity > 0);

  saveCart(cart);
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
}

document.querySelectorAll(".add-to-cart-button").forEach((button) => {
  button.addEventListener("click", () => addToCart(button.dataset.productId));
});

const cartItemsNode = document.querySelector("#cart-items");
if (cartItemsNode) {
  cartItemsNode.addEventListener("click", (event) => {
    const target = event.target.closest("[data-cart-action]");

    if (!target) {
      return;
    }

    const productId = target.dataset.productId;
    const action = target.dataset.cartAction;

    if (action === "remove") {
      removeFromCart(productId);
      return;
    }

    const change = action === "increase" ? 1 : -1;
    updateQuantity(productId, change);
  });
}

const clearCartButton = document.querySelector("#clear-cart");
if (clearCartButton) {
  clearCartButton.addEventListener("click", () => {
    cart = [];
    saveCart(cart);
    renderCart();
  });
}

renderCart();
