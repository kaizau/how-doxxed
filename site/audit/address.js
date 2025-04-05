export async function analyzeAddress(address) {
  if (!address) return;

  try {
    const response = await fetch("/api/audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    });
    const data = await response.json();
    const resultsEvent = new CustomEvent("auditResults", { detail: data });
    document.dispatchEvent(resultsEvent);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    const errorEvent = new CustomEvent("auditError", { detail: error });
    document.dispatchEvent(errorEvent);
  }
}
