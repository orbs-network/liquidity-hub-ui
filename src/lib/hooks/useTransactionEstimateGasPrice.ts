import { useMemo } from "react";
import { amountUi } from "../util";
import { useChainConfig } from "./useChainConfig";
import { useEstimateGasPrice } from "./useEstimateGasPrice";
import BN from "bignumber.js";

export const useTransactionEstimateGasPrice = (
  nativeTokenPrice?: string | number
) => {
  const { data: gasPrice } = useEstimateGasPrice();

  const nativeTokenDecimals = useChainConfig()?.native.decimals;

  const price = gasPrice?.med.max;

  return useMemo(() => {
    if (!price || !nativeTokenPrice) return "0";
    const value = amountUi(nativeTokenDecimals, price.multipliedBy(750_000));
    return BN(nativeTokenPrice).multipliedBy(value).toString();
  }, [price, nativeTokenDecimals, nativeTokenPrice]);
};
