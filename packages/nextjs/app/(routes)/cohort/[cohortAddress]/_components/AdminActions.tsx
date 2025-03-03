"use client";

import React from "react";
import { RemoveAdmin } from "./RemoveAdmin";
import { EllipsisVertical } from "lucide-react";

interface AdminActionsProps {
  cohortAddress: string;
  adminAddress: string;
}

export const AdminActions = ({ cohortAddress, adminAddress }: AdminActionsProps) => {
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
            <label htmlFor={`remove-admin-modal-${adminAddress.slice(-8)}`} className="w-full">
              Remove
            </label>
          </li>
        </ul>
      </div>

      <RemoveAdmin cohortAddress={cohortAddress} adminAddress={adminAddress} />
    </>
  );
};
