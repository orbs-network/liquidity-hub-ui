import { Network } from "../type";
import _ from "lodash";
import { networks } from "../networks";
import { getBaseTokens, getBNBTokens, getPolygonTokens, getPolygonZkEvmTokens } from "./get-tokens";

const polygon: Network = {
  native: networks.poly.native,
  wToken: networks.poly.wToken,
  chainId: 137,
  chainName: "Polygon",
  explorerUrl: "https://polygonscan.com",
  getTokens: getPolygonTokens,
  apiUrl: 'https://polygon.hub.orbs.network'
};

const bsc: Network = {
  native: networks.bsc.native,
  wToken: networks.bsc.wToken,
  chainId: 56,
  chainName: "BSC",
  explorerUrl: "https://bscscan.com",
  getTokens: getBNBTokens,
  apiUrl: 'https://bsc.hub.orbs.network'
};

const zkEvm: Network = {
  native: networks.eth.native,
  wToken: {
    ...networks.eth.wToken,
    address: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
  },
  chainId: 1101,
  chainName: "Polygon ZkEVM",
  explorerUrl: "https://zkevm.polygonscan.com",
  getTokens: getPolygonZkEvmTokens,
  apiUrl: 'https://zkevm.hub.orbs.network'

};

const base: Network = {
  native: networks.base.native,
  wToken: networks.base.wToken,
  chainId: 8453,
  chainName: "Base",
  explorerUrl: "https://basescan.org",
  getTokens: getBaseTokens,
  apiUrl: 'https://base.hub.orbs.network'

};
export const supportedChains = {
  polygon,
  bsc,
  zkEvm,
  base,
};
