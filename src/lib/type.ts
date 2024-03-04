import { AbiItem } from "web3-utils";

export interface Token {
  name?: string;
  address: string;
  decimals: number;
  symbol: string;
  logoUrl?: string;
}

type TokenUsd = string | number | undefined;

export interface ShowConfirmationProps {
  fromTokenUsd: TokenUsd;
  toTokenUsd: TokenUsd;
}

export interface ProviderArgs {
  supportedChains: number[];
  slippage?: number;
  provider?: any;
  account?: string;
  chainId?: number;
  partner: string;
  apiUrl?: string;
  quoteInterval?: number;
  disableAnalytics?: boolean;
  theme?: "dark" | "light";
  maxFailures?: number;
}

export interface QuoteArgs {
  inToken: string;
  outToken: string;
  inAmount: string;
  account?: string;
  slippage?: number;
  chainId: number;
  dexAmountOut?: string;
  signal?: AbortSignal;
  partner: string;
  apiUrl?: string;
}
export interface SendTxArgs {
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

export interface SubmitTxArgs {
  srcToken: string;
  destToken: string;
  srcAmount: string;
  signature: string;
  quote: QuoteResponse;
}

export interface UseSwapCallback {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
}

export interface QuoteResponse {
  outAmount: string;
  permitData: any;
  serializedOrder: string;
  callData: string;
  rawData: any;
  outAmountUI: string;
  outAmountUIWithSlippage?: string;
}

export enum LH_CONTROL {
  FORCE = "1",
  SKIP = "2",
  RESET = "3",
}

export enum STEPS {
  WRAP,
  APPROVE,
  SIGN,
  SEND_TX,
}

export type ActionStatus = "loading" | "success" | "failed" | undefined;

export interface Step {
  title: string;
  loadingTitle: string;
  link?: { href: string; text: string };
  image?: string;
  hidden?: boolean;
  id: STEPS;
}

export type QuoteQueryArgs = {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  dexAmountOut?: string;
};

export type UseLiquidityHubArgs = {
  fromToken?: Token;
  toToken?: Token;
  fromAmount?: string;
  fromAmountUI?: string;
  dexAmountOut?: string;
  dexAmountOutUI?: string;
  ignoreSlippage?: boolean;
};

export type TradeOwner = "dex" | "lh";




export type UseAddOrderArgs = {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  fromUsd?: string | number;
  toUsd?: string | number;
  txHash: string;
};

export type Order = {
  id: string;
  date: number;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  fromUsd?: string | number;
  toUsd? : string | number;
  txHash: string
};

export type Orders = { [address: string]: { [chain: string]: Order[] } };

export interface Network {
  native: Token;
  wToken?: Token;
  chainId: number;
  chainName: string;
  explorerUrl: string;
}



export type Abi = AbiItem[];
