import { create } from "zustand";
import { SwapState } from "./types";

const initialState = {
  isWon: false,
  isQuoting: false,
  isSwapping: false,
  isFailed: false,
  outAmount: undefined,
  waitingForApproval: false,
  waitingForSignature: false,
};

export const useSwapState = create<SwapState>((set, get) => ({
  ...initialState,
  updateState: (state) => set({ ...get(), ...state }),
}));
