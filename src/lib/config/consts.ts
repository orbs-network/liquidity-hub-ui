
import BN from "bignumber.js";
export const WEBSITE_URL = "https://www.orbs.com/";
export const DEFAULT_QUOTE_INTERVAL = 10_000


export enum QUERY_KEYS {
  TOKEN_BALANCE = "TOKEN_BALANCE",
  GET_TOKENS = "GET_TOKENS",
  GAS_PRICE = "GAS_PRICE",
  USD_PRICE = "USD_PRICE",
  TOKEN_BALANCES = "TOKEN_BALANCES",
  QUOTE = "QUOTE",
  SWAP = "SWAP",
  APPROVE = "APPROVE",
  BALANCE = "BALANCE",
  BALANCES = "BALANCES",
  SORTED_TOKENS = "SORTED_TOKENS",
  FILTER_TOKENS = "FILTER_TOKENS",
}

export const DEFAULT_SLIPPAGE = 0.3;


export const zeroAddress = "0x0000000000000000000000000000000000000000";
export const maxUint256 =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export const permit2Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
export const zero = BN(0);


export const nativeTokenAddresses = [
  zeroAddress,
  "0x0000000000000000000000000000000000001010",
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "0x000000000000000000000000000000000000dEaD",
];


export const QUOTE_ERRORS = {
  tns: "tns",
  noLiquidity: "no liquidity",
  ldv: "ldv",
  timeout: "timeout",
};

export const THENA_TOKENS_LIST_API =
  "https://lhthena.s3.us-east-2.amazonaws.com/token-list-lh.json";