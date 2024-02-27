import { useLiquidityHubPersistedStore } from "../store/main";
import { useMemo } from "react";
import { useMainContext } from "../provider";
import { useShallow } from "zustand/react/shallow";

export const useOrders = () => {
  const { account, chainId } = useMainContext();
  const orders = useLiquidityHubPersistedStore(useShallow((s) => s.orders));
  return useMemo(() => {
    if (!account || !chainId || !orders) return;
    return orders?.[account!]?.[chainId!];
  }, [account, chainId, orders]);
};