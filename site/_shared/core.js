document
  .getElementById("search-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const address = document.getElementById("address").value.trim();
    if (!address) return;

    console.log("Loading...");

    try {
      const response = await fetch(
        `/api/audit?address=${encodeURIComponent(address)}`,
      );
      const data = await response.json();
      console.log("API Response:", data); // This line could be added for logging
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });
