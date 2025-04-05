import { analyzeBrowser, analyzeLocation } from "./audit/browser.js";
import { analyzeAddress } from "./audit/address.js";
import { updateResults } from "./ui/index.js";

const form = document.getElementById("search-form");
const addressInput = document.getElementById("wallet-address");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const address = addressInput.value.trim();
  const url = new URL(window.location);
  url.searchParams.set("address", address);
  window.history.pushState({}, "", url);
  beginAudit(address);
});

// Check for address in URL and run audit if present
const urlParams = new URLSearchParams(window.location.search);
const addressFromUrl = urlParams.get("address");
if (addressFromUrl) {
  addressInput.value = addressFromUrl;
  beginAudit(addressFromUrl);
}

async function beginAudit(address) {
  const startEvent = new CustomEvent("auditStart", { detail: { address } });
  document.dispatchEvent(startEvent);

  // Hide landing content and show loading screen
  document.getElementById("landing-content").classList.add("hidden");
  document.getElementById("loading-screen").classList.remove("hidden");
  // Clear resolved address
  document.getElementById("wallet-address-resolved").textContent = "";

  // Load and render analysis modules
  const browserData = await analyzeBrowser();
  console.log(browserData);

  const locationData = await analyzeLocation();
  console.log(locationData);

  const addressData = await analyzeAddress(address);
  console.log(addressData);

  // Hide loading screen and show results
  document.getElementById("loading-screen").classList.add("hidden");
  document.getElementById("results-section").classList.remove("hidden");

  updateResults(addressData);
}
