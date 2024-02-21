import BN from "bignumber.js";
import { useLiquidityHubPersistedStore, useSwapState } from "../store/main";
import { LH_CONTROL, TradeOwner } from "../type";
import { useMemo } from "react";
export const useTradeOwner = (
  lhOutAmount?: string,
  dexOutAmount?: string,
  disabled?: boolean
): TradeOwner | undefined => {
  const isFailed = useSwapState((s) => s.isFailed);
  const { liquidityHubEnabled, lhControl } = useLiquidityHubPersistedStore(
    (s) => ({
      liquidityHubEnabled: s.liquidityHubEnabled,
      lhControl: s.lhControl,
    })
  );
  return useMemo(() => {
    if (disabled) return "dex";
    if (new BN(dexOutAmount || "0").lte(0) && new BN(lhOutAmount || "0").lte(0))
      return;

    if (lhControl === LH_CONTROL.SKIP || !liquidityHubEnabled) {
      return "dex";
    }
    if (lhControl === LH_CONTROL.FORCE) {
      console.log("LH force mode on");
      return "lh";
    }
    if (isFailed) {
      return "dex";
    }

    return new BN(lhOutAmount || "0").gt(new BN(dexOutAmount || "0"))
      ? "lh"
      : "dex";
  }, [
    dexOutAmount,
    lhOutAmount,
    lhControl,
    isFailed,
    liquidityHubEnabled,
    disabled,
  ]);
};
