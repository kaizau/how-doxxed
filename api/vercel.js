import { oneInchAPI } from "./1inch.js";
import { ensToAddress } from "./alchemy.js";

export default async function handler(request, response) {
  // let address = "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5";
  // let address = "0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97";
  // let address = "0x2BbC6AA68516f03DC5B7DA77809Ba63d6587a0cd";
  let address = "zeni.eth";

  // let address = request.query.address;
  if (address.includes(".")) {
    try {
      address = await ensToAddress(address);
    } catch (error) {
      return response.status(400).json({ error: "Invalid ENS name" });
    }
  }

  // Fetch data
  const requestValue = oneInchAPI.getPortfolioValueChart(address);
  const requestNFTs = oneInchAPI.getNFTsByAddress(address);
  const requestHistory = oneInchAPI.getHistory(address);
  const [value, nfts, history] = await Promise.all([
    requestValue,
    requestNFTs,
    requestHistory,
  ]);

  // TODO: Analyze data

  return response.status(200).json({ value, nfts, history });
}
