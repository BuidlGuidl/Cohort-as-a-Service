import React from "react";
import { EditGithub } from "./EditGithub";
import { Builder } from "@prisma/client";
import { EllipsisVertical } from "lucide-react";

interface BuilderActionsProps {
  dbBuilder?: Builder;
}

export const BuilderActions = ({ dbBuilder }: BuilderActionsProps) => {
  return (
    <>
      <div className="dropdown dropdown-start">
        <label tabIndex={0} className="btn btn-ghost btn-sm m-1 p-0">
          <EllipsisVertical className="w-5 h-5" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 space-y-1 shadow bg-base-100 rounded-box border w-max"
        >
          <li>
            <label htmlFor={`edit-github-modal-${dbBuilder?.id}`} className="w-full">
              Edit Github Username
            </label>
          </li>
        </ul>
      </div>

      <EditGithub builder={dbBuilder} />
    </>
  );
};
