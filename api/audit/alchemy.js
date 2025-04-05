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

export async function addressToEns(address) {
  try {
    console.log(`[alchemy] Getting ENS domains for address ${address}`);

    const ensContractAddresses = [
      "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401",
      "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
    ];

    const nftsPromises = ensContractAddresses.map((contractAddress) =>
      alchemy.nft.getNftsForOwner(address, {
        contractAddresses: [contractAddress],
      }),
    );

    const nftsResults = await Promise.all(nftsPromises);
    const ensDomains = nftsResults.flatMap((result) =>
      result.ownedNfts.map((nft) => nft.name),
    );
    return ensDomains.filter(
      (domain) => domain !== undefined && domain !== null,
    );
  } catch (error) {
    console.error(
      `[alchemy] Error getting ENS domains for address ${address}:`,
      error,
    );
    throw error;
  }
}
