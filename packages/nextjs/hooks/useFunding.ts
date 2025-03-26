import { useEffect, useState } from "react";
import { readContract, simulateContract, writeContract } from "@wagmi/core";
import { parseEther, parseUnits } from "viem";
import { erc20Abi } from "viem";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { baseChainId } from "~~/data/chains";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { getParsedError } from "~~/utils/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface useFundingProps {
  cohortAddress: string;
  tokenAddress?: string;
  amount: number;
  isTransferLoading?: boolean;
  isErc20?: boolean;
  tokenDecimals?: number;
}

export const useFunding = ({
  tokenAddress,
  amount,
  isTransferLoading,
  cohortAddress,
  isErc20,
  tokenDecimals,
}: useFundingProps) => {
  const { address, chain, chainId } = useAccount();
  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { targetNetwork } = useTargetNetwork();

  const [allowance, setAllowance] = useState<number>();
  const [balance, setBalance] = useState<number>();
  const [tokenSymbol, setTokenSymbol] = useState<string>();
  const [tokenName, setTokenName] = useState<string>();

  const [updateAllowance, setUpdateAllowance] = useState(false);

  const { isPending, writeContractAsync } = useWriteContract();

  const cohort = contracts?.[baseChainId]["Cohort"];

  const formatAmount = (value: number, functionName: string) => {
    if (!tokenDecimals && tokenDecimals !== 0) return BigInt(0);

    const adjustedAmount = value * (functionName === "approve" ? 1.000001 : 1);

    try {
      return parseUnits(adjustedAmount.toString(), tokenDecimals);
    } catch (e) {
      console.error("Error formatting amount:", e);
      return BigInt(0);
    }
  };

  const approve = async () => {
    if (!chain) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== targetNetwork.id) {
      notification.error("You on the wrong network");
      return;
    }

    if (isErc20 && tokenAddress) {
      // Format amount according to token decimals
      const approvalAmount = formatAmount(amount, "approve");

      const { request } = await simulateContract(wagmiConfig, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [cohortAddress, approvalAmount],
      });

      try {
        setIsMining(true);
        await writeTx(() => writeContract(wagmiConfig, request));
        setUpdateAllowance(true);
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      } finally {
        setIsMining(false);
      }
    } else {
      notification.error("Contract writer error. Try again.");
      return;
    }
  };

  const fund = async () => {
    if (!chain) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chainId !== targetNetwork.id) {
      notification.error("You on the wrong network");
      return;
    }

    if (cohort && cohortAddress) {
      try {
        // Format amount according to token decimals for ERC20 tokens
        const fundAmount = isErc20 ? formatAmount(amount, "fund") : BigInt(0);

        console.log(fundAmount);

        const makeWriteWithParams = () =>
          writeContractAsync({
            abi: cohort.abi,
            address: cohortAddress,
            functionName: "fundContract",
            args: [fundAmount],
            value: isErc20 ? BigInt(0) : parseEther(amount.toString()),
          });

        await writeTx(makeWriteWithParams);
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      }
    } else {
      notification.error("Contract writer error. Try again.");
      return;
    }
  };

  useEffect(() => {
    (async () => {
      if (isErc20 && tokenAddress && address) {
        setAllowance(undefined);
        setIsLoading(true);
        try {
          const data = await readContract(wagmiConfig, {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "allowance",
            args: [address, cohortAddress],
          });

          // Format based on token decimals
          const decimals = tokenDecimals || 18;
          const divisor = 10n ** BigInt(decimals);
          const formatted = Number(data) / Number(divisor);
          setAllowance(formatted);
        } catch {
          setAllowance(undefined);
        }
      }
      if (updateAllowance) setUpdateAllowance(false);
      setIsLoading(false);
    })();
  }, [tokenAddress, address, isMining, updateAllowance, isTransferLoading, cohortAddress, isErc20, tokenDecimals]);

  useEffect(() => {
    (async () => {
      if (tokenAddress && tokenAddress != "" && address && !isTransferLoading) {
        setIsLoading(true);
        setBalance(undefined);
        try {
          const data = await readContract(wagmiConfig, {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address],
          });

          // Format based on token decimals
          const decimals = tokenDecimals || 18;
          const divisor = 10n ** BigInt(decimals);
          const formatted = Number(data) / Number(divisor);
          setBalance(formatted);
        } catch {
          setBalance(undefined);
        }
      }
      setIsLoading(false);
    })();
  }, [tokenAddress, address, isMining, isTransferLoading, tokenDecimals]);

  useEffect(() => {
    (async () => {
      if (tokenAddress && tokenAddress != "" && address && !isTransferLoading) {
        setTokenSymbol("");
        setTokenName("");
        setIsLoading(true);
        try {
          // Fetch token metadata
          const symbolPromise = readContract(wagmiConfig, {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "symbol",
          });

          const namePromise = readContract(wagmiConfig, {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "name",
          });

          // Resolve promises in parallel
          const [symbol, name] = await Promise.all([symbolPromise, namePromise]);

          setTokenSymbol(symbol);
          setTokenName(name);
        } catch {
          setTokenSymbol("");
          setTokenName("");
        }
      }
      setIsLoading(false);
    })();
  }, [tokenAddress, address, isTransferLoading]);

  return {
    isMining,
    approve,
    fund,
    allowance: allowance,
    balance: balance,
    tokenSymbol: tokenSymbol,
    tokenName: tokenName,
    tokenDecimals: tokenDecimals,
    isLoading: isLoading || isPending,
  };
};
