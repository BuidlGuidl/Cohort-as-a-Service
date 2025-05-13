// hooks/useRejectApplication.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSignMessage } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

interface UseRejectApplicationProps {
  applicationId: string;
  cohortAddress: string;
}

export const useRejectApplication = ({ applicationId, cohortAddress }: UseRejectApplicationProps) => {
  const { data: signature, signMessage, isSuccess: isSignatureSuccess } = useSignMessage();
  const router = useRouter();

  const rejectApplication = async () => {
    try {
      const message = `Reject application ${applicationId} for cohort ${cohortAddress}`;
      signMessage({ message });
    } catch (error) {
      console.error("Error in signature process:", error);
      throw error;
    }
  };

  useEffect(() => {
    const submitWithSignature = async () => {
      if (signature && isSignatureSuccess) {
        try {
          const message = `Reject application ${applicationId} for cohort ${cohortAddress}`;
          await axios.patch(`/api/cohort/${cohortAddress}/admin/application/${applicationId}`, {
            status: "REJECTED",
            message,
            signature,
          });

          notification.success("Application rejected");
          router.refresh();
        } catch (error) {
          notification.error("Something went wrong");
          console.error("Error rejecting application:", error);
        }
      }
    };

    submitWithSignature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, isSignatureSuccess]);

  return {
    rejectApplication,
    isPending: false, // We handle the pending state in the component
    isSuccess: isSignatureSuccess,
  };
};

export default useRejectApplication;
