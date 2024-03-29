import { useMemo } from "react";
import styled from "styled-components";
import { Check, X } from "react-feather";
import { ActionStatus, Step } from "../../type";
import { useSwapState } from "../../store/main";
import { FlexColumn, FlexRow } from "../../base-styles";
import { Spinner } from "../Spinner";
import _ from "lodash";

interface Props {
  step: Step;
}

export function StepComponent({ step }: Props) {
  const { currentStep, swapStatus } = useSwapState((store) => ({
    currentStep: store.currentStep,
    swapStatus: store.swapStatus,
  }));


  const status = useMemo((): ActionStatus => {
    if (_.isUndefined(currentStep) ) return;
    if (step.id < currentStep) {
      return "success";
    }
    if (step.id > currentStep) {
      return undefined
    }
    return swapStatus; 
  }, [swapStatus, currentStep, step.id]);

  const selected = step.id === currentStep;
  return (
    <StyledStep className="lh-swap-modal-step">
      <StyledStepLogo $selected={selected} className="lh-swap-modal-step-logo">
        <img src={step.image} />
      </StyledStepLogo>
      <FlexColumn $gap={5}>
        <StyledStepTitle
          $selected={selected}
          className="lh-swap-modal-step-title"
        >
          {status === "loading" ? step.loadingTitle : step.title}
        </StyledStepTitle>
        {step.link && (
          <StyledStepLink
            className="lh-swap-modal-step-link"
            href={step.link.href}
            target="_blank"
            $selected={selected}
          >
            {step.link.text}
          </StyledStepLink>
        )}
      </FlexColumn>

      <StepStatus status={status} />
    </StyledStep>
  );
}

const StyledStep = styled(FlexRow)`
  min-height: 40px;
  width: 100%;
  gap: 16px;
`;


const StyledStepLogo = styled.div<{ $selected: boolean }>`
  width: 26px;
  height: 26px;
  position: relative;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: relative;
    z-index: 1;
    opacity: ${({ $selected }) => ($selected ? 1 : 0.5)};
  }
  &:after {
    content: "";
    position: absolute;
    width: calc(100% + 15px);
    height: calc(100% + 15px);
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.mainBackground};
  }
  &:before {
    content: "";
    position: absolute;
    width: calc(100% + 13px);
    height: calc(100% + 13px);
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    border-radius: 50%;
    border: 1px solid
      ${({ $selected }) => ($selected ? "rgba(0,0,0, 0.1)" : "transparent")};
    z-index: 1;
  }
`;

const StyledStepTitle = styled.p<{ $selected: boolean }>`
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.textMain : theme.colors.textSecondary};
`;
const StyledStepLink = styled('a')<{ $selected: boolean }>`
 
`;

const StepStatus = ({ status }: { status: ActionStatus }) => {
  const element = useMemo(() => {
      if (status === "loading") {
        return <Spinner size={20} borderWidth={2} />
      }

      if (status === "success") {
        return <Check size={20} />;
      }

      if (status === "failed") {
        return <X size={20} />;
      }
  }, [status]);


  return <StyledStatus>{element}</StyledStatus>;
};




const StyledStatus = styled.div`
  margin-left: auto;
  color: ${({ theme }) => theme.colors.textMain};
  * {
    color: ${({ theme }) => theme.colors.textMain};
  }
`


