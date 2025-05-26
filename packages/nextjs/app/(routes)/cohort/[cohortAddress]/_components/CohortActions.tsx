import React from "react";
import { DrainCohort } from "./DrainCohort";
import { FundCohort } from "./FundCohort";
import { AllowApplications } from "./ToggleAllowApplications";
import { ToggleCohortApprovalRequirement } from "./ToggleCohortApprovalRequirement";
import { LockCohort } from "./ToggleLockCohort";
import { EllipsisVertical } from "lucide-react";

interface CohortActionsProps {
  cohortAddress: string;
  isErc20: boolean;
  tokenAddress: string;
  tokenSymbol: string;
  locked: boolean;
  tokenDecimals?: number;
  requiresApproval: boolean;
  allowApplications: boolean;
}

export const CohortActions = ({
  cohortAddress,
  isErc20,
  tokenAddress,
  tokenSymbol,
  locked,
  tokenDecimals,
  requiresApproval,
  allowApplications,
}: CohortActionsProps) => {
  return (
    <>
      <div className="dropdown dropdown-end px-0 ">
        <label tabIndex={0} className="btn btn-ghost btn-sm m-1 p-0">
          <EllipsisVertical className="w-5 h-5" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 space-y-1 shadow bg-base-100 rounded-box border w-max"
        >
          <li>
            <label htmlFor={`fund-cohort-modal`} className="w-full">
              Fund cohort
            </label>
          </li>
          <li>
            <label htmlFor={`drain-cohort-modal`} className="w-full">
              Drain cohort
            </label>
          </li>
          <li>
            <label htmlFor={`lock-cohort-modal`} className="w-full">
              {locked ? "Unlock " : "Lock "} cohort
            </label>
          </li>
          <li>
            <label htmlFor={`toggle-cohort-approval-requirement-modal`} className="w-full">
              {requiresApproval ? "Allow Withdrawals" : "Require Approval"}
            </label>
          </li>
          <li>
            <label htmlFor={`allow-applications-modal`} className="w-full">
              {allowApplications ? "Disallow " : "allow "} applications
            </label>
          </li>
        </ul>
      </div>

      <FundCohort
        cohortAddress={cohortAddress}
        isErc20={isErc20}
        tokenAddress={tokenAddress}
        tokenSymbol={tokenSymbol}
        tokenDecimals={tokenDecimals}
      />
      <DrainCohort cohortAddress={cohortAddress} tokenAddress={tokenAddress} />
      <LockCohort cohortAddress={cohortAddress} locked={locked} />
      <ToggleCohortApprovalRequirement cohortAddress={cohortAddress} requiresApproval={requiresApproval} />
      <AllowApplications cohortAddress={cohortAddress} allowApplications={allowApplications} />
    </>
  );
};
