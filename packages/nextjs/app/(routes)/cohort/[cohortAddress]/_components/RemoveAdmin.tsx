"use client";

import { useEffect } from "react";
import { Trash } from "lucide-react";
import { Address } from "~~/components/scaffold-eth";
import { useRemoveAdmin } from "~~/hooks/useRemoveAdmin";

interface RemoveAdminProps {
  cohortAddress: string;
  adminAddress: string;
}

export const RemoveAdmin = ({ cohortAddress, adminAddress }: RemoveAdminProps) => {
  const { removeAdmin, isPending, isSuccess } = useRemoveAdmin({ cohortAddress, adminAddress });
  const modalId = `remove-admin-modal-${adminAddress.slice(-8)}`;

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
    <div>
      <label htmlFor={modalId} className="btn btn-ghost btn-sm px-1 rounded-full font-normal space-x-2 normal-case">
        <Trash className="h-4 w-4" />
      </label>

      <input type="checkbox" id={modalId} className="modal-toggle" />
      <label htmlFor={modalId} className="modal cursor-pointer">
        <label className="modal-box relative shadow shadow-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1 text-error">
            Confirm removal of <Address address={adminAddress} disableAddressLink={true} />
          </div>
          <label htmlFor={modalId} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <button className="btn btn-sm btn-primary w-full" onClick={removeAdmin} disabled={isPending}>
                Remove Admin
              </button>
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};
