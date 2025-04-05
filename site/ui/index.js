import { Chart } from "chart.js/auto";
import { TimeScale, TimeSeriesScale } from "chart.js";
import "chartjs-adapter-date-fns";
import L from "leaflet";

Chart.register(TimeScale, TimeSeriesScale);

let portfolioChart = null;
let map = null;
let marker = null;

export function updateResults(data) {
  // Show resolved address if available
  document.getElementById("wallet-address-resolved").textContent =
    data.address || "";

  // Update portfolio value and chart
  if (data.value && Array.isArray(data.value)) {
    const timestamps = [];
    const values = [];

    // Process historical data
    data.value.forEach((point) => {
      timestamps.push(new Date(point.timestamp * 1000));
      values.push(point.value_usd);
    });

    // Get latest value directly from data array
    const latestPoint = data.value[data.value.length - 1];
    const previousPoint = data.value[data.value.length - 2];

    if (latestPoint && previousPoint) {
      const percentChange =
        ((latestPoint.value_usd - previousPoint.value_usd) /
          previousPoint.value_usd) *
        100;

      // Format the value with commas and 2 decimal places
      const formattedValue = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(latestPoint.value_usd);

      // Update the portfolio value display
      document.getElementById("portfolio-value").textContent = formattedValue;

      // Update the percent change
      const percentElement = document.querySelector(".text-red-500.font-mono");
      percentElement.textContent = `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(2)}%`;
      percentElement.className = `font-mono ${percentChange >= 0 ? "text-green-500" : "text-red-500"}`;

      // Update the chart
      const ctx = document.getElementById("portfolio-chart");

      if (portfolioChart) {
        portfolioChart.destroy();
      }

      portfolioChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: timestamps,
          datasets: [
            {
              data: values,
              borderColor: percentChange >= 0 ? "#22C55E" : "#EF4444",
              borderWidth: 1.5,
              fill: false,
              tension: 0.4,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(context.parsed.y);
                },
              },
            },
          },
          scales: {
            x: {
              type: "time",
              display: false,
            },
            y: {
              display: false,
            },
          },
          interaction: {
            intersect: false,
            mode: "index",
          },
        },
      });
    }
  } else {
    // Handle missing value data
    document.querySelector(".text-4xl.font-mono").textContent = "$0.00";
    document.querySelector(".text-red-500.font-mono").textContent = "+0.00%";
  }

  // Update ENS names
  const ensContainer = document.getElementById("ens-names");
  const ensHtml = [];

  // Add ENS names from API
  if (data.ensNames && data.ensNames.length > 0) {
    ensHtml.push(
      ...data.ensNames.map(
        (name) =>
          `<div class="flex items-center gap-2">
            <a href="https://app.ens.domains/name/${name}" target="_blank" rel="noopener noreferrer" class="text-black hover:opacity-70 transition-opacity">${name}</a>
          </div>`,
      ),
    );
  }

  // Add ENS NFTs
  if (data.nfts) {
    const ensNFTs = data.nfts.filter((nft) => nft.collectionName === "ENS");
    if (ensNFTs.length > 0) {
      ensHtml.push(
        ...ensNFTs.map(
          (nft) =>
            `<div class="flex items-center gap-2">
              <a href="https://app.ens.domains/name/${nft.name}" target="_blank" rel="noopener noreferrer" class="text-black hover:opacity-70 transition-opacity">${nft.name}</a>
            </div>`,
        ),
      );
    }
  }

  // Update the container
  if (ensHtml.length > 0) {
    ensContainer.innerHTML = ensHtml.join("");
  } else {
    ensContainer.innerHTML = '<p class="text-gray-500">No ENS names found</p>';
  }

  // Update wallet relationships and bubble chart
  const relationshipsContainer = document.getElementById(
    "wallet-relationships",
  );
  const bubbleChartContainer = document.getElementById("bubble-chart");

  if (data.relationships && data.relationships.total) {
    const topRelationships = Object.entries(data.relationships.total)
      .slice(0, 10)
      .map(([address, count], index) => {
        const inTxns = data.relationships.byDirection.in[address] || 0;
        const outTxns = data.relationships.byDirection.out[address] || 0;
        const abbreviatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        return { address, abbreviatedAddress, txns: inTxns + outTxns, index };
      });

    // Update relationships list
    relationshipsContainer.innerHTML = topRelationships
      .map(
        ({
          address,
          abbreviatedAddress,
          txns,
          index,
        }) => `<div class="flex items-center">
          <span class="text-gray-500 w-8 text-sm">${index + 1}.</span>
          <span class="font-mono text-sm">${abbreviatedAddress}</span>
          <button
            onclick="copyAddress(event, '${address.replace(/'/g, "\\'")}')"
            class="text-gray-500 hover:text-black transition-colors group relative cursor-pointer ml-2"
            title="Copy full address"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
            </svg>
            <span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Copy address
            </span>
          </button>
          <a
            href="https://etherscan.io/address/${address}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-500 hover:text-black transition-colors ml-2"
          >
            <svg class="h-4 w-4" fill="none" height="2500" viewBox="-2.19622685 .37688013 124.38617733 125.52740941" width="2500" xmlns="http://www.w3.org/2000/svg">
              <path d="m25.79 58.415a5.157 5.157 0 0 1 5.181-5.156l8.59.028a5.164 5.164 0 0 1 5.164 5.164v32.48c.967-.287 2.209-.593 3.568-.913a4.3 4.3 0 0 0 3.317-4.187v-40.291a5.165 5.165 0 0 1 5.164-5.165h8.607a5.165 5.165 0 0 1 5.164 5.165v37.393s2.155-.872 4.254-1.758a4.311 4.311 0 0 0 2.632-3.967v-44.578a5.164 5.164 0 0 1 5.163-5.164h8.606a5.164 5.164 0 0 1 5.164 5.164v36.71c7.462-5.408 15.024-11.912 21.025-19.733a8.662 8.662 0 0 0 1.319-8.092 60.792 60.792 0 0 0 -58.141-40.829 60.788 60.788 0 0 0 -51.99 91.064 7.688 7.688 0 0 0 7.334 3.8c1.628-.143 3.655-.346 6.065-.63a4.3 4.3 0 0 0 3.815-4.268z" fill="#21325b"/>
              <path d="m25.602 110.51a60.813 60.813 0 0 0 63.371 5.013 60.815 60.815 0 0 0 33.212-54.203c0-1.4-.065-2.785-.158-4.162-22.219 33.138-63.244 48.63-96.423 53.347" fill="#979695"/>
            </svg>
          </a>
          <a
            href="#"
            onclick="analyzeAddress('${address.replace(/'/g, "\\'")}'); return false;"
            class="text-gray-500 hover:text-black transition-colors ml-2"
          >
            <svg class="h-4 w-4" viewBox="0 0 95 95" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.4997 93.4167C72.8587 93.4167 93.4163 72.8591 93.4163 47.5C93.4163 22.1409 72.8587 1.58334 47.4997 1.58334C22.1406 1.58334 1.58301 22.1409 1.58301 47.5C1.58301 72.8591 22.1406 93.4167 47.4997 93.4167Z" fill="black"/>
              <path d="M64.9167 31.6667H30.0833C26.5855 31.6667 23.75 34.5022 23.75 38V57C23.75 60.4978 26.5855 63.3333 30.0833 63.3333H64.9167C68.4145 63.3333 71.25 60.4978 71.25 57V38C71.25 34.5022 68.4145 31.6667 64.9167 31.6667Z" fill="white"/>
              <path d="M47.4997 55.4166C54.4953 55.4166 60.1663 51.8722 60.1663 47.5C60.1663 43.1277 54.4953 39.5833 47.4997 39.5833C40.5041 39.5833 34.833 43.1277 34.833 47.5C34.833 51.8722 40.5041 55.4166 47.4997 55.4166Z" fill="black"/>
              <path d="M47.4997 50.6667C49.2486 50.6667 50.6663 49.2489 50.6663 47.5C50.6663 45.7511 49.2486 44.3333 47.4997 44.3333C45.7508 44.3333 44.333 45.7511 44.333 47.5C44.333 49.2489 45.7508 50.6667 47.4997 50.6667Z" fill="white"/>
            </svg>
          </a>
          <span class="text-gray-500 ml-2 text-sm">(${txns} TXNs)</span>
        </div>`,
      )
      .join("");

    // Update bubble chart
    const maxTxns = Math.max(...topRelationships.map((r) => r.txns));
    const minSize = 32; // Minimum bubble size
    const maxSize = 80; // Maximum bubble size

    // Sort relationships by transaction count (descending)
    const sortedRelationships = [...topRelationships].sort(
      (a, b) => b.txns - a.txns,
    );

    // Calculate sizes and create initial layout
    const bubbleObjects = sortedRelationships.map((rel, i) => {
      const size = Math.max(minSize, (rel.txns / maxTxns) * maxSize);
      return { data: rel, size };
    });

    // Position bubbles in a more spread out layout
    function positionBubbles() {
      const positions = [];
      const containerWidth = 90; // Use 90% of the width
      const containerHeight = 90; // Use 90% of the height
      const startX = 5; // Start at 5%
      const startY = 5; // Start at 5%

      // Define base positions for key bubbles in a more vertically spread pattern
      const basePositions = [
        { x: 0.25, y: 0.15 }, // Top left
        { x: 0.65, y: 0.2 }, // Top right
        { x: 0.15, y: 0.35 }, // Mid-left
        { x: 0.45, y: 0.4 }, // Center
        { x: 0.75, y: 0.35 }, // Mid-right
        { x: 0.2, y: 0.6 }, // Bottom left
        { x: 0.5, y: 0.65 }, // Bottom center
        { x: 0.8, y: 0.7 }, // Bottom right
        { x: 0.35, y: 0.8 }, // Far bottom left
        { x: 0.65, y: 0.85 }, // Far bottom right
      ];

      bubbleObjects.forEach((bubble, i) => {
        const base = basePositions[i];
        let x = startX + base.x * containerWidth;
        let y = startY + base.y * containerHeight;

        // Add slight random variation
        x += (Math.random() - 0.5) * 3;
        y += (Math.random() - 0.5) * 3;

        // Keep within bounds
        x = Math.max(
          startX + bubble.size / 200,
          Math.min(startX + containerWidth - bubble.size / 200, x),
        );
        y = Math.max(
          startY + bubble.size / 200,
          Math.min(startY + containerHeight - bubble.size / 200, y),
        );

        positions.push({ x, y, size: bubble.size });
        bubble.x = x;
        bubble.y = y;
      });

      // Check for overlaps and adjust with stronger repulsion
      for (let iteration = 0; iteration < 15; iteration++) {
        bubbleObjects.forEach((bubble1, i) => {
          bubbleObjects.forEach((bubble2, j) => {
            if (i < j) {
              const dx = bubble1.x - bubble2.x;
              const dy = bubble1.y - bubble2.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const minDistance = (bubble1.size + bubble2.size) / 120; // Increased minimum distance

              if (distance < minDistance) {
                const angle = Math.atan2(dy, dx);
                const pushDistance = (minDistance - distance) * 0.7; // Stronger push

                bubble1.x += Math.cos(angle) * pushDistance;
                bubble1.y += Math.sin(angle) * pushDistance;
                bubble2.x -= Math.cos(angle) * pushDistance;
                bubble2.y -= Math.sin(angle) * pushDistance;

                // Keep within bounds after adjustment
                bubble1.x = Math.max(
                  startX + bubble1.size / 200,
                  Math.min(
                    startX + containerWidth - bubble1.size / 200,
                    bubble1.x,
                  ),
                );
                bubble1.y = Math.max(
                  startY + bubble1.size / 200,
                  Math.min(
                    startY + containerHeight - bubble1.size / 200,
                    bubble1.y,
                  ),
                );
                bubble2.x = Math.max(
                  startX + bubble2.size / 200,
                  Math.min(
                    startX + containerWidth - bubble2.size / 200,
                    bubble2.x,
                  ),
                );
                bubble2.y = Math.max(
                  startY + bubble2.size / 200,
                  Math.min(
                    startY + containerHeight - bubble2.size / 200,
                    bubble2.y,
                  ),
                );
              }
            }
          });
        });
      }
    }

    // Position the bubbles
    positionBubbles();

    // Generate the HTML for the bubbles
    const bubbles = bubbleObjects.map((bubble, i) => {
      const normalizedIndex = i / bubbleObjects.length;
      return `
          <div
            class="absolute transform -translate-x-1/2 -translate-y-1/2 border border-black rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:border-[3px] hover:shadow-lg group"
            style="
              width: ${bubble.size}px;
              height: ${bubble.size}px;
              top: ${bubble.y}%;
              left: ${bubble.x}%;
              opacity: ${0.95 - normalizedIndex * 0.3};

            "
            onclick="analyzeAddress('${bubble.data.address.replace(/'/g, "\\'")}')"
          >
            <span class="font-mono text-[8px] text-center">
              ${bubble.data.address.slice(0, 6)}
            </span>
            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-mono z-50">
              <span class="text-white">Analyze</span> <span class="text-white">${bubble.data.abbreviatedAddress}</span>
            </div>
          </div>
        `;
    });

    bubbleChartContainer.innerHTML = bubbles.join("");
  }

  // Update timezone data
  const timezoneContainer = document.getElementById("timezone-data");
  if (data.timezone) {
    // Group transactions into 4-hour blocks
    const blocks = Array.from({ length: 6 }, (_, i) => {
      const startHour = i * 4;
      const endHour = startHour + 3;
      const hours = Array.from({ length: 4 }, (_, h) => startHour + h);
      const transactions = hours.reduce((sum, hour) => {
        return sum + (data.timezone[hour] ? data.timezone[hour].length : 0);
      }, 0);
      return {
        startHour,
        endHour,
        transactions,
      };
    });

    const maxTransactions = Math.max(...blocks.map((b) => b.transactions));

    timezoneContainer.innerHTML = blocks
      .map((block) => {
        const width =
          block.transactions === 0
            ? 0
            : (block.transactions / maxTransactions) * 50;

        return `<div class="flex items-center">
          <div class="shrink-0">
            <span class="font-mono text-sm">${block.startHour.toString().padStart(2, "0")}:00-</span>
          </div>
          <div class="w-[4.5rem] shrink-0">
            <span class="font-mono text-sm">${(block.endHour + 1).toString().padStart(2, "0")}:00</span>
          </div>
          <div class="flex-1 flex items-center gap-3">
            ${
              block.transactions > 0
                ? `<div class="h-1.5 bg-black transition-all duration-300" style="width: ${width}%"></div>`
                : ""
            }
            <span class="font-mono text-sm text-gray-500">${block.transactions} txns</span>
          </div>
        </div>`;
      })
      .join("");
  }

  // Update browser fingerprint data
  const browserContainer = document.getElementById("browser-fingerprint");
  const mapContainer = document.getElementById("location-map");

  if (data.browser && data.location) {
    const fingerprintData = data.browser;
    const locationData = data.location;

    // Initialize or update map if location data is available
    if (locationData.latitude && locationData.longitude) {
      // Wait for the map container to be visible
      const initMap = () => {
        if (!map && mapContainer && mapContainer.offsetParent !== null) {
          map = L.map("location-map").setView(
            [locationData.latitude, locationData.longitude],
            13,
          );
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          // Add marker
          marker = L.marker([
            locationData.latitude,
            locationData.longitude,
          ]).addTo(map);
        } else if (map && marker) {
          // Update existing map
          map.setView([locationData.latitude, locationData.longitude], 13);
          marker.setLatLng([locationData.latitude, locationData.longitude]);
        }
      };

      // Try to initialize map immediately
      initMap();

      // If map container is not visible yet, wait for it
      if (mapContainer && mapContainer.offsetParent === null) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            initMap();
            observer.disconnect();
          }
        });
        observer.observe(mapContainer);
      }
    }

    const privacyRelevantInfo = [
      {
        title: "Location",
        value: `${locationData.city}, ${locationData.region}, ${locationData.country_name}`,
      },
      {
        title: "Coordinates",
        value: `${locationData.latitude}, ${locationData.longitude}`,
      },
      {
        title: "IP Address",
        value: locationData.ip,
      },

      {
        title: "Timezone",
        value: `${locationData.timezone} (UTC${locationData.utc_offset})`,
      },
      {
        title: "Permissions",
        value: Object.entries(fingerprintData.permissions)
          .filter(([_, status]) => status === "granted")
          .map(([permission]) => permission),
        isList: true,
      },
    ];

    browserContainer.innerHTML = privacyRelevantInfo
      .map(
        (info) => `
        <div class="flex gap-4 items-baseline">
          <div class="shrink-0">
            <span class="font-mono text-xs text-gray-500">${info.title}</span>
          </div>
          <div class="flex-1">
            ${
              info.isList
                ? `<div class="flex flex-col gap-2">
                    ${info.value
                      .map(
                        (permission) => `
                      <span class="font-mono text-xs break-all">${permission}</span>
                    `,
                      )
                      .join("")}
                  </div>`
                : `<span class="font-mono text-xs break-all">${info.value}</span>`
            }
          </div>
        </div>
      `,
      )
      .join("");
  }
}

// Add copy function to handle clipboard operations
export function copyAddress(event, address) {
  // Get the button element (parent of SVG if clicked on SVG)
  const button = event.target.closest("button");
  if (!button) return;

  navigator.clipboard
    .writeText(address)
    .then(() => {
      const tooltip = button.querySelector("span");
      if (tooltip) {
        tooltip.textContent = "Copied!";
        tooltip.classList.add("bg-green-700");

        // Reset after 2 seconds
        setTimeout(() => {
          tooltip.textContent = "Copy address";
          tooltip.classList.remove("bg-green-700");
        }, 2000);
      }
    })
    .catch((err) => {
      console.error("Failed to copy address:", err);
    });
}

// Add function to analyze address
export function analyzeAddress(address) {
  // Hide landing content and show loading screen
  document.getElementById("landing-content").classList.add("hidden");
  document.getElementById("loading-screen").classList.remove("hidden");

  // Trigger the API call
  fetch(`/api/audit?address=${encodeURIComponent(address)}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("[DEBUG] API Response:", data);
      const resultsEvent = new CustomEvent("auditResults", { detail: data });
      document.dispatchEvent(resultsEvent);
    })
    .catch((error) => {
      console.error("[DEBUG] Error:", error);
      const errorEvent = new CustomEvent("auditError", { detail: error });
      document.dispatchEvent(errorEvent);
    });
}
