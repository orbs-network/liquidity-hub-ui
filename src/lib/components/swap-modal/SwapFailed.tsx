import { FlexColumn, FlexRow } from "lib/base-styles";
import { useSwapState } from "lib/store/main";
import { AlertCircle } from "react-feather";
import styled from "styled-components";
import { Text } from "../Text";


export const SwapFailed = () => {
  const swapError = useSwapState((s) => s.swapError);
  return (
    <Container className="lh-swap-modal-failed">
      <MainLogo className="lh-swap-modal-failed-img">
        <AlertCircle />
      </MainLogo>
      <Title className="lh-swap-modal-failed-title">Swap failed</Title>
      <ErrorText className="lh-swap-modal-failed-text">{swapError}</ErrorText>
    </Container>
  );
};

const ErrorText = styled(Text)`
  opacity: 0.6;
  font-size: 16px;
`

const Title = styled(Text)`
  font-size: 20px;
  font-weight: 500;
`;


const Container = styled(FlexColumn)`
  width: 100%;
  align-items: center;
  gap: 20px;
`;

const MainLogo = styled(FlexRow)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #ff3333;
  align-items: center;
  justify-content: center;
  svg {
    width: 60%;
    height: 60%;
    color: white;
  }
`;
