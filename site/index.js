import { analyzeBrowser, analyzeLocation } from "./audit/browser.js";
import { analyzeAddress } from "./audit/address.js";
import { updateResults } from "./ui/index.js";

const DOM = {
  form: document.getElementById("search-form"),
  addressInput: document.getElementById("wallet-address"),
  backButton: document.getElementById("back-button"),
  landingContent: document.getElementById("landing-content"),
  loadingScreen: document.getElementById("loading-screen"),
  resultsSection: document.getElementById("results-section"),
};

// Bind events
DOM.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const address = DOM.addressInput.value.trim();
  const url = new URL(window.location);
  url.searchParams.set("address", address);
  window.history.pushState({}, "", url);
  beginAudit(address);
});

DOM.backButton.addEventListener("click", () => {
  const url = new URL(window.location);
  url.searchParams.delete("address");
  window.history.pushState({}, "", url);

  // Reset UI state
  DOM.landingContent.classList.remove("hidden");
  DOM.loadingScreen.classList.add("hidden");
  DOM.resultsSection.classList.add("hidden");
});

// Check initial ?address param
const urlParams = new URLSearchParams(window.location.search);
const addressFromUrl = urlParams.get("address");
if (addressFromUrl) {
  DOM.addressInput.value = addressFromUrl;
  beginAudit(addressFromUrl);
}

async function beginAudit(address) {
  const startEvent = new CustomEvent("auditStart", { detail: { address } });
  document.dispatchEvent(startEvent);

  // Hide landing content and show loading screen
  DOM.landingContent.classList.add("hidden");
  DOM.loadingScreen.classList.remove("hidden");

  // Load and render analysis modules
  const browserData = await analyzeBrowser();
  console.log(browserData);

  const locationData = await analyzeLocation();
  console.log(locationData);

  // TODO Maybe pause for login here

  const addressData = await analyzeAddress(address);
  console.log(addressData);

  // Hide loading screen and show results
  DOM.loadingScreen.classList.add("hidden");
  DOM.resultsSection.classList.remove("hidden");

  updateResults({
    ...addressData,
    browser: browserData,
    location: locationData,
  });
}
