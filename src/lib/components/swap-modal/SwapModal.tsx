/* eslint-disable import/no-extraneous-dependencies */

import styled, { CSSObject } from "styled-components";
import { useMemo } from "react";
import { useSwapState } from "lib/store/main";
import { Modal } from "../Modal";
import { useShallow } from "zustand/react/shallow";
import { SwapSuccess } from "./SwapSuccess";
import { SwapFailed } from "./SwapFailed";
import { SwapMain } from "./SwapMain";

export function SwapModal({
  containerStyles = {},
  bodyStyles,
}: {
  containerStyles?: CSSObject;
  bodyStyles?: CSSObject;
}) {
  const { swapStatus, onCloseSwap, showWizard } = useSwapState((store) => ({
    swapStatus: store.swapStatus,
    onCloseSwap: store.onCloseSwap,
    showWizard: store.showWizard,
  }));

  const modalTitle = useMemo(() => {
    if (swapStatus === "success") {
      return "Swap completed";
    }
    if (swapStatus === "failed") {
      return "";
    }
    return "Review swap";
  }, [swapStatus]);

  return (
    <Modal
      title={modalTitle}
      open={showWizard}
      onClose={onCloseSwap}
      containerStyles={{
        maxWidth: "420px",
        background: "black",
        ...containerStyles,
      }}
      bodyStyles={bodyStyles}
    >
      <SwapModalContent />
    </Modal>
  );
}

export const SwapModalContent = () => {
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
        <SwapMain />
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
