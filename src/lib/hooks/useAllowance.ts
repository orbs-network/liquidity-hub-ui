import { isNativeAddress } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Token, useChainConfig } from "..";
import { useMainContext } from "../provider";
import { useDebounce } from "./useDebounce";
import { useContractCallback } from "./useContractCallback";
import { QUERY_KEYS } from "../config/consts";
import { liquidityHub } from "../liquidityHub";

const useApproved = (address?: string) => {
  const { account } = useMainContext();
  const getContract = useContractCallback();
  return useCallback(
    async (fromAmount: string) => {
      try {
        const fromTokenContract = getContract(address);
        if (!account || !address || !fromAmount || !fromTokenContract) {
          return;
        }

        const res = await liquidityHub.isApproved({
          account,
          fromAmount,
          fromTokenContract,
        });
        return res;
      } catch (error) {
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
    isNativeAddress(fromToken?.address || "")
      ? wToken?.address
      : fromToken?.address
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
