import { Alchemy, Network } from "alchemy-sdk";

const ethConfig = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const baseConfig = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};

const ethAlchemy = new Alchemy(ethConfig);
const baseAlchemy = new Alchemy(baseConfig);

export async function ensToAddress(ensName) {
  try {
    console.log(`[alchemy] Resolving ENS name ${ensName}`);

    const address = await ethAlchemy.core.resolveName(ensName);
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

    const baseContractAddresses = [
      "0x03c4738ee98ae44591e1a4a4f3cab6641d95dd9a",
    ];

    // Fetch ENS names from Ethereum mainnet
    const ensNftsPromises = ensContractAddresses.map((contractAddress) =>
      ethAlchemy.nft.getNftsForOwner(address, {
        contractAddresses: [contractAddress],
      }),
    );

    // Fetch Base names from Base L2
    const baseNftsPromises = baseContractAddresses.map((contractAddress) =>
      baseAlchemy.nft.getNftsForOwner(address, {
        contractAddresses: [contractAddress],
      }),
    );

    const [ensNftsResults, baseNftsResults] = await Promise.all([
      Promise.all(ensNftsPromises),
      Promise.all(baseNftsPromises),
    ]);

    const ensDomains = ensNftsResults.flatMap((result) =>
      result.ownedNfts.map((nft) => nft.name),
    );

    const baseDomains = baseNftsResults.flatMap((result) =>
      result.ownedNfts.map((nft) => nft.name),
    );

    return [...ensDomains, ...baseDomains].filter(
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
