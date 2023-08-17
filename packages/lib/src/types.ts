export interface QuoteArgs {
  inToken: string;
  outToken: string;
  inAmount: string;
  outAmount: string;
  user: string;
  slippage?: number;
  chainId: number;
}
export interface SwapArgs {
  user: string;
  inToken: string;
  outToken: string;
  inAmount: string;
  outAmount: string;
  signature: string;
  quoteResult: any;
  chainId: number;
}

export interface ApproveArgs {
  user: string;
  inToken: string;
  inAmount: string;
  provider: any;
}

export interface SubmitLiquidityTradeArgs {
  provider: any;
  user: string;
  inToken: string;
  outToken: string;
  inAmount: string;
  outAmount: string;
  chainId: number;
  slippage: number;
}

export interface QuoteResponse {
  outAmount: string;
  serializedOrder: string;
  callData: string;
  permitData: any;
}

export interface SwapState {
  isWon: boolean;
  isFailed: boolean;
  outAmount?: string;
  waitingForApproval: boolean;
  waitingForSignature: boolean;
  isSwapping: boolean;
  isQuoting: boolean;
  updateState: (state: Partial<SwapState>) => void;
}

export interface AnalyticsState {
  state: string;
  time: number;
}
export interface AnalyticsData {
  _id: string;
  state: AnalyticsState;
  walletAddress?: string;
  srcTokenAddress: string;
  srcTokenSymbol: string;
  dstTokenAddress: string;
  dstTokenSymbol: string;
  srcAmount: string;
  dstAmountOut: string;
  clobOutAmount: string;
  approvalAmount: string;
  approvalSpender: string;
  approveFailedError: string;
  clobAmountOut: string;
  dexAmountOut: string;
  isClobTrade: boolean;
  quoteFailedError: string;
  quoteRequestDurationMillis: number;
  swapTxHash: string;
  swapFailedError: string;
  signature: string;
  serializedOrder: string;
  callData: string;
  permitData: string;
  signatureFailedError: string;
  swapRequestDurationMillis: number;
}

export enum SwapControl {
  FORCE = "1",
  SKIP = "2",
}
