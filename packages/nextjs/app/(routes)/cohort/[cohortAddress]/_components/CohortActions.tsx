import React from "react";
import { FundCohort } from "./FundCohort";
import { EllipsisVertical } from "lucide-react";

interface CohortActionsProps {
  cohortAddress: string;
  isErc20: boolean;
  tokenAddress: string;
  tokenSymbol: string;
}

export const CohortActions = ({ cohortAddress, isErc20, tokenAddress, tokenSymbol }: CohortActionsProps) => {
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
            <label htmlFor={`fund-cohort-modal`} className="w-full">
              Fund cohort
            </label>
          </li>
        </ul>
      </div>

      <FundCohort
        cohortAddress={cohortAddress}
        isErc20={isErc20}
        tokenAddress={tokenAddress}
        tokenSymbol={tokenSymbol}
      />
    </>
  );
};
