import { isNativeAddress, permit2Address } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Token, useChainConfig } from "..";
import { useMainContext } from "../provider";
import BN from "bignumber.js";
import { useDebounce } from "./useDebounce";
import { useContractCallback } from "./useContractCallback";
import { QUERY_KEYS } from "../config/consts";

const useApproved = (address?: string) => {
  const { account } = useMainContext();
  const getContract = useContractCallback();
  return useCallback(
    async (srcAmount: string) => {
      try {
        if (!account || !address || !srcAmount) {
          return false;
        }
        const fromTokenContract = getContract(address);
        const allowance = await fromTokenContract?.methods
          ?.allowance(account, permit2Address)
          .call();

        return BN(allowance?.toString() || "0").gte(srcAmount);
      } catch (error) {
        console.log({ error }, "approved error");

        return false;
      }
    },
    [account, address, getContract]
  );
};

export const useAllowance = (fromToken?: Token, fromAmount?: string) => {
  const debouncedFromAmount = useDebounce(fromAmount, 200);
  const wToken = useChainConfig()?.wToken;

  const isApproved = useApproved(
    isNativeAddress(fromToken?.address || "") ? wToken?.address : fromToken?.address
  );
  const { account, chainId } = useMainContext();
  return useQuery({
    queryKey: [
      QUERY_KEYS.APPROVE,
      account,
      chainId,
      fromToken?.address,
      fromAmount,
    ],
    queryFn: async () => isApproved(debouncedFromAmount!),
    enabled:
      !!fromToken &&
      !!account &&
      !!chainId &&
      !!debouncedFromAmount &&
      debouncedFromAmount !== "0",
    staleTime: Infinity,
  });
};
