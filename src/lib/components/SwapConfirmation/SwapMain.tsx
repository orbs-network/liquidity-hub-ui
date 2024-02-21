import styled, { CSSObject } from "styled-components";
import { StepComponent } from "./Step";
import { SwapDetails } from "./Details";
import { useSteps } from "../../hooks/useSteps";
import { PoweredByOrbs } from "../PoweredByOrbs";
import { FlexColumn } from "../../base-styles";
import { SkeletonLoader } from "../SkeletonLoader";
import { Button } from "../Button";
import { useSubmitSwapButton } from "../../hooks/useSubmitSwapButton";

export const SwapMain = ({
  style = {},
  fromTokenUsd,
  toTokenUsd,
  onSuccessDexCallback,
}: {
  style?: CSSObject;
  fromTokenUsd: string | number;
  toTokenUsd: string | number;
  onSuccessDexCallback: () => void;
}) => {
  return (
    <Container style={style}>
      <SwapDetails fromTokenUsd={fromTokenUsd} toTokenUsd={toTokenUsd} />
      <StepsComponent
        onSuccessDexCallback={onSuccessDexCallback}
        fromTokenUsd={fromTokenUsd}
        toTokenUsd={toTokenUsd}
      />
      <PoweredByOrbs />
    </Container>
  );
};

const StepsComponent = ({
  fromTokenUsd,
  toTokenUsd,
  onSuccessDexCallback,
}: {
  fromTokenUsd: string | number;
  toTokenUsd: string | number;
  onSuccessDexCallback: () => void;
}) => {
  const { steps, isLoading: stepsLoading } = useSteps();
  const { text, onClick, isPending } = useSubmitSwapButton({
    fromTokenUsd,
    toTokenUsd,
    onSuccessDexCallback,
  });

  if (stepsLoading) {
    return (
      <StyledLoader>
        <StyledSkeleton />
        <StyledSkeleton />
      </StyledLoader>
    );
  }

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
      <SubmitButton text={text} onClick={onClick} isPending={isPending} />
    </>
  );
};

const StyledLoader = styled(FlexColumn)`
  width: 100%;
`;

const StyledSkeleton = styled(SkeletonLoader)``;

const SubmitButton = ({
  text,
  isPending,
  onClick,
}: {
  text: string;
  onClick: () => void;
  isPending: boolean;
}) => {
  if (isPending) return null;
  return (
    <StyledSubmit onClick={onClick} className="lh-swap-modal">
      {text}
    </StyledSubmit>
  );
};

const Container = styled(FlexColumn)`
  width: 100%;
`;

const StyledSubmit = styled(Button)`
  width: 100%;
  margin-top: 20px;
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
