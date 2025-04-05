fetch("/api/audit")
  .then((res) => res.json())
  .then((json) => console.log("GET /api/audit:", json))
  .catch(() => console.log("GET /api/audit: (api not available)"));
/* eslint-enable no-console */
