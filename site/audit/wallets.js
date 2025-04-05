import detectEthereumProvider from "@metamask/detect-provider";

export async function analyzeWallets() {
  const provider = await detectEthereumProvider();
  console.log(provider);
}
