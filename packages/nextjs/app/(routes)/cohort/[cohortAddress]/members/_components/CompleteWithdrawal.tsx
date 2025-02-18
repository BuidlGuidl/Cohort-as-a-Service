import React from "react";
import { useCompleteWithdrawal } from "~~/hooks/useCompleteWithdrawal";

interface CompleteWithdrawalProps {
  requestId: number;
  cohortAddress: string;
}

export const CompleteWithdrawal = ({ requestId, cohortAddress }: CompleteWithdrawalProps) => {
  const { completeWithdrawal, isPending } = useCompleteWithdrawal({
    cohortAddress,
    requestId,
  });
  return (
    <button onClick={completeWithdrawal} disabled={isPending} className="btn btn-sm rounded-md btn-primary">
      Complete
    </button>
  );
};
