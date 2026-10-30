const ADMIN = {
  token: localStorage.getItem("nestora_admin_token") || "",
  properties: [],
  enquiries: [],

  request(path, options = {}) {
    return API.request(path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${this.token}`,
      },
    });
  },
};

const sectionTitles = {
  dashboardSection: "Dashboard",
  propertiesSection: "Properties",
  enquiriesSection: "Enquiries",
};

function showAdminApp() {
  document.getElementById("adminLoginPage").classList.add("hidden");
  document.getElementById("adminApp").classList.remove("hidden");
}

function showAdminLogin() {
  document.getElementById("adminApp").classList.add("hidden");
  document.getElementById("adminLoginPage").classList.remove("hidden");
}

function goToSection(sectionId) {
  document.querySelectorAll(".admin-section").forEach((section) => section.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
  document.querySelectorAll(".admin-nav button").forEach((button) => button.classList.toggle("active", button.dataset.section === sectionId));
  document.getElementById("adminPageTitle").textContent = sectionTitles[sectionId];
  document.getElementById("adminSidebar").classList.remove("open");
}

function statusClass(status) {
  return String(status).toLowerCase().replaceAll(" ", "-");
}

function renderStats(stats) {
  document.getElementById("statProperties").textContent = stats.properties;
  document.getElementById("statAvailable").textContent = stats.available;
  document.getElementById("statFavourites").textContent = stats.favourites;
  document.getElementById("statEnquiries").textContent = stats.new_enquiries;
}

function renderRecentProperties() {
  const root = document.getElementById("recentProperties");
  const items = ADMIN.properties.slice(0, 5);
  root.innerHTML = items.length
    ? items.map((property) => `
      <div class="mini-row">
        <img src="${escapeHtml(property.image_url)}" alt="" onerror="this.src='/static/images/property1.svg'" />
        <div><strong>${escapeHtml(property.title)}</strong><span>${escapeHtml(property.locality)} · ${escapeHtml(property.property_type)}</span></div>
        <strong>${formatPrice(property.price, property.purpose)}</strong>
      </div>`).join("")
    : '<p class="muted">No properties available.</p>';
}

function renderRecentEnquiries() {
  const root = document.getElementById("recentEnquiries");
  const items = ADMIN.enquiries.slice(0, 5);
  root.innerHTML = items.length
    ? items.map((enquiry) => `
      <div class="mini-row">
        <div class="admin-user"><span>${escapeHtml(enquiry.name.charAt(0).toUpperCase())}</span></div>
        <div><strong>${escapeHtml(enquiry.name)}</strong><span>${escapeHtml(enquiry.property_title)}</span></div>
        <span class="status-pill ${statusClass(enquiry.status)}">${escapeHtml(enquiry.status)}</span>
      </div>`).join("")
    : '<p class="muted">No enquiries yet.</p>';
}

function filteredProperties() {
  const search = document.getElementById("adminPropertySearch").value.trim().toLowerCase();
  const status = document.getElementById("adminStatusFilter").value;
  return ADMIN.properties.filter((property) => {
    const haystack = `${property.title} ${property.locality} ${property.city} ${property.property_type}`.toLowerCase();
    return (!search || haystack.includes(search)) && (!status || property.status === status);
  });
}

function renderPropertiesTable() {
  const body = document.getElementById("propertiesTableBody");
  const properties = filteredProperties();
  body.innerHTML = properties.length
    ? properties.map((property) => `
      <tr>
        <td><div class="property-cell"><img src="${escapeHtml(property.image_url)}" alt="" onerror="this.src='/static/images/property1.svg'" /><div><strong>${escapeHtml(property.title)}</strong><span>${escapeHtml(property.locality)}, ${escapeHtml(property.city)}</span></div></div></td>
        <td>${escapeHtml(property.property_type)}</td>
        <td>${escapeHtml(property.purpose)}</td>
        <td><strong>${formatPrice(property.price, property.purpose)}</strong></td>
        <td><span class="status-pill ${statusClass(property.status)}">${escapeHtml(property.status)}</span></td>
        <td><div class="table-actions"><button class="icon-button" data-edit-property="${property.id}" title="Edit">✎</button><button class="icon-button" data-delete-property="${property.id}" title="Delete">⌫</button></div></td>
      </tr>`).join("")
    : '<tr><td colspan="6" class="muted">No properties match your search.</td></tr>';
}

function filteredEnquiries() {
  const search = document.getElementById("enquirySearch").value.trim().toLowerCase();
  const status = document.getElementById("enquiryStatusFilter").value;
  return ADMIN.enquiries.filter((enquiry) => {
    const haystack = `${enquiry.name} ${enquiry.email} ${enquiry.phone} ${enquiry.property_title} ${enquiry.message}`.toLowerCase();
    return (!search || haystack.includes(search)) && (!status || enquiry.status === status);
  });
}

function renderEnquiriesTable() {
  const body = document.getElementById("enquiriesTableBody");
  const enquiries = filteredEnquiries();
  body.innerHTML = enquiries.length
    ? enquiries.map((enquiry) => `
      <tr>
        <td><strong>${escapeHtml(enquiry.name)}</strong><br><span class="muted">${new Date(enquiry.created_at).toLocaleDateString("en-IN")}</span></td>
        <td><strong>${escapeHtml(enquiry.property_title)}</strong><br><span class="muted">Owner: ${escapeHtml(enquiry.owner_name)}</span></td>
        <td><a href="mailto:${escapeHtml(enquiry.email)}">${escapeHtml(enquiry.email)}</a><br><a href="tel:${escapeHtml(enquiry.phone)}">${escapeHtml(enquiry.phone)}</a></td>
        <td class="message-cell">${escapeHtml(enquiry.message)}</td>
        <td><select class="status-select" data-enquiry-status="${enquiry.id}"><option ${enquiry.status === "New" ? "selected" : ""}>New</option><option ${enquiry.status === "Contacted" ? "selected" : ""}>Contacted</option><option ${enquiry.status === "Closed" ? "selected" : ""}>Closed</option></select></td>
      </tr>`).join("")
    : '<tr><td colspan="5" class="muted">No enquiries match your search.</td></tr>';
}

async function loadAdminData() {
  try {
    const [stats, properties, enquiries] = await Promise.all([
      ADMIN.request("/api/admin/stats"),
      ADMIN.request("/api/admin/properties"),
      ADMIN.request("/api/admin/enquiries"),
    ]);
    ADMIN.properties = properties;
    ADMIN.enquiries = enquiries;
    renderStats(stats);
    renderRecentProperties();
    renderRecentEnquiries();
    renderPropertiesTable();
    renderEnquiriesTable();
  } catch (error) {
    if (/login|required|expired|invalid/i.test(error.message)) {
      localStorage.removeItem("nestora_admin_token");
      ADMIN.token = "";
      showAdminLogin();
    }
    showToast(error.message, "error");
  }
}

function openPropertyModal(property = null) {
  const modal = document.getElementById("propertyModal");
  document.getElementById("propertyModalTitle").textContent = property ? "Edit Property" : "Add Property";
  document.getElementById("propertyId").value = property?.id || "";
  document.getElementById("propertyTitle").value = property?.title || "";
  document.getElementById("propertyDescription").value = property?.description || "";
  document.getElementById("propertyType").value = property?.property_type || "Apartment";
  document.getElementById("propertyPurpose").value = property?.purpose || "Sale";
  document.getElementById("propertyCity").value = property?.city || "Hyderabad";
  document.getElementById("propertyLocality").value = property?.locality || "";
  document.getElementById("propertyAddress").value = property?.address || "";
  document.getElementById("propertyPrice").value = property?.price || "";
  document.getElementById("propertyArea").value = property?.area_sqft || "";
  document.getElementById("propertyBedrooms").value = property?.bedrooms ?? 2;
  document.getElementById("propertyBathrooms").value = property?.bathrooms ?? 2;
  document.getElementById("propertyFurnishing").value = property?.furnishing || "Semi Furnished";
  document.getElementById("propertyParking").value = property?.parking ?? 1;
  document.getElementById("propertyStatus").value = property?.status || "Available";
  document.getElementById("ownerName").value = property?.owner_name || "";
  document.getElementById("ownerEmail").value = property?.owner_email || "";
  document.getElementById("ownerPhone").value = property?.owner_phone || "";
  document.getElementById("propertyImage").value = property?.image_url || "/static/images/property1.svg";
  document.getElementById("propertyFeatured").checked = Boolean(property?.featured);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closePropertyModal() {
  const modal = document.getElementById("propertyModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function propertyPayloadFromForm() {
  return {
    title: document.getElementById("propertyTitle").value.trim(),
    description: document.getElementById("propertyDescription").value.trim(),
    property_type: document.getElementById("propertyType").value,
    purpose: document.getElementById("propertyPurpose").value,
    city: document.getElementById("propertyCity").value.trim(),
    locality: document.getElementById("propertyLocality").value.trim(),
    address: document.getElementById("propertyAddress").value.trim(),
    price: Number(document.getElementById("propertyPrice").value),
    bedrooms: Number(document.getElementById("propertyBedrooms").value),
    bathrooms: Number(document.getElementById("propertyBathrooms").value),
    area_sqft: Number(document.getElementById("propertyArea").value),
    furnishing: document.getElementById("propertyFurnishing").value,
    parking: Number(document.getElementById("propertyParking").value),
    status: document.getElementById("propertyStatus").value,
    owner_name: document.getElementById("ownerName").value.trim(),
    owner_email: document.getElementById("ownerEmail").value.trim(),
    owner_phone: document.getElementById("ownerPhone").value.trim(),
    image_url: document.getElementById("propertyImage").value.trim(),
    featured: document.getElementById("propertyFeatured").checked,
  };
}

async function saveProperty(event) {
  event.preventDefault();
  const id = document.getElementById("propertyId").value;
  const button = event.submitter;
  button.disabled = true;
  button.textContent = "Saving...";
  try {
    const result = await ADMIN.request(id ? `/api/admin/properties/${id}` : "/api/admin/properties", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(propertyPayloadFromForm()),
    });
    showToast(result.message);
    closePropertyModal();
    await loadAdminData();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    button.disabled = false;
    button.textContent = "Save Property";
  }
}

async function deleteProperty(id) {
  const property = ADMIN.properties.find((item) => item.id === id);
  if (!property || !window.confirm(`Delete "${property.title}"? This also removes its enquiries and favourites.`)) return;
  try {
    const result = await ADMIN.request(`/api/admin/properties/${id}`, { method: "DELETE" });
    showToast(result.message);
    await loadAdminData();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function updateEnquiryStatus(id, status) {
  try {
    const result = await ADMIN.request(`/api/admin/enquiries/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    showToast(result.message);
    await loadAdminData();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function login(event) {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  button.textContent = "Signing in...";
  try {
    const result = await API.request("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("adminEmail").value.trim(),
        password: document.getElementById("adminPassword").value,
      }),
    });
    ADMIN.token = result.token;
    localStorage.setItem("nestora_admin_token", result.token);
    showAdminApp();
    await loadAdminData();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    button.disabled = false;
    button.textContent = "Login to Dashboard";
  }
}

async function logout() {
  try {
    if (ADMIN.token) await ADMIN.request("/api/admin/logout", { method: "POST" });
  } catch (_) {
    // Clear local session even if the server has restarted.
  }
  ADMIN.token = "";
  localStorage.removeItem("nestora_admin_token");
  showAdminLogin();
}

function setupEvents() {
  document.getElementById("adminLoginForm").addEventListener("submit", login);
  document.getElementById("logoutButton").addEventListener("click", logout);
  document.getElementById("adminMenuButton").addEventListener("click", () => document.getElementById("adminSidebar").classList.toggle("open"));

  document.querySelectorAll(".admin-nav button").forEach((button) => button.addEventListener("click", () => goToSection(button.dataset.section)));
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => goToSection(button.dataset.go)));
  [document.getElementById("addPropertyButton"), document.getElementById("dashboardAddProperty")].forEach((button) => button.addEventListener("click", () => openPropertyModal()));
  document.querySelectorAll("[data-close-property-modal]").forEach((item) => item.addEventListener("click", closePropertyModal));
  document.getElementById("propertyForm").addEventListener("submit", saveProperty);

  document.getElementById("adminPropertySearch").addEventListener("input", renderPropertiesTable);
  document.getElementById("adminStatusFilter").addEventListener("change", renderPropertiesTable);
  document.getElementById("enquirySearch").addEventListener("input", renderEnquiriesTable);
  document.getElementById("enquiryStatusFilter").addEventListener("change", renderEnquiriesTable);

  document.getElementById("propertiesTableBody").addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit-property]");
    if (edit) openPropertyModal(ADMIN.properties.find((item) => item.id === Number(edit.dataset.editProperty)));
    const remove = event.target.closest("[data-delete-property]");
    if (remove) deleteProperty(Number(remove.dataset.deleteProperty));
  });

  document.getElementById("enquiriesTableBody").addEventListener("change", (event) => {
    const select = event.target.closest("[data-enquiry-status]");
    if (select) updateEnquiryStatus(Number(select.dataset.enquiryStatus), select.value);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePropertyModal();
  });
}

setupEvents();
if (ADMIN.token) {
  showAdminApp();
  loadAdminData();
} else {
  showAdminLogin();
}
