// Function to run address audit
async function runAddressAudit(address) {
  if (!address) return;

  // Dispatch start event
  const startEvent = new CustomEvent("auditStart", { detail: { address } });
  document.dispatchEvent(startEvent);

  try {
    const response = await fetch(
      `/api/audit?address=${encodeURIComponent(address)}`,
    );
    const data = await response.json();
    console.log("API Response:", data);

    // Dispatch results event
    const resultsEvent = new CustomEvent("auditResults", { detail: data });
    document.dispatchEvent(resultsEvent);
  } catch (error) {
    console.error("Error fetching data:", error);
    // Dispatch error event
    const errorEvent = new CustomEvent("auditError", { detail: error });
    document.dispatchEvent(errorEvent);
  }
}

// Handle form submission
document
  .getElementById("search-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const address = document.getElementById("wallet-address").value.trim();
    await runAddressAudit(address);
  });

// Check for address in URL and run audit if present
const urlParams = new URLSearchParams(window.location.search);
const addressFromUrl = urlParams.get("address");
if (addressFromUrl) {
  const addressInput = document.getElementById("wallet-address");
  if (addressInput) {
    addressInput.value = addressFromUrl;
    runAddressAudit(addressFromUrl);
  }
}
