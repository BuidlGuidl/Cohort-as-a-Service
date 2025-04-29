import { useEffect } from "react";
import { useTargetNetwork } from "./scaffold-eth";
import { useTransactor } from "./scaffold-eth";
import axios from "axios";
import { useAccount, useSignMessage, useWriteContract } from "wagmi";
import { baseChainId } from "~~/data/chains";
import { notification } from "~~/utils/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface useRemoveBuilderProps {
  cohortAddress: string;
  builderAddress: string;
}

export const useRemoveBuilder = ({ cohortAddress, builderAddress }: useRemoveBuilderProps) => {
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
        const message = `Remove builder ${builderAddress} from cohort ${cohortAddress}`;
        signMessage({ message });
      } catch (error) {
        console.error("Error signing message:", error);
      }

      try {
        const makeWriteWithParams = () =>
          writeContractAsync({
            abi: cohort.abi,
            address: cohortAddress,
            functionName: "removeBuilderStream",
            args: [builderAddress],
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
    const removeBuilderFromDb = async () => {
      if (signature && isSignatureSuccess && isSuccess) {
        const message = `Remove builder ${builderAddress} from cohort ${cohortAddress}`;
        try {
          await axios.delete(`/api/cohort/${cohortAddress}/builder`, {
            data: {
              message,
              signature,
              builderAddress,
            },
          });
        } catch (error) {
          notification.error("Something went wrong");
          console.error("Error removing builder from db:", error);
        }
      }
    };

    removeBuilderFromDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, isSignatureSuccess, isSuccess]);

  return {
    removeBuilder: sendContractWriteTx,
    isPending,
    isSuccess,
  };
};
