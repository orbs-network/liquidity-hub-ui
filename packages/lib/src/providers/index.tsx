/* eslint-disable import/no-extraneous-dependencies */
import React, { createContext, ReactNode, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Web3 from "web3";
import { useAnalytics } from "../analytics";
import { TWAPLib, Configs } from "@orbs-network/twap";
import { Wizard } from "../ui/Wizard";
import { setWeb3Instance } from "@defi.org/web3-candies";

const client = new QueryClient();

const configs = {
  quickswap: Configs.QuickSwap,
  thena: Configs.Thena,
};

interface SharedProps {
  provider?: any;
  account?: string;
  chainId?: number;
  partner: keyof typeof configs;
  slippage?: number;
  lib?: TWAPLib;
}

interface ContextProps extends SharedProps {
  web3?: Web3;
}

const Context = createContext({} as ContextProps);

interface Props extends SharedProps {
  children: ReactNode;
}

export const LiquidityHubProvider = ({ children, provider, account, chainId, partner, slippage }: Props) => {
  const { web3, lib } = useMemo(() => {
    const config = configs[partner];
    setWeb3Instance(undefined);
    return {
      web3: provider ? new Web3(provider) : undefined,
      lib: new TWAPLib(config, account!, provider),
    };
  }, [provider, account]);
  useAnalytics(partner, chainId);

  return (
    <QueryClientProvider client={client}>
      <Context.Provider value={{ web3, provider, account, chainId, partner, slippage, lib }}>
        {children}
        <Wizard />
      </Context.Provider>
    </QueryClientProvider>
  );
};

export const useLHContext = () => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error("useLHContext must be used within a LHProvider");
  }
  return context;
};
