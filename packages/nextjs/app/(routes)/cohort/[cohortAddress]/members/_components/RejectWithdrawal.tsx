import React from "react";
import { useRejectWithdrawal } from "~~/hooks/useRejectWithdrawal";

interface RejectWithdrawalProps {
  requestId: number;
  cohortAddress: string;
  builderAddress: string;
}

export const RejectWithdrawal = ({ requestId, cohortAddress, builderAddress }: RejectWithdrawalProps) => {
  const { rejectWithdrawal, isPending } = useRejectWithdrawal({
    cohortAddress,
    builderAddress,
    requestId,
  });
  return (
    <button onClick={rejectWithdrawal} disabled={isPending} className="btn btn-sm rounded-md btn-warning">
      Reject
    </button>
  );
};
