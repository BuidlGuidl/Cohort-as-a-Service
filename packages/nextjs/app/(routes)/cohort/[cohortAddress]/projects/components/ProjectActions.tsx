"use client";

import React from "react";
import DeleteProject from "./DeleteProject";
import EditProject from "./EditProject";
import { Project } from "@prisma/client";
import { EllipsisVertical } from "lucide-react";

interface ProjectActionsProps {
  cohortAddress: string;
  project: Project;
}

export const ProjectActions = ({ project, cohortAddress }: ProjectActionsProps) => {
  return (
    <>
      <div className="dropdown dropdown-start">
        <label tabIndex={0} className="btn btn-ghost btn-sm m-1 p-0">
          <EllipsisVertical className="w-5 h-5" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[20] menu p-2 space-y-1 shadow bg-base-100 rounded-box border w-max"
        >
          <li>
            <label htmlFor={`edit-project-modal-${project.id}`} className="w-full">
              Edit Project
            </label>
          </li>
          <li>
            <label htmlFor={`delete-project-modal-${project.id}`} title="Delete project" className="w-full">
              Delete
            </label>
          </li>
        </ul>
      </div>

      <EditProject project={project} cohortAddress={cohortAddress} />
      <DeleteProject project={project} cohortAddress={cohortAddress} />
    </>
  );
};
