import { erc20abi, isNativeAddress, iwethabi } from "@defi.org/web3-candies";
import { useCallback } from "react";
import { useMainContext } from "../provider";
import { useChainConfig } from "./useChainConfig";

export const useContractCallback = () => {
  const { web3 } = useMainContext();
  const wethAddress = useChainConfig()?.wToken?.address;

  return useCallback(
    (address?: string) => {
      if (!address || !web3 || !address.startsWith("0x")) return undefined;

      return new web3.eth.Contract(
        isNativeAddress(address) ? iwethabi : erc20abi,
        isNativeAddress(address) ? wethAddress : address
      );
    },
    [web3, wethAddress]
  );
};
