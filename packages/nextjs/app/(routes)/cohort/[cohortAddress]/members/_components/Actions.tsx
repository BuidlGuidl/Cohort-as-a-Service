import React from "react";
import { CheckWithdrawals } from "./CheckWithdrawals";
import { RemoveCreator } from "./RemoveCreator";
import { UpdateCreator } from "./UpdateCreator";
import { EllipsisVertical } from "lucide-react";

interface ActionsProps {
  cohortAddress: string;
  creatorAddress: string;
  requiresApproval: boolean;
}

export const Actions = ({ cohortAddress, creatorAddress, requiresApproval }: ActionsProps) => {
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
            <label htmlFor={`update-creator-modal-${creatorAddress.slice(-8)}`} className="w-full">
              Update cap
            </label>
          </li>
          <li>
            <label htmlFor={`remove-creator-modal-${creatorAddress.slice(-8)}`} className="w-full">
              Remove
            </label>
          </li>
          <li>
            <label htmlFor={`check-withdrawals-modal-${creatorAddress.slice(-8)}`} className="w-full">
              {requiresApproval ? "Uncheck Withdrawals" : "Check withdrawals"}
            </label>
          </li>
        </ul>
      </div>

      <UpdateCreator cohortAddress={cohortAddress} creatorAddress={creatorAddress} />
      <RemoveCreator cohortAddress={cohortAddress} creatorAddress={creatorAddress} />
      <CheckWithdrawals
        cohortAddress={cohortAddress}
        creatorAddress={creatorAddress}
        requiresApproval={requiresApproval}
      />
    </>
  );
};
