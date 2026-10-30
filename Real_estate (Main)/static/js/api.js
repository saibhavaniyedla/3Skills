const API = {
  async request(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || data.message || "Something went wrong");
    }
    return data;
  },

  properties(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) query.set(key, value);
    });
    return this.request(`/api/properties?${query.toString()}`);
  },

  property(id) {
    return this.request(`/api/properties/${id}`);
  },

  favourites(sessionId) {
    return this.request(`/api/favourites?session_id=${encodeURIComponent(sessionId)}`);
  },

  addFavourite(propertyId, sessionId) {
    return this.request(`/api/favourites/${propertyId}?session_id=${encodeURIComponent(sessionId)}`, { method: "POST" });
  },

  removeFavourite(propertyId, sessionId) {
    return this.request(`/api/favourites/${propertyId}?session_id=${encodeURIComponent(sessionId)}`, { method: "DELETE" });
  },

  enquiry(payload) {
    return this.request("/api/enquiries", { method: "POST", body: JSON.stringify(payload) });
  },
};

function getSessionId() {
  let sessionId = localStorage.getItem("nestora_session_id");
  if (!sessionId) {
    sessionId = window.crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem("nestora_session_id", sessionId);
  }
  return sessionId;
}

function formatPrice(value, purpose = "Sale") {
  const amount = Number(value || 0);
  let formatted;
  if (amount >= 10000000) formatted = `₹${(amount / 10000000).toFixed(amount % 10000000 ? 2 : 0)} Cr`;
  else if (amount >= 100000) formatted = `₹${(amount / 100000).toFixed(amount % 100000 ? 2 : 0)} Lakh`;
  else formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  return purpose === "Rent" ? `${formatted}<small>/month</small>` : formatted;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : ""}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3400);
}

function propertyCardTemplate(property, isFavourite = false) {
  const beds = property.bedrooms > 0 ? `<span>🛏 ${property.bedrooms} Beds</span>` : "";
  const baths = property.bathrooms > 0 ? `<span>🚿 ${property.bathrooms} Baths</span>` : "";
  return `
    <article class="property-card" data-property-id="${property.id}">
      <div class="property-image-wrap">
        <img class="property-image" src="${escapeHtml(property.image_url)}" alt="${escapeHtml(property.title)}" onerror="this.src='/static/images/property1.svg'" />
        <div class="property-badges">
          <span class="badge">For ${escapeHtml(property.purpose)}</span>
          ${property.featured ? '<span class="badge featured">Featured</span>' : ""}
        </div>
        <button class="fav-button ${isFavourite ? "active" : ""}" data-favourite="${property.id}" aria-label="Toggle favourite">${isFavourite ? "♥" : "♡"}</button>
      </div>
      <div class="property-body">
        <p class="property-location">⌖ ${escapeHtml(property.locality)}, ${escapeHtml(property.city)}</p>
        <h3 class="property-title">${escapeHtml(property.title)}</h3>
        <div class="property-price">${formatPrice(property.price, property.purpose)}</div>
        <div class="property-features">
          ${beds}${baths}
          <span>▱ ${Number(property.area_sqft).toLocaleString("en-IN")} sq.ft.</span>
          <span>⌂ ${escapeHtml(property.property_type)}</span>
        </div>
        <div class="property-actions">
          <a class="btn outline-button" href="/property?id=${property.id}">View Details</a>
          <button class="btn btn-primary" data-enquire="${property.id}" data-title="${escapeHtml(property.title)}">Contact Owner</button>
        </div>
      </div>
    </article>`;
}

function setupMenu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  toggle?.addEventListener("click", () => nav?.classList.toggle("open"));
}

function openEnquiryModal(propertyId, title) {
  const modal = document.getElementById("enquiryModal");
  if (!modal) return;
  document.getElementById("enquiryPropertyId").value = propertyId;
  document.getElementById("enquiryPropertyTitle").textContent = title || "Property enquiry";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeEnquiryModal() {
  const modal = document.getElementById("enquiryModal");
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden", "true");
}

function setupEnquiryModal() {
  document.querySelectorAll("[data-close-modal]").forEach((el) => el.addEventListener("click", closeEnquiryModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeEnquiryModal();
  });

  document.getElementById("enquiryForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter;
    button.disabled = true;
    button.textContent = "Sending...";
    try {
      const payload = {
        property_id: Number(document.getElementById("enquiryPropertyId").value),
        name: document.getElementById("enquiryName").value.trim(),
        email: document.getElementById("enquiryEmail").value.trim(),
        phone: document.getElementById("enquiryPhone").value.trim(),
        message: document.getElementById("enquiryMessage").value.trim(),
      };
      const result = await API.enquiry(payload);
      showToast(result.message);
      event.target.reset();
      closeEnquiryModal();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      button.disabled = false;
      button.textContent = "Send Enquiry";
    }
  });
}

async function updateFavouriteCount() {
  try {
    const favourites = await API.favourites(getSessionId());
    const count = document.getElementById("favCount");
    if (count) count.textContent = favourites.length;
    return favourites;
  } catch {
    return [];
  }
}
