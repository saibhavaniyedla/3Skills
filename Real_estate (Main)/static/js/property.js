const sessionId = getSessionId();
const propertyId = new URLSearchParams(window.location.search).get("id");
let property = null;
let isFavourite = false;

function renderProperty() {
  const root = document.getElementById("propertyDetails");
  document.title = `${property.title} | Nestora`;
  document.getElementById("breadcrumbTitle").textContent = property.title;
  root.className = "details-layout";
  root.innerHTML = `
    <div class="details-gallery">
      <img src="${escapeHtml(property.image_url)}" alt="${escapeHtml(property.title)}" onerror="this.src='/static/images/property1.svg'" />
    </div>
    <aside class="details-card">
      <span class="eyebrow dark">${escapeHtml(property.property_type)} · For ${escapeHtml(property.purpose)}</span>
      <h1>${escapeHtml(property.title)}</h1>
      <p class="property-location">⌖ ${escapeHtml(property.address)}</p>
      <div class="details-price">${formatPrice(property.price, property.purpose)}</div>
      <div class="detail-feature-grid">
        ${property.bedrooms > 0 ? `<div class="detail-feature"><span>Bedrooms</span><strong>${property.bedrooms}</strong></div>` : ""}
        ${property.bathrooms > 0 ? `<div class="detail-feature"><span>Bathrooms</span><strong>${property.bathrooms}</strong></div>` : ""}
        <div class="detail-feature"><span>Area</span><strong>${Number(property.area_sqft).toLocaleString("en-IN")} sq.ft.</strong></div>
        <div class="detail-feature"><span>Furnishing</span><strong>${escapeHtml(property.furnishing)}</strong></div>
        <div class="detail-feature"><span>Parking</span><strong>${property.parking} space(s)</strong></div>
        <div class="detail-feature"><span>Status</span><strong>${escapeHtml(property.status)}</strong></div>
      </div>
      <div class="property-actions">
        <button class="btn outline-button" id="detailsFavourite">${isFavourite ? "♥ Saved" : "♡ Save"}</button>
        <button class="btn btn-primary" id="detailsEnquire">Contact Owner</button>
      </div>
      <div class="owner-card">
        <span class="eyebrow dark">Listed by</span>
        <strong>${escapeHtml(property.owner_name)}</strong>
        <p class="muted">Owner contact details are shared after you send an enquiry.</p>
      </div>
    </aside>
    <article class="details-card description-card">
      <span class="eyebrow dark">About this property</span>
      <h2>Property description</h2>
      <p>${escapeHtml(property.description)}</p>
      <h3>Location</h3>
      <p>${escapeHtml(property.address)}</p>
    </article>`;

  document.getElementById("detailsEnquire").addEventListener("click", () => openEnquiryModal(property.id, property.title));
  document.getElementById("detailsFavourite").addEventListener("click", toggleFavourite);
}

async function toggleFavourite() {
  try {
    if (isFavourite) await API.removeFavourite(property.id, sessionId);
    else await API.addFavourite(property.id, sessionId);
    isFavourite = !isFavourite;
    const button = document.getElementById("detailsFavourite");
    button.textContent = isFavourite ? "♥ Saved" : "♡ Save";
    const favourites = await updateFavouriteCount();
    showToast(isFavourite ? "Added to favourites" : "Removed from favourites");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function initialise() {
  setupMenu();
  setupEnquiryModal();
  if (!propertyId) {
    document.getElementById("propertyDetails").innerHTML = "Property ID is missing.";
    return;
  }
  try {
    const [propertyData, favourites] = await Promise.all([API.property(propertyId), updateFavouriteCount()]);
    property = propertyData;
    isFavourite = favourites.some((item) => item.id === property.id);
    renderProperty();
  } catch (error) {
    document.getElementById("propertyDetails").innerHTML = `<div class="empty-state"><h3>Property not found</h3><p>${escapeHtml(error.message)}</p><a class="btn btn-primary" href="/">Back to Properties</a></div>`;
  }
}

initialise();
