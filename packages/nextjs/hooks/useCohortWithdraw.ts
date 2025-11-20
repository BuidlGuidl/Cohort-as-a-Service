import { useTargetNetwork } from "./scaffold-eth";
import { useTransactor } from "./scaffold-eth";
import { useQueryClient } from "@tanstack/react-query";
import { parseEther, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { baseChainId } from "~~/data/chains";
import { notification } from "~~/utils/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface useCohortWithdrawProps {
  cohortAddress: string;
  reason: string;
  amount: string;
  isErc20?: boolean;
  tokenDecimals?: number;
  selectedProjects?: string[];
}

export const useCohortWithdraw = ({
  cohortAddress,
  amount,
  reason,
  isErc20,
  tokenDecimals,
  selectedProjects = [],
}: useCohortWithdrawProps) => {
  const { chain, chainId } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const queryClient = useQueryClient();
  const cohort = contracts?.[baseChainId]["Cohort"];
  const writeTx = useTransactor();
  const { isPending, writeContractAsync, isSuccess } = useWriteContract();

  const sendContractWriteTx = async () => {
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
            functionName: "streamWithdraw",
            args: [isErc20 ? parseUnits(amount, tokenDecimals || 18) : parseEther(amount), reason, selectedProjects],
          });

        await writeTx(makeWriteWithParams);
        // Invalidate cohort data to refresh after withdrawal
        queryClient.invalidateQueries({ queryKey: ["cohortData", cohortAddress] });
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      }
    } else {
      notification.error("Contract writer error. Try again.");
      return;
    }
  };

  return {
    streamWithdraw: sendContractWriteTx,
    isPending,
    isSuccess,
  };
};
