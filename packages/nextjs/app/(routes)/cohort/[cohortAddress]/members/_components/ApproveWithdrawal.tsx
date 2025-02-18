import React from "react";
import { useApproveWithdrawal } from "~~/hooks/useApproveWithdrawal";

interface ApproveWithdrawalProps {
  requestId: number;
  cohortAddress: string;
  creatorAddress: string;
}

export const ApproveWithdrawal = ({ requestId, cohortAddress, creatorAddress }: ApproveWithdrawalProps) => {
  const { approveWithdrawal, isPending } = useApproveWithdrawal({
    cohortAddress,
    creatorAddress,
    requestId,
  });
  return (
    <button onClick={approveWithdrawal} disabled={isPending} className="btn btn-sm rounded-md btn-primary">
      Approve
    </button>
  );
};
