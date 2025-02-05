import { useTargetNetwork } from "./scaffold-eth";
import { useTransactor } from "./scaffold-eth";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface useUpdateCreatorProps {
  cohortAddress: string;
  creatorAddress: string;
  cap: string;
}

export const useUpdateCreator = ({ cohortAddress, cap, creatorAddress }: useUpdateCreatorProps) => {
  const { chain, chainId } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const cohort = contracts?.[84532]["Cohort"];
  const writeTx = useTransactor();
  const { isPending, writeContractAsync } = useWriteContract();

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
            functionName: "updateCreatorFlowCapCycle",
            args: [creatorAddress, parseEther(cap)],
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

  return {
    updateCreator: sendContractWriteTx,
    isPending,
  };
};
