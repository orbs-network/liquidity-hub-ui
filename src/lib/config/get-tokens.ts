import _ from "lodash";
import { networks } from "../networks";
import { Token } from "../type";
import { zeroAddress } from "./consts";

const getPolygonTokens = async (): Promise<Token[]> => {
    const payload = await fetch(
      "https://unpkg.com/quickswap-default-token-list@1.3.16/build/quickswap-default.tokenlist.json"
    )
    const res = await payload.json();
    
    const tokens = res.tokens.filter((it: any) => it.chainId === 137);
  
    const candiesAddresses = [
      zeroAddress,
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
      "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      "0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7",
      "0x614389EaAE0A6821DC49062D56BDA3d9d45Fa2ff",
    ];
  
    const sorted = _.sortBy(tokens, (t: any) => {
      const index = candiesAddresses.indexOf(t.address);
      return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
    });
  
    return [networks.poly.native, ...sorted].map((token: any) => {
      return {
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        logoUrl:
          token.logoUrl || token.logoURI?.replace("/logo_24.png", "/logo_48.png"),
        name: token.name,
      };
    });
  };
  
  const getBNBTokens = async (): Promise<Token[]> => {
    let payload = await fetch(
      "https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/bsc.json"
    );
    const res = await payload.json();
  
    
    let tokens = res.filter((it: any) => it.chainId === 56);
  
    const candiesAddresses = [
      zeroAddress,
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
      "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      "0x55d398326f99059fF775485246999027B3197955",
      "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      "0xeBd49b26169e1b52c04cFd19FCf289405dF55F80",
    ];
    tokens = _.sortBy(tokens, (t: any) => {
      const index = candiesAddresses.indexOf(t.address);
      return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
    });
  
    const filteredTokens = tokens.filter((it: any) => it.chainId === 56);
    return filteredTokens.map((it: any) => {
      return {
        address: it.address,
        symbol: it.symbol,
        decimals: it.decimals,
        logoUrl: it.logoURI?.replace("_1", ""),
      };
    });
  };
  
  const getPolygonZkEvmTokens = async (): Promise<Token[]> => {
    let payload =  await fetch( "https://unpkg.com/quickswap-default-token-list@1.3.21/build/quickswap-default.tokenlist.json")
    const res = await payload.json();
    
    const native = {
      ...networks.eth.wToken,
      address: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
    };
  
    const result = res.tokens
      .filter((it: any) => it.chainId === 1101)
      .map((it: any) => {
        return {
          address: it.address,
          symbol: it.symbol,
          decimals: it.decimals,
          logoUrl: it.logoURI,
        };
      });
    return [native, ...result];
  };
  
  const getBaseTokens = async (): Promise<Token[]> => {
    const payload = await fetch("https://cloudflare-ipfs.com/ipns/tokens.uniswap.org")
    const res = await payload.json();
    
    let tokens = res.tokens
    const baseTokens = tokens.filter((token: any) => token.chainId === 8453);
  
    const candiesAddresses = [
      zeroAddress,
  
      "0x4200000000000000000000000000000000000006",
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    ];
  
    tokens = _.sortBy(baseTokens, (t: any) => {
      const index = candiesAddresses.indexOf(t.address);
      return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
    });
  
    const result = tokens.map((it: any): Token => {
      return {
        address: it.address,
        decimals: it.decimals,
        symbol: it.symbol,
        logoUrl: it.logoURI,
      };
    });
    return [networks.base.native, ...result];
  };


  export  {
    getPolygonTokens,
    getBNBTokens,
    getPolygonZkEvmTokens,
    getBaseTokens
  }