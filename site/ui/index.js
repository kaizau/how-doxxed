export function updateResults(data) {
  // Show resolved address if available
  if (data.address) {
    document.getElementById("wallet-address-resolved").textContent =
      data.address;
  }

  // Update portfolio value and chart
  if (data.value && data.value.points && data.value.points.length >= 2) {
    const latestValue = data.value.points[data.value.points.length - 1];
    const previousValue = data.value.points[data.value.points.length - 2];

    if (
      latestValue &&
      previousValue &&
      latestValue.value &&
      previousValue.value
    ) {
      const percentChange =
        ((latestValue.value - previousValue.value) / previousValue.value) * 100;

      // Format the value with commas and 2 decimal places
      const formattedValue = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(latestValue.value);

      // Update the portfolio value display
      document.querySelector(".text-4xl.font-mono").textContent =
        formattedValue;

      // Update the percent change
      const percentElement = document.querySelector(".text-red-500.font-mono");
      percentElement.textContent = `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(2)}%`;
      percentElement.className = `font-mono ${percentChange >= 0 ? "text-green-500" : "text-red-500"}`;

      // Update the chart
      const svg = document.querySelector("svg.stroke-red-500");
      const path = svg.querySelector("path");

      // Normalize the points to fit in the SVG viewBox
      const points = data.value.points.map((point, i) => ({
        x: (i / (data.value.points.length - 1)) * 100,
        y:
          30 -
          ((point.value - Math.min(...data.value.points.map((p) => p.value))) /
            (Math.max(...data.value.points.map((p) => p.value)) -
              Math.min(...data.value.points.map((p) => p.value)))) *
            25,
      }));

      // Create the SVG path
      const pathD = points.reduce(
        (acc, point, i) =>
          acc +
          (i === 0 ? `M ${point.x},${point.y}` : ` L ${point.x},${point.y}`),
        "",
      );

      path.setAttribute("d", pathD);
      svg.className = `w-full h-full stroke-${percentChange >= 0 ? "green" : "red"}-500 stroke-[0.5] fill-none opacity-80`;
    } else {
      // Handle invalid value data
      document.querySelector(".text-4xl.font-mono").textContent = "$0.00";
      document.querySelector(".text-red-500.font-mono").textContent = "+0.00%";
    }
  } else {
    // Handle missing value data
    document.querySelector(".text-4xl.font-mono").textContent = "$0.00";
    document.querySelector(".text-red-500.font-mono").textContent = "+0.00%";
  }

  // Update ENS names
  const ensContainer = document.getElementById("ens-names");
  if (data.nfts) {
    const ensNFTs = data.nfts.filter((nft) => nft.collectionName === "ENS");
    if (ensNFTs.length > 0) {
      ensContainer.innerHTML = ensNFTs
        .map(
          (nft) =>
            `<div class="flex items-center gap-2">
          <img src="./images/ens.svg" alt="ENS" class="h-4 w-4">
          <span>${nft.name}</span>
        </div>`,
        )
        .join("");
    } else {
      ensContainer.innerHTML =
        '<p class="text-gray-500">No ENS names found</p>';
    }
  }

  // Update wallet relationships
  const relationshipsContainer = document.getElementById(
    "wallet-relationships",
  );
  if (data.relationships && data.relationships.total) {
    const topRelationships = Object.entries(data.relationships.total)
      .slice(0, 10)
      .map(([address, count], index) => {
        const inTxns = data.relationships.byDirection.in[address] || 0;
        const outTxns = data.relationships.byDirection.out[address] || 0;
        return `<div class="flex items-baseline gap-2">
          <span class="text-gray-500">${index + 1}.</span>
          <span class="font-mono break-all">${address}</span>
          <span class="text-gray-500 ml-auto">(${inTxns + outTxns} TXNs)</span>
        </div>`;
      })
      .join("");
    relationshipsContainer.innerHTML = topRelationships;
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
}
