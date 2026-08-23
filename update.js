const shopNameEl = document.getElementById("shopName");
const shopSubtitleEl = document.getElementById("shopSubtitle");
const loaderEl = document.getElementById("loader");
const productsWrap = document.getElementById("productsWrap");
const productsList = document.getElementById("productsList");
const saveBtn = document.getElementById("saveBtn");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");
const logoutBtn = document.getElementById("logoutBtn");

const modalOverlay = document.getElementById("modalOverlay");
const verifyCode = document.getElementById("verifyCode");
const modalError = document.getElementById("modalError");
const modalConfirm = document.getElementById("modalConfirm");
const modalConfirmShare = document.getElementById("modalConfirmShare");
const modalCancel = document.getElementById("modalCancel");

let merchantId = null;
let productsCache = []; // [{id, name, priceBuy, priceSell}]

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userDoc = await db.collection("merchantUsers").doc(user.uid).get();
  if (!userDoc.exists || !userDoc.data().merchantId) {
    await auth.signOut();
    window.location.href = "index.html";
    return;
  }

  merchantId = userDoc.data().merchantId;
  await loadMerchantAndProducts();
});

logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});

async function loadMerchantAndProducts() {
  try {
    const merchantDoc = await db.collection("merchants").doc(merchantId).get();
    if (!merchantDoc.exists) {
      shopNameEl.textContent = "Merchant not found";
      return;
    }
    const data = merchantDoc.data();
    shopNameEl.textContent = data.shopName || "Your Shop";
    shopSubtitleEl.textContent = data.city ? `${data.city} — Update your product prices` : "Update your product prices";

    const productsSnap = await db.collection("merchants").doc(merchantId).collection("products").get();
    productsCache = productsSnap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "Unnamed Product",
      priceBuy: doc.data().priceBuy ?? 0,
      priceSell: doc.data().priceSell ?? 0,
    }));

    renderProducts();
    loaderEl.style.display = "none";
    productsWrap.style.display = "block";
  } catch (err) {
    loaderEl.textContent = "Products load nahi ho saka. Page reload karein.";
    console.error(err);
  }
}

function renderProducts() {
  productsList.innerHTML = "";
  productsCache.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-card-name">${escapeHtml(p.name)}</div>
      <div class="price-field">
        <label>Buy Price</label>
        <input type="text" value="${p.priceBuy}" data-id="${p.id}" data-field="priceBuy" placeholder="e.g. PKR 123000" />
      </div>
      <div class="price-field">
        <label>Sell Price</label>
        <input type="text" value="${p.priceSell}" data-id="${p.id}" data-field="priceSell" placeholder="e.g. PKR 125000" />
      </div>
    `;
    productsList.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function parsePriceInput(value) {
  if (value == null) return null;
  return String(value).trim();
}

saveBtn.addEventListener("click", () => {
  errorMsg.textContent = "";
  successMsg.textContent = "";
  modalError.textContent = "";
  verifyCode.value = "";
  modalOverlay.classList.add("open");
});

modalCancel.addEventListener("click", () => {
  modalOverlay.classList.remove("open");
});

modalConfirm.addEventListener("click", () => submitUpdate(false, modalConfirm, "Confirm"));
modalConfirmShare.addEventListener("click", () => submitUpdate(true, modalConfirmShare, "Update & Share"));

async function submitUpdate(shouldShare, triggerBtn, originalLabel) {
  const code = verifyCode.value.trim();
  if (!code) {
    modalError.textContent = "Verification code daalein.";
    return;
  }

  const inputs = productsList.querySelectorAll("input");
  const updates = {};
  inputs.forEach((input) => {
    const id = input.dataset.id;
    const field = input.dataset.field;
    if (!updates[id]) updates[id] = { id };
    updates[id][field] = parsePriceInput(input.value);
  });

  modalConfirm.disabled = true;
  modalConfirmShare.disabled = true;
  triggerBtn.textContent = "Saving...";

  try {
    const user = auth.currentUser;
    if (!user) {
      window.location.href = "index.html";
      return;
    }
    const idToken = await user.getIdToken();
    const productsPayload = Object.values(updates);

    const res = await fetch(`${BACKEND_URL}/merchant/update-prices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        priceUpdateKey: code,
        products: productsPayload,
      }),
    });

    const result = await res.json();

    if (!res.ok || result.status !== "success") {
      modalError.textContent = result.message || "Update fail ho gaya.";
      modalConfirm.disabled = false;
      modalConfirmShare.disabled = false;
      triggerBtn.textContent = originalLabel;
      return;
    }

    modalOverlay.classList.remove("open");
    successMsg.textContent = "Prices update ho gaye!";
    modalConfirm.disabled = false;
    modalConfirmShare.disabled = false;
    triggerBtn.textContent = originalLabel;

    productsCache = productsCache.map((p) => {
      const u = updates[p.id];
      return u ? { ...p, priceBuy: u.priceBuy, priceSell: u.priceSell } : p;
    });

    if (shouldShare) {
      pendingShareText = buildShareText(); // text taiyar karo
      successMsg.innerHTML = 'Prices update ho gaye! <button id="shareNowBtn" style="margin-left:8px;">Share Now</button>';
      document.getElementById("shareNowBtn").addEventListener("click", () => {
        shareUpdatedPrices(pendingShareText);
      }, { once: true });
    }
  } catch (err) {
    modalError.textContent = "Network error, dobara koshish karein.";
    modalConfirm.disabled = false;
    modalConfirmShare.disabled = false;
    triggerBtn.textContent = originalLabel;
    console.error(err);
  }
}
let pendingShareText = "";

function buildShareText() {
  const shopName = shopNameEl.textContent;
  let text = `${shopName} - Updated Rates\n\n`;
  productsCache.forEach((p) => {
    text += `${p.name}\nBuy: ${p.priceBuy}   Sell: ${p.priceSell}\n\n`;
  });
  return text;
}

function shareUpdatedPrices(text) {
  const shopName = shopNameEl.textContent;
  if (navigator.share) {
    navigator.share({ title: `${shopName} - Rate Update`, text }).catch((err) => console.log("Share cancelled or failed:", err));
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert("Share is browser mein support nahi hai — rates clipboard mein copy kar diye gaye hain.");
    });
  }
}