import styled from "styled-components";
import { useSwapState } from "../../store/main";
import { useShallow } from "zustand/react/shallow";
import { SwapSuccess } from "./SwapSuccess";
import { SwapFailed } from "./SwapFailed";
import { SwapMain } from "./SwapMain";


export const SwapConfirmation = ({
  fromTokenUsd,
  toTokenUsd,
  onSuceess,
}: {
  fromTokenUsd: string | number;
  toTokenUsd: string | number;
  onSuceess?: () => any;
}) => {
  const { swapStatus } = useSwapState(
    useShallow((store) => ({
      swapStatus: store.swapStatus,
    }))
  );

  return (
    <Container className="lh-swap-modal-summary">
      {swapStatus === "success" ? (
        <SwapSuccess />
      ) : swapStatus === "failed" ? (
        <SwapFailed />
      ) : (
        <SwapMain
          onSuccessDexCallback={onSuceess || (() => {})}
          fromTokenUsd={fromTokenUsd}
          toTokenUsd={toTokenUsd}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  * {
    box-sizing: border-box;
  }
`;