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
import { useRequestSwap } from "./useRequestSwap";
import { useSign } from "./useSign";
import { useWrap } from "./useWrap";

export const useSwapCallback = ({
  onSuccessDexCallback,
  fromTokenUsd,
  toTokenUsd,
}: {
  onSuccessDexCallback: () => void;
  fromTokenUsd?: string | number;
  toTokenUsd?: string | number;
}) => {
  const slippage = useMainContext().slippage;
  const {
    onSwapSuccess,
    onSwapError,
    onSwapStart,
    dexFallback,
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
      dexFallback: store.dexFallback,
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

  swapAnalytics.onInitSwap({
    fromTokenUsd,
    fromToken,
    toToken,
    dexAmountOut,
    dstTokenUsdValue: toTokenUsd,
    srcAmount: fromAmount,
    slippage,
    tradeType: "BEST_TRADE",
    tradeOutAmount: quote?.outAmount,
    quoteAmountOut: quote?.outAmount,
  });

  const approve = useApprove();
  const wrap = useWrap(fromToken);
  const sign = useSign();
  const requestSwap = useRequestSwap();
  const wTokenAddress = useChainConfig()?.wToken?.address;
  const addOrder = useAddOrder();

  const { data: approved } = useAllowance(fromToken, fromAmount);

  return useCallback(async () => {
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
      onSuccessDexCallback();
      return tx;
    } catch (error: any) {
      onSwapError(error.message);
      swapAnalytics.onClobFailure();
      if (dexFallback) {
        // fallback to dex

        dexFallback();
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
    dexFallback,
    addOrder,
  ]);
};
