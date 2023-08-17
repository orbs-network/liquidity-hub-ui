import { hasWeb3Instance, maxUint256, permit2Address, erc20abi, sendAndWaitForConfirmations, setWeb3Instance, signEIP712 } from "@defi.org/web3-candies";
const API_ENDPOINT = "https://hub.orbs.network";
export const ORBS_WEBSITE = "https://www.orbs.com";
import BN from "bignumber.js";

import Web3 from "web3";
import { ApproveArgs, QuoteArgs, QuoteResponse, SubmitLiquidityTradeArgs, SwapArgs, SwapControl } from "./types";
import { analytics } from "./analytics";
import { counter } from "./utils";
import { useSwapState } from "./state";

const getSwapControl = (): SwapControl | undefined => new URLSearchParams(location.search).get("liquidity-hub")?.toLowerCase() as SwapControl;
const shouldSkipSwap = (): boolean => {
  return getSwapControl() === SwapControl.SKIP || (getSwapControl() !== SwapControl.FORCE && useSwapState.getState().isFailed);
};
export const quote = async (args: QuoteArgs): Promise<QuoteResponse> => {
  try {
    useSwapState.getState().updateState({ isQuoting: true });
    analytics.onQuoteRequest(args.outAmount);
    const count = counter();
    const response = await fetch(`${API_ENDPOINT}/quote?chainId=${args.chainId}`, {
      method: "POST",
      body: JSON.stringify({
        inToken: args.inToken,
        outToken: args.outToken,
        inAmount: args.inAmount,
        outAmount: args.outAmount,
        user: args.user,
        slippage: args.slippage,
        qs: encodeURIComponent(location.search),
      }),
    });
    const result: QuoteResponse = await response.json();

    if (!result) {
      throw new Error("Missing result");
    }

    analytics.onQuoteSuccess(result.outAmount, result.serializedOrder, result.callData, result.permitData, count());

    if (getSwapControl() !== SwapControl.FORCE && BN(result.outAmount).isLessThan(BN(args.outAmount))) {
      analytics.onClobLowAmountOut();
      throw new Error("Dex trade is better than LiquidityHub trade");
    }

    useSwapState.getState().updateState({ outAmount: result.outAmount, isWon: true });

    return result;
  } catch (error: any) {
    analytics.onQuoteFailed(error.message);
    throw new Error(error.message);
  } finally {
    useSwapState.getState().updateState({ isQuoting: false });
  }
};

export const sign = async (account: string, provider: any, permitData: any) => {
  try {
    useSwapState.getState().updateState({ waitingForSignature: true });
    if (!hasWeb3Instance()) {
      setWeb3Instance(new Web3(provider));
    }
    process.env.DEBUG = "web3-candies";

    const signature = await signEIP712(account!, permitData);
    analytics.onSignatureSuccess(signature);
    return signature;
  } catch (error: any) {
    analytics.onSignatureFailed(error.message);
    throw new Error(error.message);
  } finally {
    useSwapState.getState().updateState({ waitingForSignature: false });
  }
};

export const swap = async (args: SwapArgs): Promise<string> => {
  try {
    useSwapState.getState().updateState({ isSwapping: true });
    const count = counter();
    analytics.onSwapRequest();
    const txHashResponse = await fetch(`${API_ENDPOINT}/swapx?chainId=${args.chainId}`, {
      method: "POST",
      body: JSON.stringify({
        inToken: args.inToken,
        outToken: args.outToken,
        inAmount: args.inAmount,
        outAmount: args.outAmount,
        user: args.user,
        signature: args.signature,
        ...args.quoteResult,
      }),
    });
    const swap = await txHashResponse.json();
    if (!swap || !swap.txHash) {
      throw new Error("Missing txHash");
    }

    analytics.onSwapSuccess(swap.txHash, count());
    return swap.txHash;
  } catch (error: any) {
    analytics.onSwapFailed(error.message);
    throw new Error(error.message);
  } finally {
    useSwapState.getState().updateState({ isSwapping: false });
  }
};

export const approve = async (args: ApproveArgs) => {
  try {
    const web3 = new Web3(args.provider);
    const contract = new web3.eth.Contract(erc20abi as any, args.inToken);

    const allowance = await contract.methods?.allowance(args.user, permit2Address).call();
    if (BN(allowance.toString()).gte(BN(args.inAmount))) {
      analytics.onTokenApproved();
      return;
    }
    useSwapState.getState().updateState({ waitingForApproval: true });
    analytics.onApproveRequest();
    setWeb3Instance(new Web3(args.provider));
    const tx = contract.methods.approve(permit2Address, maxUint256);
    await sendAndWaitForConfirmations(tx, { from: args.user });
    analytics.onTokenApproved();
  } catch (error: any) {
    analytics.onApproveFailed(error.message);
    throw new Error(error.message);
  } finally {
    useSwapState.getState().updateState({ waitingForApproval: false });
  }
};

export const submitTrade = async (args: SubmitLiquidityTradeArgs) => {
  const quoteArgs = {
    inToken: args.inToken,
    outToken: args.outToken,
    inAmount: args.inAmount,
    outAmount: args.outAmount,
    user: args.user,
    slippage: args.slippage,
    chainId: args.chainId,
  };

  try {
    if (shouldSkipSwap()) {
      throw new Error("Skipping swap");
    }
    await quote(quoteArgs);
  } catch (error: any) {
    throw new Error(error.message);
  }

  try {
    await approve({
      user: args.user,
      inToken: args.inToken,
      inAmount: args.inAmount,
      provider: args.provider,
    });
    const quoteResult = await quote(quoteArgs);
    const signature = await sign(args.user, args.provider, quoteResult.permitData);
    const txHash = await swap({
      inAmount: args.inAmount,
      outAmount: args.outAmount,
      inToken: args.inToken,
      outToken: args.outToken,
      user: args.user,
      chainId: args.chainId,
      quoteResult,
      signature,
    });
    return txHash;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
