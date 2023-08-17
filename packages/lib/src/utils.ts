import Web3 from "web3";

export const counter = () => {
  const now = Date.now();

  return () => {
    return Date.now() - now;
  };
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForTxResponse(txHash: string, provider: any) {
  const web3 = new Web3(provider);
  for (let i = 0; i < 30; ++i) {
    // due to swap being fetch and not web3

    await delay(3_000); // to avoid potential rate limiting from public rpc
    try {
      const tx = await web3.eth.getTransaction(txHash);
      if (tx && tx instanceof Object && tx.blockNumber) {
        return tx;
      }
    } catch (error) {
      /* empty */
    }
  }
}
