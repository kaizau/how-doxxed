export function analyzeTimezone(history) {
  const hourlyTransactions = {};

  // Process each chain's history
  history.forEach((chainData) => {
    const {
      chainId,
      history: { items },
    } = chainData;

    items.forEach((item) => {
      // Convert timestamp to Date object
      const date = new Date(item.timeMs);
      // Get hour in 24-hour format
      const hour = date.getHours();

      // Initialize hour if not exists
      if (!hourlyTransactions[hour]) {
        hourlyTransactions[hour] = [];
      }

      // Add transaction to hour
      hourlyTransactions[hour].push({
        chainId,
        transactionHash: item.details.txHash,
        timeMs: item.timeMs,
        direction: item.direction,
      });
    });
  });

  return hourlyTransactions;
}

export function analyzeRelationships(history) {
  const relationships = {
    total: {},
    byType: {},
    byDirection: {
      in: {},
      out: {},
    },
  };

  // Process each chain's history
  history.forEach((chainData) => {
    const {
      chainId,
      history: { items },
    } = chainData;

    items.forEach((item) => {
      const { details, direction } = item;
      const { fromAddress, toAddress, type } = details;

      // Skip if no addresses to analyze
      if (!fromAddress || !toAddress) return;

      // Get the other address (the one this address is interacting with)
      const otherAddress = direction === "in" ? fromAddress : toAddress;

      // Update total interactions
      if (!relationships.total[otherAddress]) {
        relationships.total[otherAddress] = 0;
      }
      relationships.total[otherAddress]++;

      // Update interactions by type
      if (!relationships.byType[type]) {
        relationships.byType[type] = {};
      }
      if (!relationships.byType[type][otherAddress]) {
        relationships.byType[type][otherAddress] = 0;
      }
      relationships.byType[type][otherAddress]++;

      // Update interactions by direction
      if (!relationships.byDirection[direction][otherAddress]) {
        relationships.byDirection[direction][otherAddress] = 0;
      }
      relationships.byDirection[direction][otherAddress]++;
    });
  });

  // Sort the results by frequency
  const sortByFrequency = (obj) => {
    return Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  };

  // Sort all categories
  relationships.total = sortByFrequency(relationships.total);
  Object.keys(relationships.byType).forEach((type) => {
    relationships.byType[type] = sortByFrequency(relationships.byType[type]);
  });
  relationships.byDirection.in = sortByFrequency(relationships.byDirection.in);
  relationships.byDirection.out = sortByFrequency(
    relationships.byDirection.out,
  );

  return relationships;
}
