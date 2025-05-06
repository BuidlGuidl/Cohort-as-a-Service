"use client";

import { useEffect } from "react";
import { useToggleLockCohort } from "~~/hooks/useToggleLockCohort";

interface LockCohortProps {
  cohortAddress: string;
  locked: boolean;
}

export const LockCohort = ({ cohortAddress, locked }: LockCohortProps) => {
  const { toggleLockCohort, isPending, isSuccess } = useToggleLockCohort({
    cohortAddress,
    locked,
  });

  const onClick = async () => {
    try {
      await toggleLockCohort();
    } catch {}
  };

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById("lock-cohort-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <>
      <input type="checkbox" id="lock-cohort-modal" className="modal-toggle" />
      <label htmlFor="lock-cohort-modal" className="modal cursor-pointer">
        <label className="modal-box relative bg-base-100 border border-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1 text-error">{locked ? "Unlock " : "Lock "} Cohort</div>
          <label htmlFor="lock-cohort-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <div className="w-full">Are you sure you want to {locked ? " unlock" : " lock"} the cohort?</div>
              <button className="btn btn-sm btn-primary w-full" onClick={onClick} disabled={isPending}>
                {locked ? "Unlock" : "Lock"}
              </button>
            </div>
          </div>
        </label>
      </label>
    </>
  );
};
