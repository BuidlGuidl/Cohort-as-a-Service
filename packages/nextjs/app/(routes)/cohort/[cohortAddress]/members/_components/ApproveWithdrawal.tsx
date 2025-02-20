import React from "react";
import { useApproveWithdrawal } from "~~/hooks/useApproveWithdrawal";

interface ApproveWithdrawalProps {
  requestId: number;
  cohortAddress: string;
  builderAddress: string;
}

export const ApproveWithdrawal = ({ requestId, cohortAddress, builderAddress }: ApproveWithdrawalProps) => {
  const { approveWithdrawal, isPending } = useApproveWithdrawal({
    cohortAddress,
    builderAddress,
    requestId,
  });
  return (
    <button onClick={approveWithdrawal} disabled={isPending} className="btn btn-sm rounded-md btn-primary">
      Approve
    </button>
  );
};
