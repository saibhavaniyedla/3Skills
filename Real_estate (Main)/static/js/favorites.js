const sessionId = getSessionId();
let favourites = [];

function render() {
  const grid = document.getElementById("propertyGrid");
  const empty = document.getElementById("emptyState");
  grid.innerHTML = favourites.map((property) => propertyCardTemplate(property, true)).join("");
  grid.classList.toggle("hidden", favourites.length === 0);
  empty.classList.toggle("hidden", favourites.length !== 0);
  document.getElementById("favCount").textContent = favourites.length;
  document.getElementById("resultCount").textContent = `${favourites.length} saved ${favourites.length === 1 ? "property" : "properties"}`;
}

async function loadFavourites() {
  try {
    favourites = await API.favourites(sessionId);
    render();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function removeFavourite(id) {
  try {
    await API.removeFavourite(id, sessionId);
    favourites = favourites.filter((item) => item.id !== id);
    render();
    showToast("Removed from favourites");
  } catch (error) {
    showToast(error.message, "error");
  }
}

setupMenu();
setupEnquiryModal();
loadFavourites();

document.getElementById("propertyGrid").addEventListener("click", (event) => {
  const favButton = event.target.closest("[data-favourite]");
  if (favButton) {
    removeFavourite(Number(favButton.dataset.favourite));
    return;
  }
  const enquiryButton = event.target.closest("[data-enquire]");
  if (enquiryButton) openEnquiryModal(enquiryButton.dataset.enquire, enquiryButton.dataset.title);
});
