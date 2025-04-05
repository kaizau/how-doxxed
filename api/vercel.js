import oneInchAPI from "./1inch.js";

export default async function handler(request, response) {
  // TODO Resolve ENS

  // const wallet = "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5";
  // const wallet = "0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97";
  const wallet = "0x2BbC6AA68516f03DC5B7DA77809Ba63d6587a0cd";

  // Fetch data
  const requestValue = oneInchAPI.getPortfolioValueChart(wallet);
  const requestNFTs = oneInchAPI.getNFTsByAddress(wallet);
  const requestHistory = oneInchAPI.getHistory(wallet);
  const [value, nfts, history] = await Promise.all([
    requestValue,
    requestNFTs,
    requestHistory,
  ]);

  // TODO: Analyze data

  return response.status(200).json({ value, nfts, history });
}
