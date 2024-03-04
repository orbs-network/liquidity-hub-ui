
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useMainContext } from "../provider";
import { QuoteQueryArgs } from "../type";
import { useLiquidityHubPersistedStore, useSwapState } from "../store/main";
import { QUERY_KEYS, zeroAddress } from "../config/consts";
import { useShallow } from "zustand/react/shallow";
import { useChainConfig } from "./useChainConfig";
import { useIsDisabled } from "./useIsDisabled";
import { liquidityHub } from "../liquidityHub";
import { eqIgnoreCase, isNativeAddress } from "../util";

export const useQuote = (args: QuoteQueryArgs) => {
  const liquidityHubEnabled = useLiquidityHubPersistedStore(
    (s) => s.liquidityHubEnabled
  );
  const { fromAmount, dexAmountOut, fromToken, toToken } = args;
  const wTokenAddress = useChainConfig()?.wToken?.address;
  const { account, chainId, partner, quoteInterval, apiUrl, slippage } =
    useMainContext();
  const showConfirmation = useSwapState(useShallow((s) => s.showConfirmation));
  const disabled = useIsDisabled();

  const { fromAddress, toAddress } = useMemo(() => {
    return {
      fromAddress: isNativeAddress(fromToken?.address || "")
        ? wTokenAddress
        : fromToken?.address,
      toAddress: isNativeAddress(toToken?.address || "")
        ? zeroAddress
        : toToken?.address,
    };
  }, [fromToken?.address, toToken?.address]);

  const isUnwrap =
    eqIgnoreCase(wTokenAddress || "", fromToken?.address || "") &&
    isNativeAddress(toToken?.address || "");

  const enabled =
    !isUnwrap &&
    !!partner &&
    !!chainId &&
    !!account &&
    !!fromToken &&
    !!toToken &&
    !!fromAmount &&
    fromAmount !== "0" &&
    liquidityHubEnabled &&
    !showConfirmation &&
    !disabled;

  return useQuery({
    queryKey: [
      QUERY_KEYS.QUOTE,
      fromAddress,
      toAddress,
      fromAmount,
      slippage,
      account,
      apiUrl,
    ],
    queryFn: async ({ signal }) => {
      return liquidityHub.quote({
        fromAddress: fromAddress!,
        apiUrl: apiUrl!,
        chainId: chainId!,
        toAddress: toAddress!,
        fromAmount: fromAmount!,
        dexAmountOut: dexAmountOut!,
        account: account!,
        slippage: slippage!,
        partner,
        signal,
        toTokenecimals: toToken?.decimals!,
      });
    },
    refetchInterval: quoteInterval,
    staleTime: Infinity,
    enabled,
    gcTime: 0,
    retry: 2,
  });
};
