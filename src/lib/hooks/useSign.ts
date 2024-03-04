import { useSwapState } from "../store/main";
import { STEPS } from "../type";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { liquidityHub } from "../liquidityHub";
import { ERRORS } from "../config/consts";

export const useSign = () => {
  const { account, web3 } = useMainContext();
  const updateState = useSwapState((s) => s.updateState);

  return useCallback(
    async (permitData: any) => {
      let priceOutDated = false;
      updateState({ swapStatus: "loading", currentStep: STEPS.SIGN });

      try {
        if (!account || !web3) {
          throw new Error("No account or web3");
        }
        const signature = await liquidityHub.sign({
          web3,
          account,
          permitData,
        });

        if (priceOutDated) {
          throw new Error(ERRORS.PRICE_OUTDATED);
        }
        updateState({ swapStatus: "success" });
        return signature;
      } catch (error) {
        throw error;
      }
    },
    [updateState, account, web3]
  );
};
