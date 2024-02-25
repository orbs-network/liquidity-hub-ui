import { useShallow } from "zustand/react/shallow";
import { useSwapState } from "../store/main";
import { useQuote } from "./useQuote";

export const useQuotePayload = () => {
  const { fromToken, toToken, fromAmount, dexAmountOut, disableLh } =
    useSwapState(
      useShallow((s) => ({
        fromToken: s.fromToken,
        toToken: s.toToken,
        fromAmount: s.fromAmount,
        dexAmountOut: s.dexAmountOut,
        disableLh: s.disableLh,
      }))
    );
  return useQuote({
    fromToken,
    toToken,
    fromAmount,
    dexAmountOut,
    disabled: disableLh,
  });
};
