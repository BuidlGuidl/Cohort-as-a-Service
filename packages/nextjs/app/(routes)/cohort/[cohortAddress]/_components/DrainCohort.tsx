"use client";

import { useEffect } from "react";
import { useDrainCohort } from "~~/hooks/useDrainCohort";

interface DrainCohortProps {
  cohortAddress: string;
  tokenAddress: string;
}

export const DrainCohort = ({ cohortAddress, tokenAddress }: DrainCohortProps) => {
  const { drainCohort, isPending, isSuccess } = useDrainCohort({
    cohortAddress,
    tokenAddress,
  });

  const onClick = async () => {
    try {
      await drainCohort();
    } catch {}
  };

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById("drain-cohort-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <>
      <input type="checkbox" id="drain-cohort-modal" className="modal-toggle" />
      <label htmlFor="drain-cohort-modal" className="modal cursor-pointer">
        <label className="modal-box relative border border-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1 text-error">Drain Cohort</div>
          <label htmlFor="drain-cohort-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <div className="w-full">Are you sure you want to drain the contract?</div>
              <button className="btn btn-sm btn-primary w-full" onClick={onClick} disabled={isPending}>
                Drain
              </button>
            </div>
          </div>
        </label>
      </label>
    </>
  );
};
