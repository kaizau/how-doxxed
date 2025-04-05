class RateLimiter {
  constructor(requestsPerSecond) {
    this.queue = [];
    this.processing = false;
    this.requestsPerSecond = requestsPerSecond;
    this.lastRequestTime = 0;
  }

  async enqueue(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const minTimeBetweenRequests = 1000 / this.requestsPerSecond;

      if (timeSinceLastRequest < minTimeBetweenRequests) {
        await new Promise((resolve) =>
          setTimeout(resolve, minTimeBetweenRequests - timeSinceLastRequest),
        );
      }

      const { request, resolve, reject } = this.queue.shift();
      this.lastRequestTime = Date.now();

      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processing = false;
  }
}

class OneInchAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.rateLimiter = new RateLimiter(9); // 9 requests per second
    this.baseUrl = "https://api.1inch.dev";
  }

  async request(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log(`[1inch] Requesting: ${endpoint}`, { params });

    return this.rateLimiter.enqueue(async () => {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        console.error(
          `[1inch] Error: ${response.status} ${response.statusText} for ${endpoint}`,
        );
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[1inch] Success: ${endpoint}`);
      return data;
    });
  }

  // Portfolio endpoints
  async getPortfolioValueChart(addresses) {
    const data = await this.request(
      "/portfolio/portfolio/v4/general/value_chart",
      {
        addresses: Array.isArray(addresses) ? addresses.join(",") : addresses,
        timerange: "1month",
        use_cache: "true",
      },
    );
    return data.result;
  }

  // NFT endpoints
  async getNFTsByAddress(
    address,
    chainIds = [1, 137, 42161, 43114, 100, 8217, 10, 8453],
  ) {
    const data = await this.request("/nft/v2/byaddress", {
      chainIds: chainIds.join(","),
      address,
    });
    return data.assets;
  }

  // History endpoints
  async getHistory(
    address,
    chainIds = [1, 137, 42161, 43114, 100, 8217, 10, 8453],
    limit = 300,
  ) {
    const results = [];

    for (const chainId of chainIds) {
      try {
        const history = await this.request(
          `/history/v2.0/history/${address}/events`,
          {
            chainId,
            limit,
          },
        );
        console.log(`[1inch] History: ${history.items.length}`);
        if (history && history.items && history.items.length > 0) {
          results.push({
            chainId,
            history,
          });
        }
      } catch (error) {
        // Silently skip chains that error or have no data
        console.log(
          `[1inch] Unable to fetch history for chain ${chainId}: ${error}`,
        );
      }
    }

    return results;
  }

  // Balance endpoints
  // async getBalances(address, chainId) {
  //   return this.request(`/balance/v1.2/${chainId}/balances/${address}`);
  // }
}

// Export a singleton instance
const oneInchAPI = new OneInchAPI(process.env.ONEINCH_API_KEY);
export { oneInchAPI };
