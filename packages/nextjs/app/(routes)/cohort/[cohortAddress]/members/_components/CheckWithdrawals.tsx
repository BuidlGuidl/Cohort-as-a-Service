"use client";

import { useEffect } from "react";
import { Address } from "~~/components/scaffold-eth";
import { useCheckWithdrawals } from "~~/hooks/useCheckWithdrawals";

interface CheckWithdrawalsProps {
  cohortAddress: string;
  builderAddress: string;
  requiresApproval: boolean;
}

export const CheckWithdrawals = ({ cohortAddress, builderAddress, requiresApproval }: CheckWithdrawalsProps) => {
  const modalId = `check-withdrawals-modal-${builderAddress.slice(-8)}`;

  const { checkWithdrawal, isPending, isSuccess } = useCheckWithdrawals({
    cohortAddress,
    builderAddress,
    requiresApproval,
  });

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById(modalId) as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <>
      <input type="checkbox" id={modalId} className="modal-toggle" />
      <label htmlFor={modalId} className="modal cursor-pointer">
        <label className="modal-box relative border border-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1 text-error">
            Update approval requirement for <Address address={builderAddress} disableAddressLink={true} />
          </div>
          <label htmlFor={modalId} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <button className="btn btn-sm btn-primary w-full" onClick={checkWithdrawal} disabled={isPending}>
                {requiresApproval ? "Remove approval requirement for withdrawal" : "Require approval for withdrawal"}
              </button>
            </div>
          </div>
        </label>
      </label>
    </>
  );
};
