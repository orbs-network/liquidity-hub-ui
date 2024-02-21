import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useAmountUI } from "./useAmountUI";
import { useQuote } from "./useQuote";

export const useSwapConfirmation = () => {
  const store = useSwapState(
    useShallow((s) => ({
      currentStep: s.currentStep,
      fromToken: s.fromToken,
      toToken: s.toToken,
      txHash: s.txHash,
      swapStatus: s.swapStatus,
      swapError: s.swapError,
      showWizard: s.showWizard,
      updateState: s.updateState,
      fromAmount: s.fromAmount,
      dexAmountOut: s.dexAmountOut,
      disableLh: s.disableLh,
      onCloseSwap: s.onCloseSwap,
    }))
  );

  const { data: quote } = useQuote({
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: store.fromAmount,
    dexAmountOut: store.dexAmountOut,
    disabled: store.disableLh,
  });


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
    currentStep: store.currentStep,
    fromToken: store.fromToken,
    toToken: store.toToken,
    fromAmount: useAmountUI(store.fromToken?.decimals, store.fromAmount),
    txHash: store.txHash,
    swapStatus: store.swapStatus,
    swapError: store.swapError,
    toAmount: useAmountUI(store.toToken?.decimals, quote?.outAmount),
    showSubmitModal: !!store.showWizard,
    onClose: store.onCloseSwap,
    title,
  };
};

