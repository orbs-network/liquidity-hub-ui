import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useAmountUI } from "./useAmountUI";
import { useQuotePayload } from "./useQuoteData";

export const useSwapConfirmation = () => {
  const store = useSwapState(
    useShallow((s) => ({
      fromToken: s.fromToken,
      toToken: s.toToken,
      txHash: s.txHash,
      swapStatus: s.swapStatus,
      swapError: s.swapError,
      showConfirmation: s.showConfirmation,
      updateState: s.updateState,
      fromAmount: s.fromAmount,
      dexAmountOut: s.dexAmountOut,
      disableLh: s.disableLh,
      onCloseSwap: s.onCloseSwap,
      fromTokenUsd: s.fromTokenUsd,
      toTokenUsd: s.toTokenUsd
    }))
  );

  const { data: quote } = useQuotePayload()

  const title = useMemo(() => {
    if (store.swapStatus === "success") {
      return "Swap completed";
    }
    if (store.swapStatus === "failed") {
      return "";
    }
    return "Review swap";
  }, [store.swapStatus]);

  return {
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: useAmountUI(store.fromToken?.decimals, store.fromAmount),
    txHash: store.txHash,
    swapStatus: store.swapStatus,
    swapError: store.swapError,
    toAmount: useAmountUI(store.toToken?.decimals, quote?.outAmount),
    showModal: !!store.showConfirmation,
    closeModal: store.onCloseSwap,
    title,
    fromTokenUsd: store.fromTokenUsd,
    toTokenUsd: store.toTokenUsd,
  };
};

