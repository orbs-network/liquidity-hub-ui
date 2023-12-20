/* eslint-disable import/no-extraneous-dependencies */
import { hasWeb3Instance, setWeb3Instance, signEIP712, zeroAddress } from "@defi.org/web3-candies";
const API_ENDPOINT = "https://hub.orbs.network";
export const ORBS_WEBSITE = "https://www.orbs.com";
import BN from "bignumber.js";

import Web3 from "web3";
import { QuoteArgs, QuoteResponse, SubmitTxArgs, WizardStep } from "./types";
import { analytics } from "./analytics";
import { amountBN, isNative, waitForTx } from "./utils";
import { useCallback, useEffect, useState } from "react";
import { useLiquidityHubStore, usePersistedStore, useSwapStore, useWizardStore } from "./store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLHContext } from "./providers";
import { wizardSteps } from "./steps";

const quote = async (args: QuoteArgs) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/quote?chainId=${args.chainId}`, {
      method: "POST",
      body: JSON.stringify({
        inToken: isNative(args.inToken) ? zeroAddress : args.inToken,
        outToken: isNative(args.outToken) ? zeroAddress : args.outToken,
        inAmount: args.inAmount,
        outAmount: !args.dexAmountOut ? "-1" : new BN(args.dexAmountOut).gt(0) ? args.dexAmountOut : "0",
        user: args.account,
        slippage: args.slippage,
        qs: encodeURIComponent(window.location.hash),
        partner: args.partner.toLowerCase(),
      }),
      signal: args.signal,
    });
    const result = await response.json();
    if (!result) {
      throw new Error("No result");
    }
    if (result.error === "tns") {
      return {
        outAmount: "0",
      } as QuoteResponse;
    }

    if (!result.outAmount || new BN(result.outAmount).eq(0)) {
      throw new Error("No liquidity");
    }

    return result as QuoteResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const useApprove = () => {
  const { lib } = useLHContext();
  const { fromToken, srcAmount } = useSwapStore();
  return async () => {
    try {
      // onSetLiquidityHubState({ waitingForApproval: true });
      // liquidityHubAnalytics.onApprovalRequest();
      if (!lib || !fromToken || !srcAmount) {
        throw new Error("Missing data");
      }

      const res = await lib?.approve(fromToken, amountBN(fromToken, srcAmount).toString());
      // liquidityHubAnalytics.onApprovalSuccess(count());
      return res;
    } catch (error: any) {
      // liquidityHubAnalytics.onApprovalFailed(error.message, count());
      throw new Error(error.message);
    } finally {
      // onSetLiquidityHubState({ waitingForApproval: false });
    }
  };
};

const useSign = () => {
  const { account, provider } = useLHContext();
  return async (permitData: any) => {
    try {
      if (!account || !provider) {
        throw new Error("No account or library");
      }
      // onSetLiquidityHubState({ waitingForSignature: true });
      // liquidityHubAnalytics.onSignatureRequest();
      if (!hasWeb3Instance()) {
        setWeb3Instance(new Web3(provider));
      }
      process.env.DEBUG = "web3-candies";
      const signature = await signEIP712(account, permitData);
      // liquidityHubAnalytics.onSignatureSuccess(signature, count());
      return signature;
    } catch (error: any) {
      // liquidityHubAnalytics.onSignatureFailed(error.message, count());
      throw new Error(error.message);
    } finally {
      // onSetLiquidityHubState({ waitingForSignature: false });
    }
  };
};

const useApproved = () => {
  const { account, lib } = useLHContext();
  const { srcAmount, fromToken } = useSwapStore();
  return useCallback(async () => {
    try {
      if (!account || !lib || !fromToken || !srcAmount) {
        return false;
      }

      const srcAmountBN = amountBN(fromToken, srcAmount);
      return lib?.hasAllowance(fromToken, srcAmountBN.toString());
    } catch (error) {
      return false;
    }
  }, [srcAmount, lib, account, fromToken?.address]);
};

const useSubmitTx = () => {
  const { provider, account, chainId } = useLHContext();

  return useCallback(
    async (args: SubmitTxArgs) => {
      // const count = counter();
      try {
        // liquidityHubAnalytics.onSwapRequest();
        const txHashResponse = await fetch(`${API_ENDPOINT}/swapx?chainId=${chainId}`, {
          method: "POST",
          body: JSON.stringify({
            inToken: args.srcToken,
            outToken: args.destToken,
            inAmount: args.srcAmount,
            user: account,
            signature: args.signature,
            ...args.quote,
          }),
        });
        const swap = await txHashResponse.json();
        if (!swap) {
          throw new Error("Missing swap response");
        }

        if (swap.error || (swap.message && !swap.txHash)) {
          throw new Error(swap);
        }

        if (!swap.txHash) {
          throw new Error("Missing txHash");
        }
        const tx = await waitForTx(swap.txHash, provider);
        // liquidityHubAnalytics.onSwapSuccess(swap.txHash, count());
        return tx;
      } catch (error) {
        const message = JSON.stringify(error);
        // liquidityHubAnalytics.onSwapFailed(message, count());
        throw new Error(message);
      }
    },
    [provider, account, chainId]
  );
};

const useInitSwap = () => {
  const { fromToken } = useSwapStore();
  const { updateState: updateWizardState } = useWizardStore();

  return useCallback(() => {
    const shouldWrap = isNative(fromToken?.address);

    const steps: WizardStep[] = [wizardSteps.approve, wizardSteps.sign, wizardSteps.sendTx];
    if (shouldWrap) {
      steps.splice(1, 0, wizardSteps.wrap);
    }

    console.log({ steps });

    updateWizardState({ steps });
  }, [fromToken?.address]);
};

export const useSwap = () => {
  // const txUpdater = useTransactionUpdater();
  const wrap = useWrap();
  const isApproved = useApproved();
  const approve = useApprove();
  const sign = useSign();
  const submitTx = useSubmitTx();
  const { incrementFailures } = useLiquidityHubStore();
  const { fromToken, toToken, srcAmount } = useSwapStore();
  const { lib } = useLHContext();
  const initSwap = useInitSwap();

  const { data: quote } = useQuote();

  return useMutation({
    mutationFn: async ({ dexAmountOut, dexSwap }: { dexAmountOut?: string; dexSwap: () => void }) => {
      if (!fromToken || !toToken || !srcAmount || !lib || !quote || !dexAmountOut) {
        throw new Error("Missing from or to token");
      }
      const isDexTrade = new BN(dexAmountOut).gt(new BN(quote.outAmount || "0"));
      if (isDexTrade) {
        return dexSwap();
        return;
      }
      const isNativeIn = isNative(fromToken.address);
      const isNativeOut = isNative(toToken.address);
      initSwap();
      let inTokenAddress = isNativeIn ? zeroAddress : fromToken.address;
      const outTokenAddress = isNativeOut ? zeroAddress : toToken.address;

      // txUpdater.init({
      //   fromAsset,
      //   toAsset,
      //   fromAmount,
      //   showldWrap: isNativeIn,
      //   toAmount: amountUi(toAsset, new BN(quote?.outAmount)),
      // });
      const inAmountBN = amountBN(fromToken, srcAmount).toString();

      if (isNativeIn) {
        await wrap();
        inTokenAddress = lib?.config.wToken.address;
      }
      // txUpdater.updateApprove(TRANSACTION_STATUS.PENDING);
      const approved = await isApproved();
      analytics.onApprovedBeforeTheTrade(approved);
      if (!approved) {
        await approve();
      } else {
        // txUpdater.updateApprove(TRANSACTION_STATUS.SUCCESS);
      }

      const signature = await sign(quote.permitData);
      const tx = await submitTx({
        srcToken: inTokenAddress,
        destToken: outTokenAddress,
        srcAmount: inAmountBN,
        signature,
        quote,
      });
      // txUpdater.complete();
      return tx;
    },
    onError: () => {
      incrementFailures();
      analytics.onClobFailure();
    },
  });
};

const useWrap = () => {
  const { lib, account } = useLHContext();
  const { fromToken, srcAmount } = useSwapStore();

  return useCallback(async () => {
    try {
      // updateWrap({ status: TRANSACTION_STATUS.PENDING });
      if (!lib || !fromToken || !srcAmount) return;

      await lib?.wrapNativeToken(amountBN(fromToken, srcAmount).toString(), account);
      // setFromAddress(WBNB_ADDRESS);
      // updateWrap({ status: TRANSACTION_STATUS.SUCCESS });
      // analytics.onWrapSuccess(txHash, count());
      return true;
    } catch (error) {
      // updateWrap({ status: TRANSACTION_STATUS.FAILED });
      // analytics.onWrapFailed(error.message, count());
      // throw new Error(error.message);
    }
  }, [fromToken?.address, srcAmount, account, lib]);
};

export const useQuote = () => {
  const { liquidityHubEnabled } = usePersistedStore();
  const isFailed = useLiquidityHubStore();
  const { account, slippage, chainId, partner } = useLHContext();
  const { fromToken, toToken, srcAmount, dexAmountOut } = useSwapStore();
  const [error, setError] = useState(false);

  const fromAddress = fromToken?.address || "";
  const toAddress = toToken?.address || "";
  const query = useQuery({
    queryKey: ["useLHQuoteQuery", fromAddress, toAddress, srcAmount, slippage, account],
    queryFn: async ({ signal }) => {
      return quote({
        inToken: fromAddress,
        outToken: toAddress,
        inAmount: amountBN(fromToken!, srcAmount!).toString(),
        dexAmountOut,
        slippage,
        account,
        signal,
        chainId: chainId!,
        partner,
      });
    },
    refetchInterval: 10_000,
    enabled: !!partner && !!chainId && !!account && !fromAddress && !!toAddress && !!srcAmount && !isFailed && liquidityHubEnabled,
    gcTime: 0,
    retry: 2,
    initialData: isFailed || !liquidityHubEnabled ? ({ outAmount: "" } as QuoteResponse) : null,
  });

  useEffect(() => {
    if (query.isError) {
      setError(true);
    }
  }, [query.isError]);

  useEffect(() => {
    return () => {
      setError(false);
    };
  }, [fromAddress, toAddress, srcAmount, slippage, account]);

  return { ...query, isLoading: error ? false : query.isLoading };
};
