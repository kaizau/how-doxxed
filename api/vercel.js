// eslint-disable-next-line no-unused-vars
export default async function handler(request, response) {
  // TODO Async requests to loop through chains
  const wallet = "0xb5d85CBf7cB3EE0D56b3bB207D5Fc4B82f43F511";
  const requestBalances = getWalletBalances(wallet, 1);
  const requestHistory = getWalletHistory(wallet, 1);

  requestBalances.then((balances) => {
    console.log(balances);
  });
  requestHistory.then((history) => {
    console.log(history);
  });

  const [balances, history] = await Promise.all([
    requestBalances,
    requestHistory,
  ]);
  return response.status(200).json({ balances, history });
}

async function getWalletBalances(address, chainId) {
  const base = "https://api.1inch.dev/balance/v1.2/";
  const url = `${base}/${chainId}/balances/${address}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getWalletHistory(address, chainId) {
  const base = "https://api.1inch.dev/history/v2.0/history";
  const limit = 10; // TODO: Bump to 100 for production
  const url = `${base}/${address}/events?chainId=${chainId}&limit=${limit}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
