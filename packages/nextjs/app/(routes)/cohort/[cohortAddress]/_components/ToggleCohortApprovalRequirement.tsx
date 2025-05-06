"use client";

import { useEffect } from "react";
import { useToggleCohortApprovalRequirement } from "~~/hooks/useToggleCohortApprovalRequirement";

interface ToggleCohortApprovalRequirementProps {
  cohortAddress: string;
  requiresApproval: boolean;
}

export const ToggleCohortApprovalRequirement = ({
  cohortAddress,
  requiresApproval,
}: ToggleCohortApprovalRequirementProps) => {
  const { toggleCohortApprovalRequiremnt, isPending, isSuccess } = useToggleCohortApprovalRequirement({
    cohortAddress,
    requiresApproval,
  });

  const onClick = async () => {
    try {
      await toggleCohortApprovalRequiremnt();
    } catch {}
  };

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById("toggle-cohort-approval-requirement-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <>
      <input type="checkbox" id="toggle-cohort-approval-requirement-modal" className="modal-toggle" />
      <label htmlFor="toggle-cohort-approval-requirement-modal" className="modal cursor-pointer">
        <label className="modal-box relative bg-base-100 border border-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1 text-error">
            {requiresApproval ? "Allow Withdrawals" : "Require Approval"}
          </div>
          <label
            htmlFor="toggle-cohort-approval-requirement-modal"
            className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
          >
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <div className="w-full">
                Are you sure you want to{" "}
                {requiresApproval
                  ? " allow unchecked withdrawals for new builders?"
                  : " check builders' withdrawals before approval?"}
              </div>
              <button className="btn btn-sm btn-primary w-full" onClick={onClick} disabled={isPending}>
                {requiresApproval ? "Allow Withdrawals" : "Require Approval"}
              </button>
            </div>
          </div>
        </label>
      </label>
    </>
  );
};
