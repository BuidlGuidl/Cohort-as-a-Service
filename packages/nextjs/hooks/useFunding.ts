import { useEffect, useState } from "react";
import { readContract, simulateContract, writeContract } from "@wagmi/core";
import { formatEther, parseEther } from "viem";
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
}

export const useFunding = ({ tokenAddress, amount, isTransferLoading, cohortAddress, isErc20 }: useFundingProps) => {
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
      const { request } = await simulateContract(wagmiConfig, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [cohortAddress, BigInt(amount * 1.000001 * 1_000_000_000_000_000_000)],
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
        const makeWriteWithParams = () =>
          writeContractAsync({
            abi: cohort.abi,
            address: cohortAddress,
            functionName: "fundContract",
            args: [BigInt(amount * 1_000_000_000_000_000_000)],
            value: parseEther(isErc20 ? "0" : amount.toString()),
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
          setAllowance(parseFloat(formatEther(data)));
        } catch {
          setAllowance(undefined);
        }
      }
      if (updateAllowance) setUpdateAllowance(false);
      setIsLoading(false);
    })();
  }, [tokenAddress, address, isMining, updateAllowance, isTransferLoading, cohortAddress, isErc20]);

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
          setBalance(parseFloat(formatEther(data)));
        } catch {
          setBalance(undefined);
        }
      }
    })();
    setIsLoading(false);
  }, [tokenAddress, address, isMining, isTransferLoading]);

  useEffect(() => {
    (async () => {
      if (tokenAddress && tokenAddress != "" && address && !isTransferLoading) {
        setTokenSymbol("");
        setTokenName("");
        setIsLoading(true);
        try {
          const symbol = await readContract(wagmiConfig, {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "symbol",
          });
          setTokenSymbol(symbol);

          const name = await readContract(wagmiConfig, {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "name",
          });
          setTokenName(name);
        } catch {
          setTokenSymbol("");
          setTokenName("");
        }
      }
      setIsLoading(false);
    })();
  }, [tokenAddress, address, isMining, isTransferLoading]);

  return {
    isMining,
    approve,
    fund,
    allowance: allowance,
    balance: balance,
    tokenSymbol: tokenSymbol,
    tokenName: tokenName,
    isLoading: isLoading || isPending,
  };
};
