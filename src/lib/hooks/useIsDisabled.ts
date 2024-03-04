import { useShallow } from "zustand/react/shallow";
import { useMainContext } from "../provider";
import { useSwapState } from "../store/main";
import { useIsInvalidChain } from "./useIsInvalidChain";

export function useIsDisabled() {
  const maxFailures = useMainContext().maxFailures;
  const invalidChain = useIsInvalidChain();
  const { failures } = useSwapState(
    useShallow((s) => ({
      failures: s.failures,
    }))
  );

  const failed = (failures || 0) > (maxFailures || 0);

  return failed || invalidChain;
}
