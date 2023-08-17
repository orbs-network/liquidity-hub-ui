import { bn } from "@defi.org/web3-candies";
import { useEffect } from "react";
import { AnalyticsData, AnalyticsState } from "./types";

class Analytics {
  history: AnalyticsState[] = [];
  initialTimestamp = Date.now();
  data = { _id: crypto.randomUUID() } as AnalyticsData;

  private update({ newState, values = {} }: { newState: string; values?: Partial<AnalyticsData> }) {
    if (this.data.state) {
      this.history.push(this.data.state);
    }

    this.data.state = {
      state: newState,
      time: Date.now() - this.initialTimestamp,
    };
    this.data = { ...this.data, ...values };

    fetch("https://bi.orbs.network/putes/clob-ui", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...this.data, history: this.history }),
    }).catch();
  }

  onWalletConnected(walletAddress?: string) {
    this.update({
      newState: "walletConnected",
      values: { walletAddress },
    });
  }

  onSrcToken(srcTokenAddress: string, srcTokenSymbol: string) {
    this.update({
      newState: "srcToken",
      values: { srcTokenAddress, srcTokenSymbol },
    });
  }

  onDstToken(dstTokenAddress: string, dstTokenSymbol: string) {
    this.update({
      newState: "dstToken",
      values: { dstTokenAddress, dstTokenSymbol },
    });
  }

  onDisabled() {
    this.update({
      newState: "clobDisabled",
    });
  }

  onSrcAmount(srcAmount: string) {
    this.update({
      newState: "srcAmount",
      values: { srcAmount },
    });
  }

  onPageLoaded() {
    this.update({
      newState: "swapPageLoaded",
    });
  }

  onApproveRequest() {
    this.update({
      newState: "approveRequest",
      values: {
        approveFailedError: "",
      },
    });
  }

  onTokenApproved() {
    this.update({
      newState: "approved",
    });
  }

  onApproveFailed(approveFailedError: string) {
    this.update({
      newState: "approveFailed",
      values: { approveFailedError },
    });
  }

  onSwapClick() {
    this.update({
      newState: "swapClick",
    });
  }

  onConfirmSwapClick() {
    this.update({
      newState: "swapConfirmClick",
    });
  }

  onQuoteRequest(dexAmountOut: string) {
    this.update({
      newState: "quoteRequest",
      values: {
        dexAmountOut,
        quoteFailedError: "",
      },
    });
  }

  onQuoteSuccess(clobAmountOut: string, serializedOrder: string, callData: string, permitData: any, quoteRequestDurationMillis: number) {
    this.update({
      newState: "quoteSuccess",
      values: {
        clobAmountOut,
        quoteRequestDurationMillis,
        isClobTrade: bn(this.data.dexAmountOut).isLessThan(bn(clobAmountOut)),
        serializedOrder,
        callData,
        permitData,
      },
    });
  }
  onQuoteFailed(quoteFailedError: string) {
    this.update({
      newState: "quoteFailed",
      values: {
        quoteFailedError,
      },
    });
  }

  onClobLowAmountOut() {
    this.update({
      newState: "clobLowAmountOut",
    });
  }

  onSignatureRequest() {
    this.update({
      newState: "signatureRequest",
    });
  }
  onSignatureSuccess(signature: string) {
    this.update({
      newState: "signatureSuccess",
      values: { signature },
    });
  }

  onSignatureFailed(signatureFailedError: string) {
    this.update({
      newState: "signatureFailed",
      values: { signatureFailedError },
    });
  }

  onSwapRequest() {
    this.update({
      newState: "swapRequest",
      values: { swapFailedError: "" },
    });
  }

  onSwapSuccess(swapTxHash: string, swapRequestDurationMillis: number) {
    this.update({
      newState: "swapSuccess",
      values: { swapTxHash, swapRequestDurationMillis },
    });
  }

  onSwapFailed(swapFailedError: string) {
    this.update({
      newState: "swapFailed",
      values: { swapFailedError },
    });
  }
}

export const analytics = new Analytics();

export const useAnalyticsListeners = (account?: string, srcToken?: any, dstToken?: any, srcAmount?: string) => {
  useEffect(() => {
    if (srcAmount) {
      analytics.onSrcAmount(srcAmount);
    }
  }, [srcAmount]);

  useEffect(() => {
    analytics.onWalletConnected(account);
  }, [account]);

  useEffect(() => {
    analytics.onPageLoaded();
  }, []);

  useEffect(() => {
    analytics.onSrcToken(srcToken?.address, srcToken?.symbol);
  }, [srcToken?.address, srcToken?.symbol]);

  useEffect(() => {
    analytics.onDstToken(dstToken?.address, dstToken?.symbol);
  }, [dstToken?.address, dstToken?.symbol]);
};
