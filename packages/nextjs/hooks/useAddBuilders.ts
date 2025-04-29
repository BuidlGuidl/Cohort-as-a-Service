import { useEffect } from "react";
import { useTargetNetwork } from "./scaffold-eth";
import { useTransactor } from "./scaffold-eth";
import axios from "axios";
import { parseEther, parseUnits } from "viem";
import { useAccount, useSignMessage, useWriteContract } from "wagmi";
import { baseChainId } from "~~/data/chains";
import { notification } from "~~/utils/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface useAddBuildersProps {
  cohortAddress: string;
  builderAddresses: string[];
  caps: string[];
  isErc20: boolean;
  tokenDecimals?: number;
  githubUsernames?: string[];
}

export const useAddBuilders = ({
  cohortAddress,
  builderAddresses,
  caps,
  isErc20,
  tokenDecimals,
  githubUsernames,
}: useAddBuildersProps) => {
  const { chain, chainId } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const { data: signature, signMessage, isSuccess: isSignatureSuccess } = useSignMessage();

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
        const message = `Add builder to cohort ${cohortAddress}`;
        signMessage({ message });
      } catch (error) {
        console.error("Error signing message:", error);
      }

      try {
        const formattedCaps = caps.map(cap => (isErc20 ? parseUnits(cap, tokenDecimals || 18) : parseEther(cap)));

        const makeWriteWithParams = () =>
          writeContractAsync({
            abi: cohort.abi,
            address: cohortAddress,
            functionName: "addBatch",
            args: [builderAddresses, formattedCaps],
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
    const addBuildersToDb = async () => {
      if (signature && isSignatureSuccess && isSuccess) {
        const message = `Add builder to cohort ${cohortAddress}`;
        try {
          await axios.post(`/api/cohort/${cohortAddress}/builder`, {
            builderAddresses,
            builderGithubUsernames: githubUsernames,
            message,
            signature,
          });
        } catch (error) {
          notification.error("Something went wrong");
          console.error("Error adding builder to db:", error);
        }
      }
    };

    addBuildersToDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, isSignatureSuccess, isSuccess]);

  return {
    addBatch: sendContractWriteTx,
    isPending,
    isSuccess,
  };
};
