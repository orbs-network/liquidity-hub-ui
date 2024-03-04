
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { LiquidityHubProvider, SwapConfirmation } from "./lib";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <LiquidityHubProvider partner="" supportedChains={[137]}>
        <SwapConfirmation />
      </LiquidityHubProvider>
    </>
  </React.StrictMode>
);
