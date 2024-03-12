import BN, { BigNumber } from "bignumber.js";
import Web3  from "web3";
import { Network} from "./type";
import _ from "lodash";
import { supportedChains } from "./config/supportedChains";
import { nativeTokenAddresses, QUOTE_ERRORS, zero } from "./config/consts";
import { networks } from "./networks";
import { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { _TypedDataEncoder } from "@ethersproject/hash";


export declare type PermitData = {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  values: any;
};

export const amountBN = (decimals?: number, amount?: string) =>
  parsebn(amount || "").times(new BN(10).pow(decimals || 0)).decimalPlaces(0);

export const amountUi = (decimals?: number, amount?: BN) => {
  if (!decimals || !amount) return "";
  const percision = new BN(10).pow(decimals || 0);
  return amount.times(percision).idiv(percision).div(percision).toString();
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export const getChainConfig = (chainId?: number): Network | undefined => {
  if (!chainId) return undefined;
  return Object.values(supportedChains).find(
    (it) => it.chainId === chainId
  );
};


export async function waitForTxReceipt(web3: Web3, txHash: string) {
  for (let i = 0; i < 30; ++i) {
    // due to swap being fetch and not web3

    await delay(3_000); // to avoid potential rate limiting from public rpc
    try {
      const { mined, revertMessage } = await getTransactionDetails(
        web3,
        txHash
      );

      if (mined) {
        return {
          mined,
          revertMessage: undefined,
        };
      }
      if (revertMessage) {
        return {
          mined: false,
          revertMessage,
        };
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export async function getTransactionDetails(
  web3: Web3,
  txHash: string
): Promise<{ mined: boolean; revertMessage?: string }> {
  try {
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    if (!receipt) {
      return {
        mined: false,
      };
    }

    let revertMessage = "";

    if (!receipt.status) {
      // If the transaction was reverted, try to get the revert reason.
      try {
        const tx = await web3.eth.getTransaction(txHash);
        const code = await web3.eth.call(tx as any, tx.blockNumber!);
        revertMessage = web3.utils.toAscii(code).replace(/\0/g, ""); // Convert the result to a readable string
      } catch (err) {
        revertMessage = "Unable to retrieve revert reason";
      }
    }

    return {
      mined: receipt.status ? true : false,
      revertMessage,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch transaction details: ${error.message}`);
  }
}


export const deductSlippage = (amount?: string, slippage?: number) => {
  if (!amount) return "";
  if (!slippage) return amount;
  console.log(slippage, amount);

  return new BigNumber(amount)
    .times(100 - slippage)
    .div(100)
    .toString();
};


export const counter = () => {
  const now = Date.now();

  return () => {
    return Date.now() - now;
  };
};

export const addSlippage = (amount?: string, slippage?: number) => {
  if (!amount) return "";
  if (!slippage) return amount;
  return new BigNumber(amount)
    .times(100 + slippage)
    .div(100)
    .toString();
};


export const shouldReturnZeroOutAmount = (error: string) => {  
  return Object.values(QUOTE_ERRORS).includes(error);
};

export function eqIgnoreCase(a: string, b: string) {
  return a == b || a.toLowerCase() == b.toLowerCase();
}
export const isNativeAddress = (address: string) =>
  !!nativeTokenAddresses.find((a) => eqIgnoreCase(a, address));



  export function bn(n: BN.Value, base?: number): BN {
    if (n instanceof BN) return n;
    if (!n) return zero;
    return BN(n, base);
  }


  export async function sendAndWaitForConfirmations(
    web3: Web3,
    chainId: number,  
    tx: any,
    opts: any,
    confirmations: number = 0,
    autoGas?: "fast" | "med" | "slow"
  ) {
    if (!tx && !opts.to) throw new Error("tx or opts.to must be specified");

    const [nonce, chain, price] = await Promise.all([
      web3.eth.getTransactionCount(opts.from),
      chainId,
      autoGas ? estimateGasPrice(web3, chainId) : Promise.resolve(),
    ]);
    const maxFeePerGas = BN.max(
      autoGas ? price?.[autoGas]?.max || 0 : 0,
      bn(opts.maxFeePerGas || 0),
      0
    );
    const maxPriorityFeePerGas = BN.max(
      autoGas ? price?.[autoGas]?.tip || 0 : 0,
      bn(opts.maxPriorityFeePerGas || 0),
      0
    );

    const options = {
      value: opts.value ? bn(opts.value).toFixed(0) : 0,
      from: opts.from,
      to: opts.to,
      gas: 0,
      nonce,
      maxFeePerGas: maxFeePerGas.isZero() ? undefined : maxFeePerGas.toFixed(0),
      maxPriorityFeePerGas: maxPriorityFeePerGas.isZero()
        ? undefined
        : maxPriorityFeePerGas.toFixed(0),
    };

    if (!network(chain).eip1559) {
      (options as any).gasPrice = options.maxFeePerGas;
      delete options.maxFeePerGas;
      delete options.maxPriorityFeePerGas;
    }

    const estimated = await (tx?.estimateGas({ ...options }) ||
      web3.eth.estimateGas({ ...options }));
    options.gas = Math.floor(estimated * 1.2);

    const promiEvent = tx
      ? tx.send(options)
      : web3.eth.sendTransaction(options);

    let sentBlock = Number.POSITIVE_INFINITY;
    promiEvent.once("receipt", (r: any) => (sentBlock = r.blockNumber));

    const result = await promiEvent;

    while (
      (await web3.eth.getTransactionCount(opts.from)) === nonce ||
      (await web3.eth.getBlockNumber()) < sentBlock + confirmations
    ) {
      await new Promise((r) => setTimeout(r, 1000));
    }

    return result
  }






  export async function estimateGasPrice(
    web3: Web3,
    chainId: number,
    percentiles: number[] = [10, 50, 90],
    length: number = 5
  ): Promise<{
    slow: { max: BN; tip: BN };
    med: { max: BN; tip: BN };
    fast: { max: BN; tip: BN };
    baseFeePerGas: BN;
    pendingBlockNumber: number;
    pendingBlockTimestamp: number;
  }> {
    return await keepTrying(async () => {
      const chain = network(chainId);
      const pending = chain.pendingBlocks ? "pending" : "latest";
      const [pendingBlock, history] = await Promise.all([
        web3!.eth.getBlock(pending),
        !!web3!.eth.getFeeHistory
          ? web3!.eth.getFeeHistory(length, pending, percentiles)
          : Promise.resolve({ reward: [] }),
      ]);

      const baseFeePerGas = BN.max(
        pendingBlock.baseFeePerGas?.toString() || 0,
        chain.baseGasPrice,
        0
      );

      const slow = BN.max(
        1,
        median(_.map(history.reward, (r) => BN(r[0].toString(), 16)))
      );
      const med = BN.max(
        1,
        median(_.map(history.reward, (r) => BN(r[1].toString(), 16)))
      );
      const fast = BN.max(
        1,
        median(_.map(history.reward, (r) => BN(r[2].toString(), 16)))
      );

      return {
        slow: {
          max: baseFeePerGas.times(1).plus(slow).integerValue(),
          tip: slow.integerValue(),
        },
        med: {
          max: baseFeePerGas.times(1.1).plus(med).integerValue(),
          tip: med.integerValue(),
        },
        fast: {
          max: baseFeePerGas.times(1.25).plus(fast).integerValue(),
          tip: fast.integerValue(),
        },
        baseFeePerGas,
        pendingBlockNumber: BN(pendingBlock.number.toString()).toNumber(),
        pendingBlockTimestamp: BN(pendingBlock.timestamp.toString()).toNumber(),
      };
    });
  }


  export function network(chainId: number) {
    return _.find(networks, (n) => n.id === chainId)!;
  }



  export function median(arr: BN.Value[]): BN {
    if (!arr.length) return zero;

    arr = [...arr].sort((a, b) => bn(a).comparedTo(b));
    const midIndex = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0
      ? bn(arr[midIndex])
      : bn(arr[midIndex - 1])
          .plus(arr[midIndex])
          .div(2);
  }



  export async function keepTrying<T>(
    fn: () => Promise<T>,
    retries = 3,
    ms = 1000
  ): Promise<T> {
    let e;
    for (let i = 0; i < retries; i++) {
      try {
        return await timeout(fn, ms);
      } catch (_e) {
        e = _e;
        await sleep(ms);
      }
    }
    throw new Error("failed to invoke fn " + e);
  }

  export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  export async function timeout<T>(
    fn: () => Promise<T>,
    ms = 1000
  ): Promise<T> {
    let failed = false;
    const r = await Promise.race([
      fn(),
      new Promise((resolve) => {
        setTimeout(() => {
          failed = true;
          resolve(null);
        }, ms);
      }),
    ]);
    if (!failed && !!r) return r as T;
    else throw new Error("timeout");
  }




  export async function signEIP712(web3: Web3, signer: string, data: PermitData) {
    // Populate any ENS names (in-place)
    const populated = await _TypedDataEncoder.resolveNames(
      data.domain,
      data.types,
      data.values,
      async (name: string) => (await web3.eth.ens.getAddress(name)).toString()
    );
    const typedDataMessage = _TypedDataEncoder.getPayload(
      populated.domain,
      data.types,
      populated.value
    );

    try {
      return await signAsync(web3, "eth_signTypedData_v4", signer, typedDataMessage);
    } catch (e: any) {
      try {
        return await signAsync(web3, "eth_signTypedData", signer, typedDataMessage);
      } catch (e: any) {
        return await signAsync(
          web3,
          "eth_sign",
          signer,
          _TypedDataEncoder.hash(populated.domain, data.types, populated.value)
        );
      }
    }
  }

  export async function signAsync(
    web3: Web3,
    method: "eth_signTypedData_v4" | "eth_signTypedData" | "eth_sign",
    signer: string,
    payload: string | PermitData
  ) {
    const provider: any = (web3.currentProvider as any).send
      ? web3.currentProvider
      : (web3 as any)._provider;
    return await new Promise<string>((resolve, reject) => {
      provider.send(
        {
          id: 1,
          method,
          params: [
            signer,
            typeof payload === "string" ? payload : JSON.stringify(payload),
          ],
          from: signer,
        },
        (e: any, r: any) => {
          if (e || !r?.result) return reject(e);
          return resolve(r.result);
        }
      );
    });
  }



  export function parsebn(n: BN.Value, defaultValue?: BN, fmt?: BN.Format): BN {
    if (typeof n !== "string") return bn(n);

    const decimalSeparator = fmt?.decimalSeparator || ".";
    const str = n.replace(new RegExp(`[^${decimalSeparator}\\d-]+`, "g"), "");
    const result = bn(
      decimalSeparator === "." ? str : str.replace(decimalSeparator, ".")
    );
    if (defaultValue && (!result.isFinite() || result.lte(zero)))
      return defaultValue;
    else return result;
  }
