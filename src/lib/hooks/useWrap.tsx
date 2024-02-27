import { sendAndWaitForConfirmations } from "@defi.org/web3-candies";
import { useSwapState } from "../store/main";
import { STEPS, Token } from "../type";
import { counter } from "../util";
import { useCallback } from "react";
import { swapAnalytics } from "../analytics";
import { useMainContext } from "../provider";
import { useContractCallback } from "./useContractCallback";
import { useShallow } from "zustand/react/shallow";
import { useEstimateGasPrice } from "./useEstimateGasPrice";

export const useWrap = (fromToken?: Token) => {
  const { account } = useMainContext();
  const updateState = useSwapState(useShallow((s) => s.updateState));
   const gas = useEstimateGasPrice().data;

  const getContract = useContractCallback();
  return useCallback(
    async (srcAmount: string) => {
      const count = counter();
      swapAnalytics.onWrapRequest();

      if (!account) {
        throw new Error("Missing account");
      }
      if (!fromToken) {
        throw new Error("Missing from token");
      }
      const fromTokenContract = getContract(fromToken?.address);
      if (!fromTokenContract) {
        throw new Error("Missing from token contract");
      }
      updateState({ swapStatus: "loading", currentStep: STEPS.WRAP });
      try {
        if (!fromToken || !srcAmount) return;

        const tx =  fromTokenContract.methods.deposit()
        await sendAndWaitForConfirmations(tx, {
          from: account,
          value: srcAmount,
          maxFeePerGas: gas?.maxFeePerGas,
          maxPriorityFeePerGas: gas?.priorityFeePerGas
        });

        swapAnalytics.onWrapSuccess(count());
        updateState({ swapStatus: "success" });

        return true;
      } catch (error: any) {
        swapAnalytics.onWrapFailed(error.message, count());
        throw new Error(error.message);
      }
    },
    [account, updateState, getContract, fromToken, gas]
  );
};
