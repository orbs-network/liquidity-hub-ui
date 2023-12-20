import { WizardStep, WizardStepStatus } from "./types";
import { Wizard } from "./ui/Wizard";

const approve: WizardStep = {
  title: "Approve",
  content: Wizard.ApproveStep,
  status: WizardStepStatus.PENDING,
};

const wrap: WizardStep = {
  title: "Wrap",
  content: Wizard.WrapStep,
  status: WizardStepStatus.PENDING,
};

const sign: WizardStep = {
  title: "Sign",
  content: Wizard.SignStep,
  status: WizardStepStatus.PENDING,
};

const sendTx: WizardStep = {
  title: "send Tx",
  content: Wizard.SendTx,
  status: WizardStepStatus.PENDING,
};

export const wizardSteps = {
  approve,
  wrap,
  sign,
  sendTx,
};
