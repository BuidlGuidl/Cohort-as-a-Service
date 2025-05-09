"use client";

import { useEffect } from "react";
import { useToggleAllowApplications } from "~~/hooks/useToggleAllowApplications";

interface AllowApplicationsProps {
  cohortAddress: string;
  allowApplications: boolean;
}

export const AllowApplications = ({ cohortAddress, allowApplications }: AllowApplicationsProps) => {
  const { toggleAllowApplications, isPending, isSuccess } = useToggleAllowApplications({
    cohortAddress,
    allowApplications: allowApplications,
  });

  const onClick = async () => {
    try {
      await toggleAllowApplications();
    } catch {}
  };

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById("allow-applications-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <>
      <input type="checkbox" id="allow-applications-modal" className="modal-toggle" />
      <label htmlFor="allow-applications-modal" className="modal cursor-pointer">
        <label className="modal-box relative bg-base-100 border border-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1 text-error">
            {allowApplications ? "Disallow " : "Allow "} Applications
          </div>
          <label htmlFor="allow-applications-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <div className="w-full">
                Are you sure you want to {allowApplications ? " disallow" : " allow"} builder applications to this
                cohort?
              </div>
              <button className="btn btn-sm btn-primary w-full" onClick={onClick} disabled={isPending}>
                {allowApplications ? "Disallow" : "Allow"}
              </button>
            </div>
          </div>
        </label>
      </label>
    </>
  );
};
