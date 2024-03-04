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
import { QuoteResponse } from "./type";

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

  


 
export const liquidityHub = {
  quote,
};
