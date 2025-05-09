import React from "react";
import { CheckWithdrawals } from "./CheckWithdrawals";
import { EditGithub } from "./EditGithub";
import { RemoveBuilder } from "./RemoveBuilder";
import { UpdateBuilder } from "./UpdateBuilder";
import { Builder } from "@prisma/client";
import { EllipsisVertical } from "lucide-react";

interface AdminActionsProps {
  cohortAddress: string;
  builderAddress: string;
  requiresApproval: boolean;
  isErc20: boolean;
  tokenDecimals?: number;
  dbBuilder?: Builder;
}

export const AdminActions = ({
  cohortAddress,
  builderAddress,
  requiresApproval,
  isErc20,
  tokenDecimals,
  dbBuilder,
}: AdminActionsProps) => {
  return (
    <>
      <div className="dropdown dropdown-start">
        <label tabIndex={0} className="btn btn-ghost btn-sm m-1">
          <EllipsisVertical className="w-5 h-5" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 space-y-1 shadow bg-base-100 rounded-box border w-max"
        >
          <li>
            <label htmlFor={`update-builder-modal-${builderAddress.slice(-8)}`} className="w-full">
              Update cap
            </label>
          </li>
          <li>
            <label htmlFor={`remove-builder-modal-${builderAddress.slice(-8)}`} className="w-full">
              Remove
            </label>
          </li>
          <li>
            <label htmlFor={`check-withdrawals-modal-${builderAddress.slice(-8)}`} className="w-full">
              {requiresApproval ? "Uncheck Withdrawals" : "Check withdrawals"}
            </label>
          </li>
          <li>
            <label htmlFor={`edit-github-modal-${dbBuilder?.id}`} className="w-full">
              Edit Github Username
            </label>
          </li>
        </ul>
      </div>

      <UpdateBuilder
        cohortAddress={cohortAddress}
        builderAddress={builderAddress}
        isErc20={isErc20}
        tokenDecimals={tokenDecimals}
      />
      <RemoveBuilder cohortAddress={cohortAddress} builderAddress={builderAddress} />
      <CheckWithdrawals
        cohortAddress={cohortAddress}
        builderAddress={builderAddress}
        requiresApproval={requiresApproval}
      />
      <EditGithub builder={dbBuilder} />
    </>
  );
};
