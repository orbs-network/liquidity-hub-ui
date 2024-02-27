import styled, { CSSObject } from "styled-components";
import { StepComponent } from "./Step";
import { SwapDetails } from "./Details";
import { useSteps } from "../../hooks/useSteps";
import { FlexColumn } from "../../base-styles";
import { useSwapState } from "../../store/main";
import { useShallow } from "zustand/react/shallow";

export const SwapMain = ({ style = {} }: { style?: CSSObject }) => {
  return (
    <Container style={style}>
      <SwapDetails />
      <StepsComponent />
    </Container>
  );
};

const StepsComponent = () => {
  const { steps } = useSteps();
  const swapStatus = useSwapState(useShallow((it) => it.swapStatus));

  if (swapStatus !== "loading") return null;

  return (
    <>
      <StyledSteps
        $gap={15}
        style={{ width: "100%" }}
        className="lh-swap-modal-steps"
      >
        <Divider className="lh-swap-modal-steps-divider" />
        {steps.map((step) => {
          return <StepComponent key={step.id} step={step} />;
        })}
      </StyledSteps>
    </>
  );
};

const Container = styled(FlexColumn)`
  width: 100%;
`;

const Divider = styled.div`
  width: 2.5px;
  height: calc(100% - 50px);
  background-color: black;
  left: 12px;
  position: absolute;
  top: 40px;
`;

const StyledSteps = styled(FlexColumn)`
  margin-top: 35px;
  border-top: 1px solid ${(props) => props.theme.colors.divider};
  padding-top: 25px;
  position: relative;
  background-color: ${(props) => props.theme.colors.onyx};
`;
