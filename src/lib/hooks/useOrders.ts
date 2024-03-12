import { useLiquidityHubPersistedStore } from "../store/main";
import { useMemo } from "react";
import { useMainContext } from "../provider";

export const useOrders = () => {
  const { account, chainId } = useMainContext();
  const orders = useLiquidityHubPersistedStore((s) => s.orders);
  console.log(orders);
  
  return useMemo(() => {
    if (!account || !chainId || !orders) return;
    console.log(orders?.[account!]?.[chainId!]);
    
    return orders?.[account!]?.[chainId!];
  }, [account, chainId, orders]);
};