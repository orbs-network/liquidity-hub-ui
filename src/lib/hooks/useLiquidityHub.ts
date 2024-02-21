import { useCallback, useMemo } from "react";
import { useAllowance } from "./useAllowance";
import { useQuote } from "./useQuote";
import BN from "bignumber.js";
import { swapAnalytics } from "../analytics";
import { useSwapState } from "lib/store/main";
import { UseLiquidityHubArgs, QuoteResponse, UseConfirmSwap, ConfirmSwapCallback } from "../type";
import { amountBN, deductSlippage } from "../util";
import { useTradeOwner } from "./useTradeOwner";
import { useMainContext } from "lib/provider";



const useAnalyticsInit = ({
  args,
  quote,
  
}: {
  args: UseLiquidityHubArgs;
  quote?: QuoteResponse;
  
}) => {
  const fromAmount = useFromAmountWei(args);
  const dexAmountOut = useDexAmountOutWei(args);
  const slippage = useMainContext().slippage;
  return useCallback(
    (toTokenUsd: string | number) => {
      if (!args.fromToken || !args.toToken || !fromAmount) return;
      swapAnalytics.onInitSwap({
        fromToken: args.fromToken,
        toToken: args.toToken,
        dexAmountOut,
        dstTokenUsdValue: toTokenUsd,
        srcAmount: fromAmount,
        slippage,
        tradeType: "BEST_TRADE",
        tradeOutAmount: dexAmountOut,
      });
    },
    [args.fromToken, args.toToken, dexAmountOut, fromAmount, quote, slippage]
  );
};

const useFromAmountWei = (args: UseLiquidityHubArgs) => {
  return useMemo(() => {
    if ((!args.fromAmount && !args.fromAmountUI) || !args.fromToken) {
      return "0";
    }
    return args.fromAmount
      ? args.fromAmount
      : amountBN(args.fromToken.decimals, args.fromAmountUI || "0").toString();
  }, [args.fromAmount, args.fromAmountUI, args.fromToken]);
};

const useDexAmountOutWei = (args: UseLiquidityHubArgs) => {
  const slippage = useMainContext().slippage
  return useMemo(() => {
    if ((!args.dexAmountOut && !args.dexAmountOutUI) || !args.toToken) {
      return "0";
    }
    const value = args.dexAmountOut
      ? args.dexAmountOut
      : amountBN(args.toToken.decimals, args.dexAmountOutUI || "0").toString();

    if (!args.ignoreSlippage) {
      return deductSlippage(value, slippage);
    }
    return value;
  }, [
    args.dexAmountOut,
    args.dexAmountOutUI,
    args.toToken,
    args.ignoreSlippage,
    slippage,
  ]);
};



const useConfirmSwap = ({ args, quote, tradeOwner }: UseConfirmSwap) => {
  const fromAmount = useFromAmountWei(args);
  const dexAmountOut = useDexAmountOutWei(args);
  const updateState = useSwapState((s) => s.updateState);

  return useCallback(
    (callbackArgs: ConfirmSwapCallback) => {
      if (!args.fromToken) {
        console.error("from token missing");
        return;
      }
      if (!args.toToken) {
        console.error("to token missing");
        return;
      }

      if (!fromAmount) {
        console.error("from amount missing");
        return;
      }
      updateState({
        fromToken: args.fromToken,
        toToken: args.toToken,
        fromAmount,
        fromTokenUsd: callbackArgs.fromTokenUsd,
        toTokenUsd: callbackArgs.toTokenUsd,
        quote,
        showWizard: true,
        onSuccessDexCallback: callbackArgs.onSuccess,
        dexFallback: callbackArgs.fallback,
      });
    },
    [
      args.fromToken,
      args.toToken,
      fromAmount,
      quote,
      tradeOwner,
      updateState,
      dexAmountOut,
    ]
  );
};




export const useLiquidityHub = (args: UseLiquidityHubArgs) => {
  const { swapTypeIsBuy, toToken, fromToken, disabled } = args;
  const { swapStatus, swapError } = useSwapState((store) => ({
    swapStatus: store.swapStatus,
    swapError: store.swapError,
    updateState: store.updateState,
  }));

  const fromAmount = useFromAmountWei(args);
  const dexAmountOut = useDexAmountOutWei(args);

  const quoteQuery = useQuote({
    fromToken,
    toToken,
    fromAmount,
    dexAmountOut,
    swapTypeIsBuy,
    disabled,
  });

  // prefetching allowance
  useAllowance(fromToken, fromAmount);

  const tradeOwner = useTradeOwner(
    quoteQuery.data?.outAmount,
    dexAmountOut,
    args.swapTypeIsBuy,
    disabled
  );
  const analyticsInit = useAnalyticsInit({
    args,
    quote: quoteQuery.data,
  });
  const confirmSwap = useConfirmSwap({
    args,
    quote: quoteQuery.data,
    tradeOwner,
  });

  const noQuoteAmountOut = useMemo(() => {
    if (quoteQuery.isLoading) return false;
    if (quoteQuery.data?.outAmount && new BN(quoteQuery.data?.outAmount).gt(0))
      return false;
    return true;
  }, [quoteQuery.data?.outAmount, quoteQuery.isLoading]);

  return {
    quote: quoteQuery.data,
    noQuoteAmountOut,
    quoteLoading: quoteQuery.isLoading,
    quoteError: quoteQuery.error,
    confirmSwap,
    swapLoading: swapStatus === "loading",
    swapError,
    tradeOwner,
    analytics: {
      initSwap: analyticsInit,
    },
  };
};
