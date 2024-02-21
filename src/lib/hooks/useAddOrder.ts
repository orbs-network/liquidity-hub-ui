import { useLiquidityHubPersistedStore } from "../store/main";
import { Order } from "../type";
import { useCallback } from "react";
import { useMainContext } from "../provider";


export const useAddOrder = () => {
  const addOrder = useLiquidityHubPersistedStore((s) => s.addOrder);
  const { account, chainId } = useMainContext();
  return useCallback(
    (order: Order) => {
      if (!account || !chainId) return;
      addOrder(account, chainId, order);
    },
    [addOrder, account, chainId]
  );
};
