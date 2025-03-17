import { useTargetNetwork } from "./scaffold-eth";
import { useTransactor } from "./scaffold-eth";
import { parseEther, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { baseChainId } from "~~/data/chains";
import { notification } from "~~/utils/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface useUpdateBuilderProps {
  cohortAddress: string;
  builderAddress: string;
  cap: string;
  isErc20: boolean;
  tokenDecimals?: number;
}

export const useUpdateBuilder = ({
  cohortAddress,
  cap,
  builderAddress,
  isErc20,
  tokenDecimals,
}: useUpdateBuilderProps) => {
  const { chain, chainId } = useAccount();
  const { targetNetwork } = useTargetNetwork();
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
            functionName: "updateBuilderStreamCap",
            args: [builderAddress, isErc20 ? parseUnits(cap, tokenDecimals || 18) : parseEther(cap)],
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
    updateBuilder: sendContractWriteTx,
    isPending,
    isSuccess,
  };
};
