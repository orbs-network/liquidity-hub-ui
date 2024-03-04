import { useSwapState } from "../store/main";
import { STEPS, Token } from "../type";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { useContractCallback } from "./useContractCallback";
import { useShallow } from "zustand/react/shallow";
import { useEstimateGasPrice } from "./useEstimateGasPrice";
import { liquidityHub } from "../liquidityHub";

export const useWrap = (fromToken?: Token) => {
  const { account } = useMainContext();
  const updateState = useSwapState(useShallow((s) => s.updateState));
  const gas = useEstimateGasPrice().data;

  const getContract = useContractCallback();
  return useCallback(
    async (fromAmount: string) => {
      const fromTokenContract = getContract(fromToken?.address);

      if (!account || !fromToken || !fromTokenContract) {
        throw new Error("Missing args");
      }

      updateState({ swapStatus: "loading", currentStep: STEPS.WRAP });
      try {
        const res = await liquidityHub.wrap({
          account,
          fromAmount,
          fromTokenContract,
        });
        updateState({ swapStatus: "success" });
        return res;
      } catch (error) {
        throw error
      }
    },
    [account, updateState, getContract, fromToken, gas]
  );
};
