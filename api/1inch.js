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

    return this.rateLimiter.enqueue(async () => {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `1inch API error: ${response.status} ${response.statusText}`,
        );
      }

      return response.json();
    });
  }

  // Portfolio endpoints
  async getPortfolioValueChart(addresses) {
    return this.request("/portfolio/portfolio/v4/general/value_chart", {
      addresses: Array.isArray(addresses) ? addresses.join(",") : addresses,
      use_cache: "true",
    });
  }

  // NFT endpoints
  async getNFTsByAddress(
    address,
    chainIds = [1, 137, 42161, 43114, 100, 8217, 10, 8453],
  ) {
    return this.request("/nft/v2/byaddress", {
      chainIds: chainIds.join(","),
      address,
    });
  }

  // History endpoints
  async getHistory(address, chainId, limit = 100) {
    return this.request(`/history/v2.0/history/${address}/events`, {
      chainId,
      limit,
    });
  }

  // Balance endpoints
  async getBalances(address, chainId) {
    return this.request(`/balance/v1.2/${chainId}/balances/${address}`);
  }
}

// Export a singleton instance
const oneInchAPI = new OneInchAPI(process.env.ONEINCH_API_KEY);
export default oneInchAPI;
