document
  .getElementById("search-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const address = document.getElementById("wallet-address").value.trim();
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
  });
