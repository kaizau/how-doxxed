import { Alchemy, Network } from "alchemy-sdk";

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

export async function ensToAddress(ensName) {
  try {
    console.log(`[alchemy] Resolving ENS name ${ensName}`);

    const address = await alchemy.core.resolveName(ensName);
    return address;
  } catch (error) {
    console.error(`[alchemy] Error resolving ENS name ${ensName}:`, error);
    throw error;
  }
}
