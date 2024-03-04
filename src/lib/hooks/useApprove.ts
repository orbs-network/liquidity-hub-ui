import { useSwapState } from "../store/main";
import { STEPS } from "../type";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { useContractCallback } from "./useContractCallback";
import { liquidityHub } from "../liquidityHub";
import { useShallow } from "zustand/react/shallow";

export const useApprove = () => {
  const { account } = useMainContext();
  const getContract = useContractCallback();
  const updateState = useSwapState(useShallow((s) => s.updateState));
  return useCallback(
    async (fromToken?: string, fromAmount?: string) => {
      try {
        const fromTokenContract = getContract(fromToken);
        if (!fromAmount || !fromToken || !fromTokenContract || !account) {
          throw new Error("missing args");
        }
        updateState({ swapStatus: "loading", currentStep: STEPS.APPROVE });

        const res = await liquidityHub.approve({
          fromAmount,
          fromToken,
          fromTokenContract,
          account,
        });
        updateState({ swapStatus: "success" });
        return res;
      } catch (error) {
        throw error;
      }
    },
    [account, updateState, getContract]
  );
};
