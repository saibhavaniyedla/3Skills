const sessionId = getSessionId();
let favouriteIds = new Set();
let currentProperties = [];

const filters = {
  search: document.getElementById("searchFilter"),
  purpose: document.getElementById("purposeFilter"),
  type: document.getElementById("typeFilter"),
  locality: document.getElementById("localityFilter"),
  min_price: document.getElementById("minPriceFilter"),
  max_price: document.getElementById("maxPriceFilter"),
  min_bedrooms: document.getElementById("bedroomFilter"),
  furnishing: document.getElementById("furnishingFilter"),
  sort: document.getElementById("sortFilter"),
};

function getFilterValues() {
  return Object.fromEntries(Object.entries(filters).map(([key, element]) => [key, element?.value?.trim() || ""]));
}

function renderProperties(properties) {
  const grid = document.getElementById("propertyGrid");
  const empty = document.getElementById("emptyState");
  currentProperties = properties;
  grid.innerHTML = properties.map((property) => propertyCardTemplate(property, favouriteIds.has(property.id))).join("");
  grid.classList.toggle("hidden", properties.length === 0);
  empty.classList.toggle("hidden", properties.length !== 0);
  document.getElementById("resultCount").textContent = `${properties.length} ${properties.length === 1 ? "property" : "properties"} found`;
}

async function loadProperties() {
  const grid = document.getElementById("propertyGrid");
  grid.innerHTML = '<div class="details-loading">Loading properties...</div>';
  try {
    const properties = await API.properties(getFilterValues());
    renderProperties(properties);
  } catch (error) {
    grid.innerHTML = `<div class="empty-state"><h3>Unable to load properties</h3><p>${escapeHtml(error.message)}</p></div>`;
  }
}

async function toggleFavourite(propertyId, button) {
  try {
    if (favouriteIds.has(propertyId)) {
      await API.removeFavourite(propertyId, sessionId);
      favouriteIds.delete(propertyId);
      button.classList.remove("active");
      button.textContent = "♡";
      showToast("Removed from favourites");
    } else {
      await API.addFavourite(propertyId, sessionId);
      favouriteIds.add(propertyId);
      button.classList.add("active");
      button.textContent = "♥";
      showToast("Added to favourites");
    }
    document.getElementById("favCount").textContent = favouriteIds.size;
  } catch (error) {
    showToast(error.message, "error");
  }
}

function clearFilters() {
  Object.values(filters).forEach((element) => {
    if (element) element.value = "";
  });
  filters.sort.value = "newest";
  loadProperties();
}

async function initialise() {
  setupMenu();
  setupEnquiryModal();
  const favourites = await updateFavouriteCount();
  favouriteIds = new Set(favourites.map((item) => item.id));
  await loadProperties();

  document.getElementById("applyFilters").addEventListener("click", loadProperties);
  document.getElementById("clearFilters").addEventListener("click", clearFilters);
  document.getElementById("sortFilter").addEventListener("change", loadProperties);
  document.getElementById("filterMobileButton")?.addEventListener("click", () => document.querySelector(".filters-card")?.classList.toggle("mobile-open"));

  document.getElementById("heroSearchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    filters.search.value = document.getElementById("heroSearch").value;
    document.querySelector(".listings-section").scrollIntoView({ behavior: "smooth" });
    loadProperties();
  });

  [filters.search, filters.locality, filters.min_price, filters.max_price].forEach((element) => {
    element?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") loadProperties();
    });
  });

  document.getElementById("propertyGrid").addEventListener("click", (event) => {
    const favouriteButton = event.target.closest("[data-favourite]");
    if (favouriteButton) {
      toggleFavourite(Number(favouriteButton.dataset.favourite), favouriteButton);
      return;
    }
    const enquiryButton = event.target.closest("[data-enquire]");
    if (enquiryButton) openEnquiryModal(enquiryButton.dataset.enquire, enquiryButton.dataset.title);
  });
}

initialise();
