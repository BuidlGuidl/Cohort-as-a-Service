import React, { useEffect } from "react";
import { useRejectWithdrawal } from "~~/hooks/useRejectWithdrawal";

interface RejectWithdrawalProps {
  requestId: number;
  cohortAddress: string;
  builderAddress: string;
  onClose: () => void;
}

export const RejectWithdrawal = ({ requestId, cohortAddress, builderAddress, onClose }: RejectWithdrawalProps) => {
  const { rejectWithdrawal, isPending, isSuccess } = useRejectWithdrawal({
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
    <button onClick={rejectWithdrawal} disabled={isPending} className="btn btn-sm rounded-md btn-warning">
      Reject
    </button>
  );
};
