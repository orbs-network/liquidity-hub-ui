import { useSwapState } from "lib/store/main";
import { amountUi } from "lib/util";
import { useMemo } from "react";
import BN from "bignumber.js";
import { isNativeAddress } from "@defi.org/web3-candies";
import { useSwapCallback } from "./useSwap";
import { useAllowance } from "./useAllowance";
import { useFormatNumber } from "./useFormatNumber";
import { useShallow } from "zustand/react/shallow";

const useAmounts = () => {
  const store = useSwapState();

  return useMemo(() => {
    return {
      fromAmount: {
        value: store.fromAmount,
        ui: amountUi(store.fromToken?.decimals, new BN(store.fromAmount || 0)),
      },
      toAmount: {
        value: store.quote?.outAmount,
        ui: amountUi(
          store.toToken?.decimals,
          new BN(store.quote?.outAmount || 0)
        ),
      },
    };
  }, [store.fromToken, store.toToken, store.fromAmount, store.quote]);
};

export const useSwapConfirmationModalButton = () => {
  const store = useSwapState();
  const { fromAmount } = useAmounts();

  const { data: approved, isLoading: allowanceQueryLoading } = useAllowance(
    store.fromToken,
    fromAmount.value
  );

  const swapCallback = useSwapCallback({
    fromToken: store.fromToken,
    fromAmount: fromAmount.value,
    toToken: store.toToken,
    quote: store.quote,
    approved,
  });

  return useMemo(() => {
    const getText = () => {
      if (isNativeAddress(store.fromToken?.address || ""))
        return "Wrap and swap";
      if (!approved) return "Approve and swap";
      return "Sign and Swap";
    };

    return {
      text: getText(),
      onClick: swapCallback,
      isPending: store.swapStatus === "loading" || allowanceQueryLoading,
    };
  }, [approved, store.fromToken, store.swapStatus, swapCallback]);
};

export const useSwapConfirmationModal = () => {
  const {
    currentStep,
    fromToken,
    toToken,
    fromTokenUsd,
    toTokenUsd,
    txHash,
    swapStatus,
    swapError,
    showWizard,
    updateState,
  } = useSwapState(
    useShallow((s) => ({
      currentStep: s.currentStep,
      fromToken: s.fromToken,
      toToken: s.toToken,
      fromTokenUsd: s.fromTokenUsd,
      toTokenUsd: s.toTokenUsd,
      txHash: s.txHash,
      swapStatus: s.swapStatus,
      swapError: s.swapError,
      showWizard: s.showWizard,
      updateState: s.updateState,
    }))
  );
  const { fromAmount, toAmount } = useAmounts();

  const _fromAmountUI = useFormatNumber({ value: fromAmount.ui });
  const _toAmountUI = useFormatNumber({ value: toAmount.ui });

  return {
    currentStep,
    fromToken,
    toToken,
    fromAmount: fromAmount.value,
    fromAmountUI: _fromAmountUI,
    fromTokenUsd,
    toTokenUsd,
    txHash,
    swapStatus,
    swapError,
    toAmount: toAmount.value,
    toAmountUI: _toAmountUI,
    showSubmitModal: showWizard,
    hideModal: () => updateState({ showWizard: false }),
  };
};
