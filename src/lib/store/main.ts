
import { ActionStatus, LH_CONTROL, Order, Orders, STEPS, Token } from "../type";
import { create } from "zustand";
import { persist } from "zustand/middleware";


interface SwapStateValues {
  currentStep?: STEPS;
  showWizard?: boolean;
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  isFailed?: boolean;
  failures?: number;
  txHash?: string;
  swapStatus: ActionStatus;
  swapError?: string;
  dexAmountOut?: string;
  disableLh?: boolean;
  setFromAddress?: (address: string) => void;
  dexFallback?: () => void;
}

interface SwapState extends SwapStateValues {
  updateState: (state: Partial<SwapState>) => void;
  onSwapError: (error: string) => void;
  onSwapSuccess: () => void;
  onSwapStart: () => void;
  onCloseSwap: () => void;
}

const initialSwapState: SwapStateValues = {
  currentStep: undefined,
  fromToken: undefined,
  toToken: undefined,
  fromAmount: undefined,
  showWizard: false,
  isFailed: false,
  failures: 0,
  txHash: undefined,
  swapStatus: undefined,
  swapError: undefined,
  setFromAddress: undefined,
  dexFallback: undefined,
  dexAmountOut: undefined,
  disableLh: false,
};

export const useSwapState = create<SwapState>((set, get) => ({
  ...initialSwapState,
  onSwapStart: () => set({ swapStatus: "loading" }),
  updateState: (state) => set({ ...state }),
  onSwapSuccess: () => {
    set({
      isFailed: false,
      failures: 0,
      swapStatus: "success",
    });
  },
  onSwapError: (swapError) =>
    set((s) => {
      const failures = (s.failures || 0) + 1;
      return {
        failures,
        isFailed: failures > 2,
        swapError,
        swapStatus: "failed",
      };
    }),
  onCloseSwap: () => {
    set({
      showWizard: false,
    });

    if (get().swapStatus !== "loading") {
      setTimeout(() => {
        set(initialSwapState);
      }, 200);
    }
  },
}));

interface LHControlStore {
  lhControl?: LH_CONTROL;
  setLHControl: (lhControl?: LH_CONTROL) => void;
  liquidityHubEnabled: boolean;
  updateLiquidityHubEnabled: () => void;
  orders: Orders;
  addOrder: (address: string, chain: number, order: Order) => void;
  password?: string;
  setPassword: (password: string) => void;
}
export const useLiquidityHubPersistedStore = create(
  persist<LHControlStore>(
    (set, get) => ({
      password: undefined,
      setPassword: (password) => set({ password }),
      lhControl: undefined,
      setLHControl: (lhControl) => set({ lhControl }),
      liquidityHubEnabled: true,
      updateLiquidityHubEnabled: () =>
        set({ liquidityHubEnabled: !get().liquidityHubEnabled }),
      orders: {},
      addOrder: (address, chain, order) => {
        const orders = get().orders;
        if (!orders[address]) {
          orders[address] = {};
        }
        if (!orders[address][chain]) {
          orders[address][chain] = [];
        }
        orders[address][chain].push(order);
        set({ orders });
      },
    }),
    {
      name: "liquidity-hub-control",
    }
  )
);
