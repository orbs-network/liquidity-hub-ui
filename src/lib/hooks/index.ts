import { useMainContext } from "../provider";

export * from "./useIsInvalidChain";
export * from "./useSwitchNetwork";
export * from "./useLiquidityHub";
export * from "./useChainConfig";
export * from "./useFormatNumber";
export * from "./useContractCallback";
export * from "./useSwapConfirmation";
export * from "./useSubmitSwapButton";

export const useWeb3 = () => {
  return useMainContext().web3;
};

export const useChainId = () => {
    return useMainContext().chainId;
}

export const useAccount = () => {
    return useMainContext().account;
}

export const usePartnerChainId = () => {
    return useMainContext().partnerChainId;
}

export const useSlippage= () => {
    return useMainContext().slippage;
}