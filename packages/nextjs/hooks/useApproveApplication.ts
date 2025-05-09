// hooks/useApproveApplication.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTargetNetwork } from "./scaffold-eth";
import { useTransactor } from "./scaffold-eth";
import axios from "axios";
import { parseEther, parseUnits } from "viem";
import { useAccount, useSignMessage, useWriteContract } from "wagmi";
import { baseChainId } from "~~/data/chains";
import { notification } from "~~/utils/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface useApproveApplicationProps {
  cohortAddress: string;
  builderAddress: string;
  cap: string;
  isErc20: boolean;
  tokenDecimals?: number;
  applicationId: string;
  githubUsername?: string;
}

export const useApproveApplication = ({
  cohortAddress,
  builderAddress,
  cap,
  isErc20,
  tokenDecimals,
  applicationId,
  githubUsername,
}: useApproveApplicationProps) => {
  const router = useRouter();
  const { chain, chainId } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const [contractSuccess, setContractSuccess] = useState(false);

  const { data: signature, signMessage, isSuccess: isSignatureSuccess } = useSignMessage();

  const cohort = contracts?.[baseChainId]["Cohort"];
  const writeTx = useTransactor();
  const { isPending, writeContractAsync, isSuccess } = useWriteContract();

  const approveApplication = async () => {
    if (!cap || cap === "0") {
      notification.error("Please enter a valid cap amount");
      return;
    }

    if (!chain) {
      notification.error("Please connect your wallet");
      return;
    }

    if (chainId !== targetNetwork.id) {
      notification.error("You are on the wrong network");
      return;
    }

    if (cohort && cohortAddress && builderAddress) {
      try {
        const message = `Approve application ${applicationId} for cohort ${cohortAddress}`;
        signMessage({ message });
      } catch (error) {
        console.error("Error signing message:", error);
      }
    } else {
      notification.error("Contract error. Please try again.");
      return;
    }
  };

  useEffect(() => {
    const executeContractWrite = async () => {
      if (signature && isSignatureSuccess && cohort && cohortAddress && builderAddress && cap) {
        try {
          const formattedCap = isErc20 ? parseUnits(cap, tokenDecimals || 18) : parseEther(cap);

          const makeWriteWithParams = () =>
            writeContractAsync({
              abi: cohort.abi,
              address: cohortAddress,
              functionName: "addBuilderStream",
              args: [builderAddress, formattedCap],
            });

          await writeTx(makeWriteWithParams);
          setContractSuccess(true);
        } catch (e: any) {
          const message = getParsedError(e);
          notification.error(message);
        }
      }
    };

    executeContractWrite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, isSignatureSuccess]);

  useEffect(() => {
    const updateApplicationInDb = async () => {
      if (signature && isSignatureSuccess && isSuccess && contractSuccess) {
        const message = `Approve application ${applicationId} for cohort ${cohortAddress}`;
        try {
          // First, update application status to approved
          await axios.patch(`/api/cohort/${cohortAddress}/admin/application/${applicationId}`, {
            status: "APPROVED",
            message,
            signature,
          });

          // Then, add the builder to the database
          await axios.post(`/api/cohort/${cohortAddress}/builder`, {
            builderAddresses: [builderAddress],
            builderGithubUsernames: githubUsername ? [githubUsername] : undefined,
            message,
            signature,
          });

          notification.success("Builder approved");
          router.refresh();
        } catch (error) {
          notification.error("Something went wrong ");
          console.error("Error updating application in database:", error);
        }
      }
    };

    updateApplicationInDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, contractSuccess]);

  return {
    approveApplication,
    isPending,
    isSuccess: isSuccess && contractSuccess,
  };
};

export default useApproveApplication;
