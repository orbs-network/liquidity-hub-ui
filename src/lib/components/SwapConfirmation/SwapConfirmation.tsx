import styled from "styled-components";
import { useSwapState } from "../../store/main";
import { useShallow } from "zustand/react/shallow";
import { SwapSuccess } from "./SwapSuccess";
import { SwapFailed } from "./SwapFailed";
import { SwapMain } from "./SwapMain";


export const SwapConfirmation = () => {
  const { swapStatus } = useSwapState(
    useShallow((s) => ({
      swapStatus: s.swapStatus,
      fromTokenUsd: s.fromTokenUsd,
      toTokenUsd: s.toTokenUsd
    }))
  );

  return (
    <Container className="lh-swap-modal-summary">
      {swapStatus === "success" ? (
        <SwapSuccess />
      ) : swapStatus === "failed" ? (
        <SwapFailed />
      ) : (
        <SwapMain  />
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
