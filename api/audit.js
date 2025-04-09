import { oneInchAPI } from "./audit/1inch.js";
import { ensToAddress, addressToEns } from "./audit/alchemy.js";
import { analyzeTimezone, analyzeRelationships } from "./audit/analyze.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  let address = request?.body?.address;
  if (!address) {
    return response.status(400).json({ error: "Address is required" });
  }

  if (address.includes(".")) {
    try {
      address = await ensToAddress(address);
    } catch (error) {
      return response.status(400).json({ error: "Invalid ENS name" });
    }
  }

  // Fetch all the things
  let value, nfts, history, ensNames;
  try {
    const requestEnsNames = addressToEns(address);
    const requestValue = oneInchAPI.getPortfolioValueChart(address);
    const requestNFTs = oneInchAPI.getNFTsByAddress(address).catch((error) => {
      console.error("Failed to fetch NFTs:", error);
      return []; // Return empty array if NFT fetch fails
    });
    const requestHistory = oneInchAPI.getHistory(address);

    [value, ensNames, nfts, history] = await Promise.all([
      requestValue,
      requestEnsNames,
      requestNFTs,
      requestHistory,
    ]);
  } catch (error) {
    console.error("Error in audit:", error);
    return response.status(400).json({ error: "Error fetching data" });
  }

  // TODO Associate addresses with known entities
  // TODO Additional history hop on high relevance addresses

  const timezone = analyzeTimezone(history);
  const relationships = analyzeRelationships(history);

  return response
    .status(200)
    .json({ address, value, ensNames, nfts, history, timezone, relationships });
}
