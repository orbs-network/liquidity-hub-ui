import { numericFormatter } from "react-number-format";
import { swapAnalytics } from "./analytics";
import { QUOTE_ERRORS } from "./config/consts";
import {
  addSlippage,
  amountUi,
  counter,
  shouldReturnZeroOutAmount,
} from "./util";
import BN from "bignumber.js";
import Web3 from "web3";
import { QuoteResponse } from "./type";
import {
  Contract,
  permit2Address,
  sendAndWaitForConfirmations,
  setWeb3Instance,
  signEIP712,
} from "@defi.org/web3-candies";
  async function quote(args: {
    apiUrl: string;
    chainId: number;
    fromAddress: string;
    toAddress: string;
    fromAmount: string;
    dexAmountOut: string;
    account: string;
    slippage: number;
    partner: string;
    signal?: AbortSignal;
    toTokenecimals: number;
  }) {
    swapAnalytics.onQuoteRequest();
    let result;
    const count = counter();
    try {
      const response = await fetch(
        `${args.apiUrl}/quote?chainId=${args.chainId}`,
        {
          method: "POST",
          body: JSON.stringify({
            inToken: args.fromAddress,
            outToken: args.toAddress,
            inAmount: args.fromAmount,
            outAmount: !args.dexAmountOut
              ? "-1"
              : new BN(args.dexAmountOut).gt(0)
              ? args.dexAmountOut
              : "0",
            user: args.account,
            slippage: args.slippage,
            qs: encodeURIComponent(
              window.location.hash || window.location.search
            ),
            partner: args.partner.toLowerCase(),
            sessionId: swapAnalytics.data.sessionId,
          }),
          signal: args.signal,
        }
      );
      result = await response.json();
      if (!result) {
        throw new Error("No result");
      }
      if (result.sessionId) {
        swapAnalytics.setSessionId(result.sessionId);
      }
      if (!result.outAmount || new BN(result.outAmount).eq(0)) {
        throw new Error(QUOTE_ERRORS.noLiquidity);
      }
      swapAnalytics.onQuoteSuccess(count(), result);

      const outAmountUI = numericFormatter(
        amountUi(args.toTokenecimals, new BN(result.outAmount)),
        { decimalScale: 4, thousandSeparator: "," }
      );

      const outAmountUIWithSlippage = numericFormatter(
        amountUi(
          args.toTokenecimals,
          new BN(addSlippage(result.outAmount, args.slippage))
        ),
        { decimalScale: 4, thousandSeparator: "," }
      );
      return {
        ...result,
        outAmountUI,
        outAmountUIWithSlippage,
      } as QuoteResponse;
    } catch (error: any) {
      swapAnalytics.onQuoteFailed(error.message, count(), result);
      if (shouldReturnZeroOutAmount(error.message)) {
        return {
          outAmount: "0",
          outAmountUI: "0",
        } as QuoteResponse;
      } else {
        throw new Error(error.message);
      }
    }
  }

  async function sign(args: { web3: Web3; account: string; permitData: any }) {
    const count = counter();
    try {
      swapAnalytics.onSignatureRequest();
      setWeb3Instance(args.web3);
      const signature = await signEIP712(args.account, args.permitData);
      swapAnalytics.onSignatureSuccess(signature, count());
      return signature;
    } catch (error: any) {
      swapAnalytics.onSignatureFailed(error.message, count());
      throw new Error(error.message);
    }
  }
  async function approve(args: {
    fromToken: string;
    fromAmount: string;
    fromTokenContract: Contract;
    account: string;
  }) {
    const count = counter();
    swapAnalytics.onApprovalRequest();

    try {
      const tx = args.fromTokenContract.methods.approve(
        permit2Address,
        maxUint256
      );

      await sendAndWaitForConfirmations(tx, { from: args.account });
      swapAnalytics.onApprovalSuccess(count());
    } catch (error: any) {
      swapAnalytics.onApprovalFailed(error.message, count());
      throw new Error(error.message);
    }
  }

  async function wrap(args: {
    fromTokenContract: Contract;
    account: string;
    fromAmount: string;
    maxFeePerGas?: string;
    priorityFeePerGas?: string;
  }) {
    const count = counter();
    swapAnalytics.onWrapRequest();
    try {
      const tx = args.fromTokenContract.methods.deposit();
      await sendAndWaitForConfirmations(tx, {
        from: args.account,
        value: args.fromAmount,
        maxFeePerGas: args?.maxFeePerGas,
        maxPriorityFeePerGas: args?.priorityFeePerGas,
      });

      swapAnalytics.onWrapSuccess(count());
      return true;
    } catch (error: any) {
      swapAnalytics.onWrapFailed(error.message, count());
      throw new Error(error.message);
    }
  }

  async function  isApproved(args: {
    fromTokenContract: Contract;
    account: string;
    fromAmount: string;
  }) {
    try {
      const allowance = await args.fromTokenContract?.methods
        ?.allowance(args.account, permit2Address)
        .call();

      return BN(allowance?.toString() || "0").gte(args.fromAmount);
    } catch (error) {
      console.log({ error }, "approved error");

      throw error;
    }
  }


  async function unwrap(args: {
    fromTokenContract: Contract;
    fromAmount: string;
    account: string;
    maxFeePerGas?: string;
    priorityFeePerGas?: string;
  }) {
    try {
      const tx = args.fromTokenContract.methods.withdraw(
        new BN(args.fromAmount).toFixed(0)
      );
      await sendAndWaitForConfirmations(tx, {
        from: args.account,
        maxFeePerGas: args?.maxFeePerGas,
        maxPriorityFeePerGas: args?.priorityFeePerGas,
      });
      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

 
export const liquidityHub = {
  quote,
  sign,
  approve,
  isApproved,
  wrap,
  unwrap,
};
