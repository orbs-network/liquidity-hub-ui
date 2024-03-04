import { Network } from "../type";
import _ from "lodash";
import { networks } from "../networks";

const polygon: Network = {
  native: networks.poly.native,
  wToken: networks.poly.wToken,
  chainId: 137,
  chainName: "Polygon",
  explorerUrl: "https://polygonscan.com",
};

const bsc: Network = {
  native: networks.bsc.native,
  wToken: networks.bsc.wToken,
  chainId: 56,
  chainName: "BSC",
  explorerUrl: "https://bscscan.com",
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
};

const base: Network = {
  native: networks.base.native,
  wToken: networks.base.wToken,
  chainId: 8453,
  chainName: "Base",
  explorerUrl: "https://basescan.org",
};
export const supportedChainsConfig = {
  polygon,
  bsc,
  zkEvm,
  base,
};
