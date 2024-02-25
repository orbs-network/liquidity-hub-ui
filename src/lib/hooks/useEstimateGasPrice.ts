import { estimateGasPrice } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { useMainContext } from "../provider";

export const useEstimateGasPrice = () => {
  const { web3, chainId } = useMainContext();
  return useQuery({
    queryKey: ["useGasPrice", chainId],
    queryFn: () => {
      return estimateGasPrice(undefined, undefined, web3);
    },
    refetchInterval: 15_000,
    enabled: !!web3,
  });
};
