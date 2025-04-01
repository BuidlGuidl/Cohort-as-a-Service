import React, { useEffect } from "react";
import { useCompleteWithdrawal } from "~~/hooks/useCompleteWithdrawal";

interface CompleteWithdrawalProps {
  requestId: number;
  cohortAddress: string;
  onClose: () => void;
}

export const CompleteWithdrawal = ({ requestId, cohortAddress, onClose }: CompleteWithdrawalProps) => {
  const { completeWithdrawal, isPending, isSuccess } = useCompleteWithdrawal({
    cohortAddress,
    requestId,
  });

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById("withdraw-events-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
        onClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <button onClick={completeWithdrawal} disabled={isPending} className="btn btn-sm rounded-md btn-primary">
      Complete
    </button>
  );
};
