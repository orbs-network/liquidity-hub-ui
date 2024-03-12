import { useSwapState } from "../store/main";
import { STEPS, SubmitTxArgs } from "../type";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { swapAnalytics } from "../analytics";
import { counter, waitForTxReceipt } from "../util";
import { useApiUrl } from "./useApiUrl";

export const useSwapX = () => {
  const { account, chainId, web3 } = useMainContext();
  const updateState = useSwapState((s) => s.updateState);
  const apiUrl =  useApiUrl();
  return useCallback(
    async (args: SubmitTxArgs) => {
      if (
        !account ||
        !web3 ||
        !chainId ||
        !apiUrl ||
        !args.signature ||
        !args.srcAmount ||
        !args.srcToken ||
        !args.destToken
      ) {
        throw new Error("Missing args");
      }

      let txDetails;
      const count = counter();
      swapAnalytics.onSwapRequest();
      updateState({ swapStatus: "loading", currentStep: STEPS.SEND_TX });
      try {
        const response = await fetch(
          `${apiUrl}/swapx?chainId=${chainId}`,
          {
            method: "POST",
            body: JSON.stringify({
              inToken: args.srcToken,
              outToken: args.destToken,
              inAmount: args.srcAmount,
              user: account,
              signature: args.signature,
              ...args.quote,
            }),
          }
        );
        const swap = await response.json();
        if (!swap) {
          throw new Error("Missing swap response");
        }
        if (swap.error) {
          throw new Error(swap.error);
        }
        if (!swap.txHash) {
          throw new Error("Missing txHash");
        }
        swapAnalytics.onSwapSuccess(swap.txHash, count());
        txDetails = await waitForTxReceipt(web3, swap.txHash);
        if (txDetails?.mined) {
          swapAnalytics.onClobOnChainSwapSuccess();
          updateState({
            swapStatus: "success",
            txHash: swap.txHash,
          });
          return swap.txHash as string;
        } else {
          throw new Error(txDetails?.revertMessage);
        }
      } catch (error: any) {
        const msg = error.message.error || error.message;
        swapAnalytics.onSwapFailed(msg, count(), !!txDetails?.revertMessage);
        throw new Error(msg);
      }
    },
    [web3, account, chainId, updateState]
  );
};
