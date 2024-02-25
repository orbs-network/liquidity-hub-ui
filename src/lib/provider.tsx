import { setWeb3Instance } from "@defi.org/web3-candies";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkTheme, lightTheme } from "./theme";
import { ProviderArgs } from "./type";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { ThemeProvider } from "styled-components";
import { DEFAULT_API_ENDPOINT, DEFAULT_QUOTE_INTERVAL } from "./config/consts";
import Web3 from "web3";
import { swapAnalytics } from "./analytics";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export interface Props extends ProviderArgs {
  children: ReactNode;
}

interface ContextArgs extends ProviderArgs {
  web3?: Web3;
}

const Context = createContext({} as ContextArgs);

export const LiquidityHubProvider = ({
  children,
  provider,
  account,
  chainId,
  partner,
  quoteInterval = DEFAULT_QUOTE_INTERVAL,
  apiUrl = DEFAULT_API_ENDPOINT,
  partnerChainId,
  theme,
  slippage,
}: Props) => {
  const _theme = useMemo(() => {
    if (theme === "light") {
      return lightTheme;
    }
    return darkTheme;
  }, [theme]);

  const web3 = useMemo(
    () => (provider ? new Web3(provider) : undefined),
    [provider]
  );

  useEffect(() => {
    setWeb3Instance(web3);
  }, [web3]);

  useEffect(() => {
    if (chainId && partner) {
      swapAnalytics.setChainId(chainId);
      swapAnalytics.setPartner(partner);
    }
  }, [chainId, partner]);

  return (
    <QueryClientProvider client={client}>
      <Context.Provider
        value={{
          provider,
          account,
          chainId,
          partner,
          quoteInterval,
          apiUrl,
          web3,
          partnerChainId,
          slippage,
        }}
      >
        <ThemeProvider theme={_theme}>{children}</ThemeProvider>
      </Context.Provider>
    </QueryClientProvider>
  );
};

export const useMainContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useMainContext must be used within a LHProvider");
  }
  return context;
};
