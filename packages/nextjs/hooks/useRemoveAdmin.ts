import { useEffect } from "react";
import { useTargetNetwork } from "./scaffold-eth";
import { useTransactor } from "./scaffold-eth";
import axios from "axios";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { useSignMessage } from "wagmi";
import { baseChainId } from "~~/data/chains";
import { notification } from "~~/utils/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface useRemoveAdminProps {
  cohortAddress: string;
  adminAddress: string;
}

export const useRemoveAdmin = ({ cohortAddress, adminAddress }: useRemoveAdminProps) => {
  const { chain, chainId } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const cohort = contracts?.[baseChainId]["Cohort"];
  const writeTx = useTransactor();
  const { isPending, writeContractAsync, isSuccess } = useWriteContract();

  const { data: signature, signMessage, isSuccess: isSignatureSuccess } = useSignMessage();

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
        const message = `Remove ${adminAddress} from the admins of cohort ${cohortAddress}`;
        signMessage({ message });
      } catch (error) {
        console.error("Error signing message:", error);
      }

      try {
        const makeWriteWithParams = () =>
          writeContractAsync({
            abi: cohort.abi,
            address: cohortAddress,
            functionName: "modifyAdminRole",
            args: [adminAddress, false],
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
    const addAdminToDb = async () => {
      if (signature && isSignatureSuccess && isSuccess) {
        const message = `Remove ${adminAddress} from the admins of cohort ${cohortAddress}`;
        try {
          await axios.patch(`/api/cohort/${cohortAddress}/admin`, {
            action: "remove",
            adminAddress,
            message,
            signature,
          });
        } catch (error) {
          notification.error("Something went wrong");
          console.error("Error adding admin to db:", error);
        }
      }
    };

    addAdminToDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, isSignatureSuccess, isSuccess]);

  return {
    removeAdmin: sendContractWriteTx,
    isPending,
    isSuccess,
  };
};
