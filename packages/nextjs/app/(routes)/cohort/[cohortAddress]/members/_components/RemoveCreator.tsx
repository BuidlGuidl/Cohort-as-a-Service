"use client";

import { Trash } from "lucide-react";
import { Address } from "~~/components/scaffold-eth";
import { useRemoveCreator } from "~~/hooks/useRemoveCreator";

interface RemoveCreatorProps {
  cohortAddress: string;
  creatorAddress: string;
}

export const RemoveCreator = ({ cohortAddress, creatorAddress }: RemoveCreatorProps) => {
  const { removeCreator, isPending } = useRemoveCreator({ cohortAddress, creatorAddress });

  return (
    <div>
      <label
        htmlFor="remove-creator-modal"
        className="btn btn-ghost btn-sm px-1 rounded-full font-normal space-x-2 normal-case"
      >
        <Trash className="h-4 w-4" />
      </label>

      <input type="checkbox" id="remove-creator-modal" className="modal-toggle" />
      <label htmlFor="remove-creator-modal" className="modal cursor-pointer">
        <label className="modal-box relative shadow shadow-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1 text-error">
            Confirm removal of <Address address={creatorAddress} disableAddressLink={true} />
          </div>
          <label htmlFor="remove-creator-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <button className="btn btn-sm btn-primary w-full" onClick={removeCreator} disabled={isPending}>
                Remove Creator
              </button>
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};
