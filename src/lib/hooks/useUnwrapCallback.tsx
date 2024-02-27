import { sendAndWaitForConfirmations, zeroAddress } from "@defi.org/web3-candies";
import { useSwapState } from "../store/main";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { useContractCallback } from "./useContractCallback";
import { useShallow } from "zustand/react/shallow";
import { useEstimateGasPrice } from "./useEstimateGasPrice";
import BN from 'bignumber.js'
export const useUnwrapCallback = () => {
  const { account } = useMainContext();
  const updateState = useSwapState(useShallow((s) => s.updateState));
  const gas = useEstimateGasPrice().data;

  const getContract = useContractCallback();
  return useCallback(
    async (srcAmount: string) => {
      if (!account) {
        throw new Error("Missing account");
      }
   
      const fromTokenContract = getContract(zeroAddress);
      if (!fromTokenContract) {
        throw new Error("Missing from token contract");
      }      
      try {
        const tx = fromTokenContract.methods.withdraw(new BN(srcAmount).toFixed(0));
        await sendAndWaitForConfirmations(tx, {
          from: account,
          maxFeePerGas: gas?.maxFeePerGas,
          maxPriorityFeePerGas: gas?.priorityFeePerGas,
        });
        return true;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [account, updateState, getContract, gas]
  );
};
