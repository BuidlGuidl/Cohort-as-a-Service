"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@prisma/client";
import axios from "axios";
import { useSignMessage } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

interface DeleteProjectProps {
  cohortAddress: string;
  project: Project;
  onSuccess?: () => void;
}

export const DeleteProject = ({ project, onSuccess, cohortAddress }: DeleteProjectProps) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { data: signature, signMessage, isSuccess: isSignatureSuccess } = useSignMessage();

  const modalId = `delete-project-modal-${project.id}`;

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById(modalId) as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }

      if (onSuccess) {
        onSuccess();
      }

      setIsSuccess(false);
    }
  }, [isSuccess, modalId, onSuccess]);

  useEffect(() => {
    const deleteWithSignature = async () => {
      if (signature && isSignatureSuccess) {
        try {
          const message = `Delete project ${project.id} from cohort ${cohortAddress}`;
          await axios.delete(`/api/cohort/${cohortAddress}/project/${project.id}`, {
            data: {
              message,
              signature,
            },
          });

          setIsSuccess(true);
          notification.success("Project deleted successfully");
          router.refresh();
        } catch (error) {
          notification.error("Something went wrong");
          console.error("Error deleting project:", error);
        } finally {
          setIsPending(false);
        }
      }
    };

    deleteWithSignature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, isSignatureSuccess]);

  const handleDelete = async () => {
    try {
      setIsPending(true);
      const message = `Delete project ${project.id} from cohort ${cohortAddress}`;
      signMessage({ message });
    } catch (error) {
      console.error("Error in signature process:", error);
      setIsPending(false);
    }
  };

  return (
    <div>
      <input type="checkbox" id={modalId} className="modal-toggle" />
      <label htmlFor={modalId} className="modal cursor-pointer">
        <label className="modal-box relative bg-base-100 border border-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1 text-error">Delete project: {project.name}</div>
          <label htmlFor={modalId} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-4">
            <p>Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex flex-col gap-6 items-center">
              <button className="btn btn-sm btn-error w-full" onClick={handleDelete} disabled={isPending}>
                {isPending ? "Signing..." : "Delete Project"}
              </button>
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};

export default DeleteProject;
