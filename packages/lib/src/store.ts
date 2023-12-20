import { TokenData } from "@defi.org/web3-candies";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WizardStep, WizardStepStatus } from "./types";

interface Store {
  isFailed: boolean;
  failures: number;

  updateLiquidityHubStore: (values: Partial<Store>) => void;
  incrementFailures: () => void;
}

export const useLiquidityHubStore = create<Store>((set) => ({
  isFailed: false,
  failures: 0,
  updateLiquidityHubStore: (values) => set({ ...values }),
  incrementFailures: () =>
    set((state) => {
      const failures = state.failures + 1;
      return {
        failures,
        isFailed: failures > 2,
      };
    }),
}));

interface SwapState {
  fromToken?: TokenData;
  toToken?: TokenData;
  srcAmount?: string;
  dexAmountOut?: string;
  updateState: (state: Partial<SwapState>) => void;
}

export const useSwapStore = create<SwapState>((set) => ({
  fromToken: undefined,
  toToken: undefined,
  srcAmount: undefined,
  dexAmountOut: undefined,
  updateState: (state) => set({ ...state }),
}));

interface WizardStore {
  steps?: WizardStep[];
  currentStep?: WizardStep;
  showWizard: boolean;
  setShowWizard: (showWizard: boolean) => void;
  updateState: (state: Partial<WizardStore>) => void;
  setStep: (step: WizardStep) => void;
  updateStepStatus: (index: number, status: WizardStepStatus) => void;
}

export const useWizardStore = create<WizardStore>((set) => ({
  steps: undefined,
  currentStep: undefined,
  showWizard: false,
  setShowWizard: (showWizard) => set({ showWizard }),
  updateState: (state) => set({ ...state }),
  setStep: (step) => set({ currentStep: step }),
  updateStepStatus: (index, status) =>
    set((state) => {
      const steps = state.steps?.map((step, i) => {
        if (i === index) {
          return {
            ...step,
            status,
          };
        }
        return step;
      });
      return {
        steps,
      };
    }),
}));

interface LHControlStore {
  lhControl: any;
  setLHControl: (lhControl: any) => void;
  liquidityHubEnabled: boolean;
  updateLiquidityHubEnabled: () => void;
}
export const usePersistedStore = create(
  persist<LHControlStore>(
    (set, get) => ({
      lhControl: undefined,
      setLHControl: (lhControl) => set({ lhControl }),
      liquidityHubEnabled: true,
      updateLiquidityHubEnabled: () => set({ liquidityHubEnabled: !get().liquidityHubEnabled }),
    }),
    {
      name: "lhControl",
    }
  )
);
