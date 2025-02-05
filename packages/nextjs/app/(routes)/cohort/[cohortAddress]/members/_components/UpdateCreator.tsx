"use client";

import { useState } from "react";
import { Pen } from "lucide-react";
import { Address } from "~~/components/scaffold-eth";
import { useUpdateCreator } from "~~/hooks/useUpdateCreator";

interface UpdateCreatorProps {
  cohortAddress: string;
  creatorAddress: string;
}

export const UpdateCreator = ({ cohortAddress, creatorAddress }: UpdateCreatorProps) => {
  const [cap, setCap] = useState("");
  const { updateCreator, isPending } = useUpdateCreator({ cohortAddress, creatorAddress, cap });
  return (
    <div>
      <label
        htmlFor="update-creator-modal"
        className="btn btn-ghost btn-sm px-1 rounded-full font-normal space-x-2 normal-case"
      >
        <Pen className="h-4 w-4" />
      </label>

      <input type="checkbox" id="update-creator-modal" className="modal-toggle" />
      <label htmlFor="update-creator-modal" className="modal cursor-pointer">
        <label className="modal-box relative shadow shadow-primary">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1">
            Update cap for <Address address={creatorAddress} disableAddressLink={true} />
          </div>
          <label htmlFor="update-creator-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <input
                type="number"
                className="input input-sm rounded-md input-bordered border border-base-300 w-full"
                placeholder="New cap"
                disabled={isPending}
                onChange={e => setCap(e.target.value.toString())}
              />
              <button className="btn btn-sm btn-primary w-full" onClick={updateCreator}>
                Update cap
              </button>
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};
