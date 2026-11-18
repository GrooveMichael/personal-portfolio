// A small front-end-only storefront demo.
// Products are hardcoded below; the cart lives in localStorage so it
// survives a page reload, but nothing is actually sent anywhere —
// there's no backend and no real payment processing.

const PRODUCTS = [
  { id: "earbuds",  name: "Wireless Earbuds",  category: "Electronics", price: 249.99, color: "#3f6659", initials: "WE" },
  { id: "backpack", name: "Canvas Backpack",   category: "Bags",        price: 189.50, color: "#a9765a", initials: "CB" },
  { id: "bottle",   name: "Steel Water Bottle",category: "Accessories", price: 59.00,  color: "#4f7ea8", initials: "WB" },
  { id: "lamp",     name: "Desk Lamp",         category: "Home",        price: 129.00, color: "#b08b3f", initials: "DL" },
  { id: "notebook", name: "Notebook Set",      category: "Stationery",  price: 34.99,  color: "#7a5b9e", initials: "NS" },
  { id: "sneakers", name: "Running Sneakers",  category: "Footwear",    price: 329.00, color: "#b1504f", initials: "RS" },
];

const CART_KEY = "loop-cart";

const productsEl = document.getElementById("products");
const cartBtn = document.getElementById("cartBtn");
const cartCountEl = document.getElementById("cartCount");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const closeCartBtn = document.getElementById("closeCart");
const cartItemsEl = document.getElementById("cartItems");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const toastEl = document.getElementById("toast");

let cart = loadCart();
let toastTimer = null;

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("Couldn't read saved cart:", err);
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (err) {
    console.warn("Couldn't save cart:", err);
  }
}

function formatPrice(amount) {
  return "GH₵" + amount.toFixed(2);
}

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function cartItemCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = findProduct(id);
    return product ? sum + product.price * qty : sum;
  }, 0);
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2200);
}

function renderProducts() {
  productsEl.innerHTML = "";
  PRODUCTS.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-swatch" style="background:${product.color}">${product.initials}</div>
      <div class="product-body">
        <p class="product-name">${product.name}</p>
        <p class="product-category">${product.category}</p>
        <p class="product-price">${formatPrice(product.price)}</p>
        <button class="add-btn" type="button" data-id="${product.id}">Add to cart</button>
      </div>
    `;
    productsEl.appendChild(card);
  });
}

function renderCart() {
  const entries = Object.entries(cart).filter(([, qty]) => qty > 0);

  cartItemsEl.innerHTML = "";
  cartEmptyEl.hidden = entries.length > 0;

  entries.forEach(([id, qty]) => {
    const product = findProduct(id);
    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-swatch" style="background:${product.color}"></div>
      <div>
        <p class="cart-item-name">${product.name}</p>
        <p class="cart-item-price">${formatPrice(product.price)}</p>
        <div class="qty-controls">
          <button class="qty-btn" type="button" data-action="dec" data-id="${id}" aria-label="Decrease quantity">−</button>
          <span class="qty-value">${qty}</span>
          <button class="qty-btn" type="button" data-action="inc" data-id="${id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="remove-btn" type="button" data-action="remove" data-id="${id}">Remove</button>
    `;
    cartItemsEl.appendChild(row);
  });

  cartTotalEl.textContent = formatPrice(cartTotal());

  const count = cartItemCount();
  cartCountEl.textContent = String(count);
  cartCountEl.hidden = count === 0;
  checkoutBtn.disabled = count === 0;
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  const product = findProduct(id);
  if (product) showToast(`Added "${product.name}" to cart`);
}

function changeQty(id, delta) {
  const next = (cart[id] || 0) + delta;
  if (next <= 0) {
    delete cart[id];
  } else {
    cart[id] = next;
  }
  saveCart();
  renderCart();
}

function removeItem(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function openCart() {
  cartPanel.hidden = false;
  overlay.hidden = false;
}

function closeCart() {
  cartPanel.hidden = true;
  overlay.hidden = true;
}

function checkout() {
  if (cartItemCount() === 0) return;
  cart = {};
  saveCart();
  renderCart();
  closeCart();
  showToast("Order placed — thanks for shopping!");
}

// ---- wire up events ----

productsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  addToCart(btn.dataset.id);
});

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === "inc") changeQty(id, 1);
  if (action === "dec") changeQty(id, -1);
  if (action === "remove") removeItem(id);
});

cartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
checkoutBtn.addEventListener("click", checkout);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !cartPanel.hidden) closeCart();
});

renderProducts();
renderCart();
