import {
  zeroAddress,
} from "@defi.org/web3-candies";
import { useSwapState } from "../store/main";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { useContractCallback } from "./useContractCallback";
import { useShallow } from "zustand/react/shallow";
import { useEstimateGasPrice } from "./useEstimateGasPrice";
import { liquidityHub } from "../liquidityHub";
export const useUnwrap = () => {
  const { account } = useMainContext();
  const updateState = useSwapState(useShallow((s) => s.updateState));
  const gas = useEstimateGasPrice().data;

  const getContract = useContractCallback();
  return useCallback(
    async (fromAmount: string) => {
      try {
        const fromTokenContract = getContract(zeroAddress);

        if (!account || !fromTokenContract) {
          throw new Error("Missing account");
        }

        const res = await liquidityHub.unwrap({
          fromTokenContract,
          account,
          fromAmount,
          maxFeePerGas: gas?.maxFeePerGas.toString(),
          priorityFeePerGas: gas?.priorityFeePerGas.toString(),
        });
        return res;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [account, updateState, getContract, gas]
  );
};
