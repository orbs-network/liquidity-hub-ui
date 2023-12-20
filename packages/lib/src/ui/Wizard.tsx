/* eslint-disable import/no-extraneous-dependencies */
import React from "react";
import Popup from "reactjs-popup";
import { useWizardStore } from "../store";

export function Wizard() {
  const { currentStep, showWizard } = useWizardStore();
  return (
    <Popup open={showWizard} position="right center">
      <div>Popup content here !!{currentStep?.title}</div>
    </Popup>
  );
}

const ApproveStep = () => {
  return <div>Approve</div>;
};

const WrapStep = () => {
  return <div>wrap</div>;
};

const SignStep = () => {
  return <div>sign</div>;
};

const SendTx = () => {
  return <div>send tx</div>;
};

Wizard.ApproveStep = ApproveStep;
Wizard.WrapStep = WrapStep;
Wizard.SignStep = SignStep;
Wizard.SendTx = SendTx;
