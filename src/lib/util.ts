import BN, { BigNumber } from "bignumber.js";
import { parsebn } from "@defi.org/web3-candies";
import Web3 from "web3";
import { Network} from "./type";
import _ from "lodash";
import { supportedChainsConfig } from "./config/chains";
import { QUOTE_ERRORS } from "./config/consts";


export const amountBN = (decimals?: number, amount?: string) =>
  parsebn(amount || "").times(new BN(10).pow(decimals || 0)).decimalPlaces(0);

export const amountUi = (decimals?: number, amount?: BN) => {
  if (!decimals || !amount) return "";
  const percision = new BN(10).pow(decimals || 0);
  return amount.times(percision).idiv(percision).div(percision).toString();
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export const getChainConfig = (chainId?: number): Network | undefined => {
  if (!chainId) return undefined;
  return Object.values(supportedChainsConfig).find(
    (it) => it.chainId === chainId
  );
};


export async function waitForTxReceipt(web3: Web3, txHash: string) {
  for (let i = 0; i < 30; ++i) {
    // due to swap being fetch and not web3

    await delay(3_000); // to avoid potential rate limiting from public rpc
    try {
      const { mined, revertMessage } = await getTransactionDetails(
        web3,
        txHash
      );

      if (mined) {
        return {
          mined,
          revertMessage: undefined,
        };
      }
      if (revertMessage) {
        return {
          mined: false,
          revertMessage,
        };
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export async function getTransactionDetails(
  web3: Web3,
  txHash: string
): Promise<{ mined: boolean; revertMessage?: string }> {
  try {
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    if (!receipt) {
      return {
        mined: false,
      };
    }

    let revertMessage = "";

    if (!receipt.status) {
      // If the transaction was reverted, try to get the revert reason.
      try {
        const tx = await web3.eth.getTransaction(txHash);
        const code = await web3.eth.call(tx as any, tx.blockNumber!);
        revertMessage = web3.utils.toAscii(code).replace(/\0/g, ""); // Convert the result to a readable string
      } catch (err) {
        revertMessage = "Unable to retrieve revert reason";
      }
    }

    return {
      mined: receipt.status ? true : false,
      revertMessage,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch transaction details: ${error.message}`);
  }
}


export const deductSlippage = (amount?: string, slippage?: number) => {
  if (!amount) return "";
  if (!slippage) return amount;
  console.log(slippage, amount);

  return new BigNumber(amount)
    .times(100 - slippage)
    .div(100)
    .toString();
};


export const counter = () => {
  const now = Date.now();

  return () => {
    return Date.now() - now;
  };
};

export const addSlippage = (amount?: string, slippage?: number) => {
  if (!amount) return "";
  if (!slippage) return amount;
  return new BigNumber(amount)
    .times(100 + slippage)
    .div(100)
    .toString();
};
export const shouldReturnZeroOutAmount = (error: string) => {
  return error === QUOTE_ERRORS.tns;
};
