import React from "react";
import { useRejectWithdrawal } from "~~/hooks/useRejectWithdrawal";

interface RejectWithdrawalProps {
  requestId: number;
  cohortAddress: string;
  creatorAddress: string;
}

export const RejectWithdrawal = ({ requestId, cohortAddress, creatorAddress }: RejectWithdrawalProps) => {
  const { rejectWithdrawal, isPending } = useRejectWithdrawal({
    cohortAddress,
    creatorAddress,
    requestId,
  });
  return (
    <button onClick={rejectWithdrawal} disabled={isPending} className="btn btn-sm rounded-md btn-warning">
      Reject
    </button>
  );
};
