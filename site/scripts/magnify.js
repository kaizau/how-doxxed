document.addEventListener("DOMContentLoaded", () => {
  const magnifier = document.createElement("div");
  magnifier.className = "magnifier";
  document.body.appendChild(magnifier);

  // Create toggle button
  const toggleButton = document.createElement("button");
  toggleButton.className = "magnifier-toggle";
  toggleButton.textContent = "🔍 OFF";
  document.body.appendChild(toggleButton);

  let isMagnifierEnabled = false;
  const hiddenDollars = [];

  // Only activate on landing page
  if (document.getElementById("landing-content")) {
    // Create background container for dollars
    const backgroundDollars = document.createElement("div");
    backgroundDollars.className = "background-dollars";
    document.body.appendChild(backgroundDollars);

    // Create random dollar signs
    const createRandomDollars = () => {
      const numDollars = 100; // Number of dollar signs
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gridSize = Math.ceil(Math.sqrt(numDollars)); // Create a grid for even distribution

      // Calculate grid cell size
      const cellWidth = viewportWidth / gridSize;
      const cellHeight = viewportHeight / gridSize;

      for (let i = 0; i < numDollars; i++) {
        const dollar = document.createElement("span");
        dollar.className = "hidden-dollar";
        dollar.textContent = "$";

        // Calculate grid position
        const gridX = i % gridSize;
        const gridY = Math.floor(i / gridSize);

        // Add some randomness within the grid cell
        const x = gridX * cellWidth + Math.random() * cellWidth * 0.8;
        const y = gridY * cellHeight + Math.random() * cellHeight * 0.8;

        // Random rotation
        const rotation = Math.random() * 360;

        dollar.style.left = `${x}px`;
        dollar.style.top = `${y}px`;
        dollar.style.setProperty("--rotation", `${rotation}deg`);

        backgroundDollars.appendChild(dollar);
        hiddenDollars.push(dollar);
      }
    };

    // Initialize random dollars
    createRandomDollars();

    // Toggle magnifier mode
    toggleButton.addEventListener("click", () => {
      isMagnifierEnabled = !isMagnifierEnabled;
      toggleButton.textContent = isMagnifierEnabled ? "🔍 ON" : "🔍 OFF";
      magnifier.classList.toggle("active", isMagnifierEnabled);
    });

    document.addEventListener("mousemove", (e) => {
      if (isMagnifierEnabled) {
        const x = e.clientX;
        const y = e.clientY;
        const radius = 75; // Half the magnifier width

        magnifier.style.left = `${x}px`;
        magnifier.style.top = `${y}px`;

        // Check which dollars are under the magnifier using distance calculation
        hiddenDollars.forEach((dollar) => {
          const rect = dollar.getBoundingClientRect();
          const dollarX = rect.left + rect.width / 2;
          const dollarY = rect.top + rect.height / 2;

          // Calculate distance from mouse to dollar center
          const distance = Math.sqrt(
            Math.pow(x - dollarX, 2) + Math.pow(y - dollarY, 2),
          );

          // If within radius, show the dollar
          if (distance <= radius) {
            dollar.classList.add("visible");
          } else {
            dollar.classList.remove("visible");
          }
        });
      }
    });

    document.addEventListener("mouseleave", () => {
      magnifier.classList.remove("active");
      hiddenDollars.forEach((dollar) => dollar.classList.remove("visible"));
    });

    // Recreate dollars on window resize
    window.addEventListener("resize", () => {
      backgroundDollars.innerHTML = "";
      hiddenDollars.length = 0;
      createRandomDollars();
    });
  }
});
