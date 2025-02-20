"use client";

import { useEffect } from "react";
import { Address } from "~~/components/scaffold-eth";
import { useRemoveBuilder } from "~~/hooks/useRemoveBuilder";

interface RemoveBuilderProps {
  cohortAddress: string;
  builderAddress: string;
}

export const RemoveBuilder = ({ cohortAddress, builderAddress }: RemoveBuilderProps) => {
  const modalId = `remove-builder-modal-${builderAddress.slice(-8)}`;
  const { removeBuilder, isPending, isSuccess } = useRemoveBuilder({ cohortAddress, builderAddress });

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
        <label className="modal-box relative shadow shadow-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1 text-error">
            Confirm removal of <Address address={builderAddress} disableAddressLink={true} />
          </div>
          <label htmlFor={modalId} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <button className="btn btn-sm btn-primary w-full" onClick={removeBuilder} disabled={isPending}>
                Remove Builder
              </button>
            </div>
          </div>
        </label>
      </label>
    </>
  );
};
