import { isNativeAddress, zeroAddress } from "@defi.org/web3-candies";
import { useMainContext } from "../provider";
import { useSwapState } from "../store/main";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { swapAnalytics } from "../analytics";
import { useAddOrder } from "./useAddOrder";
import { useAllowance } from "./useAllowance";
import { useApprove } from "./useApprove";
import { useChainConfig } from "./useChainConfig";
import { useQuote } from "./useQuote";
import { useSwapX } from "./useSwapX";
import { useSign } from "./useSign";
import { useWrap } from "./useWrap";

export const useSubmitSwap = () => {
  const slippage = useMainContext().slippage;
  const {
    onSwapSuccess,
    onSwapError,
    onSwapStart,
    onCloseSwap,
    fromAmount,
    fromToken,
    toToken,
    dexAmountOut,
    disableLh,
  } = useSwapState(
    useShallow((store) => ({
      onSwapSuccess: store.onSwapSuccess,
      onSwapError: store.onSwapError,
      onSwapStart: store.onSwapStart,
      onCloseSwap: store.onCloseSwap,
      fromAmount: store.fromAmount,
      fromToken: store.fromToken,
      toToken: store.toToken,
      dexAmountOut: store.dexAmountOut,
      disableLh: store.disableLh,
    }))
  );

  const { data: quote } = useQuote({
    fromToken,
    toToken,
    fromAmount,
    dexAmountOut,
    disabled: disableLh,
  });


  const approve = useApprove();
  const wrap = useWrap(fromToken);
  const sign = useSign();
  const requestSwap = useSwapX();
  const wTokenAddress = useChainConfig()?.wToken?.address;
  const addOrder = useAddOrder();

  const { data: approved } = useAllowance(fromToken, fromAmount);

  return useCallback(async (args?: {
  fromTokenUsd?: string | number;
  toTokenUsd?: string | number;
  fallback?: () => void;
  onSuccess?: () => void;
}) => {

  

  swapAnalytics.onInitSwap({
    fromTokenUsd: args?.fromTokenUsd,
    fromToken,
    toToken,
    dexAmountOut,
    dstTokenUsdValue: args?.toTokenUsd,
    srcAmount: fromAmount,
    slippage,
    tradeType: "BEST_TRADE",
    tradeOutAmount: quote?.outAmount,
    quoteAmountOut: quote?.outAmount,
  });

    try {
      if (!wTokenAddress) {
        throw new Error("Missing weth address");
      }

      if (!quote) {
        throw new Error("Missing quote");
      }

      if (!fromToken || !toToken) {
        throw new Error("Missing from or to token");
      }
      if (!fromAmount) {
        throw new Error("Missing from amount");
      }

      onSwapStart();
      const isNativeIn = isNativeAddress(fromToken.address);
      const isNativeOut = isNativeAddress(toToken.address);

      let inTokenAddress = isNativeIn ? zeroAddress : fromToken.address;
      const outTokenAddress = isNativeOut ? zeroAddress : toToken.address;

      if (isNativeIn) {
        await wrap(fromAmount);
        inTokenAddress = wTokenAddress;
      }
      if (!approved) {
        await approve(fromToken?.address, fromAmount);
      }
      swapAnalytics.onApprovedBeforeTheTrade(approved);
      const signature = await sign(quote.permitData);
      const tx = await requestSwap({
        srcToken: inTokenAddress,
        destToken: outTokenAddress,
        srcAmount: fromAmount,
        signature,
        quote,
      });
      onSwapSuccess();
      addOrder({
        id: crypto.randomUUID(),
        fromToken: fromToken,
        toToken: toToken,
        fromAmount,
      });
      args?.onSuccess?.();
      return tx;
    } catch (error: any) {
      onSwapError(error.message);
      swapAnalytics.onClobFailure();
      if (args?.fallback) {
        args.fallback();
        onCloseSwap();
      }
    } finally {
      swapAnalytics.clearState();
    }
  }, [
    approve,
    wrap,
    sign,
    requestSwap,
    wTokenAddress,
    fromAmount,
    fromToken,
    toToken,
    quote,
    onSwapSuccess,
    onSwapError,
    approved,
    onSwapStart,
    onCloseSwap,
    addOrder,
  ]);
};