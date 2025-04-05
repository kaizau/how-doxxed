export default async function handler(request, response) {
  // TODO Resolve ENS

  // const wallet = "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5";
  // const wallet = "0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97";
  const wallet = "0x2BbC6AA68516f03DC5B7DA77809Ba63d6587a0cd";

  // Fetch data
  const requestValue = getWalletValue(wallet);
  const requestNFTs = getWalletNFTs(wallet);
  const requestHistory = getWalletHistory(wallet, 1); // TODO May need to loop through chains
  const [value, nfts, history] = await Promise.all([
    requestValue,
    requestNFTs,
    requestHistory,
  ]);

  // TODO: Analyze data

  return response.status(200).json({ value, nfts, history });
}

// Returns 1 year of value history (supposedly across all tracked chains)
// [ { timestamp: 1712275200, value_usd: 0 }, ... ]
async function getWalletValue(address) {
  const base =
    "https://api.1inch.dev/portfolio/portfolio/v4/general/value_chart";
  const url = `${base}?addresses=${address}&use_cache=true`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
      },
    });
    const data = await response.json();
    console.log("value", data);
    return data.result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Not particularly useful
async function getWalletBalances(address, chainId) {
  const base = "https://api.1inch.dev/balance/v1.2/";
  const url = `${base}/${chainId}/balances/${address}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
      },
    });
    const data = await response.json();
    console.log("balances", data);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Get NFTs owned by the wallet
// list of supported chains `ETHEREUM = 1, POLYGON = 137, ARBITRUM = 42161, AVALANCHE = 43114, GNOSIS = 100, KLAYTN = 8217, OPTIMISM = 10, BASE = 8453`
async function getWalletNFTs(address) {
  const base = "https://api.1inch.dev/nft/v2/byaddress";
  const chainIds = [1, 137, 42161, 43114, 100, 8217, 10, 8453];
  const url = `${base}?chainIds=${chainIds.join(",")}&address=${address}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
      },
    });
    const data = await response.json();
    console.log("nfts", data);
    return data.assets;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getWalletHistory(address, chainId) {
  const base = "https://api.1inch.dev/history/v2.0/history";
  const limit = 100;
  const url = `${base}/${address}/events?chainId=${chainId}&limit=${limit}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
      },
    });
    const data = await response.json();
    console.log("history", data);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
