import React, { useEffect } from "react";
import { useApproveWithdrawal } from "~~/hooks/useApproveWithdrawal";

interface ApproveWithdrawalProps {
  requestId: number;
  cohortAddress: string;
  builderAddress: string;
  onClose: () => void;
}

export const ApproveWithdrawal = ({ requestId, cohortAddress, builderAddress, onClose }: ApproveWithdrawalProps) => {
  const { approveWithdrawal, isPending, isSuccess } = useApproveWithdrawal({
    cohortAddress,
    builderAddress,
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
    <button onClick={approveWithdrawal} disabled={isPending} className="btn btn-sm rounded-md btn-primary">
      Approve
    </button>
  );
};
