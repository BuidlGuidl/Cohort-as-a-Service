"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { AddressInput, EtherInput } from "~~/components/scaffold-eth";
import { useApproveApplication } from "~~/hooks/useApproveApplication";
import { useRejectApplication } from "~~/hooks/useRejectApplication";

interface ApproveApplicationProps {
  applicationId: string;
  cohortAddress: string;
  builderAddress: string;
  githubUsername?: string;
  isErc20: boolean;
  tokenDecimals?: number;
}

export const ApproveApplication = ({
  applicationId,
  cohortAddress,
  builderAddress,
  githubUsername,
  isErc20,
  tokenDecimals,
}: ApproveApplicationProps) => {
  const router = useRouter();
  const [isPendingReject, setIsPendingReject] = useState(false);
  const [cap, setCap] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const {
    approveApplication,
    isPending: isPendingApprove,
    isSuccess: isSuccessApprove,
  } = useApproveApplication({
    cohortAddress,
    builderAddress,
    cap,
    isErc20,
    tokenDecimals,
    applicationId,
    githubUsername,
    note,
  });

  const { rejectApplication, isSuccess: isRejectSuccess } = useRejectApplication({
    applicationId,
    cohortAddress,
    note,
  });

  const handleApprove = () => {
    const modalCheckbox = document.getElementById("approve-builder-modal") as HTMLInputElement;
    if (modalCheckbox) {
      modalCheckbox.checked = true;
    }
  };

  const OpenRejectModal = () => {
    const modalCheckbox = document.getElementById("reject-builder-modal") as HTMLInputElement;
    if (modalCheckbox) {
      modalCheckbox.checked = true;
    }
  };

  const handleReject = async () => {
    try {
      setIsPendingReject(true);
      await rejectApplication();
    } catch (error) {
      console.error("Error rejecting application:", error);
    } finally {
      setIsPendingReject(false);
    }
  };

  useEffect(() => {
    if (isSuccessApprove || isRejectSuccess) {
      const modalCheckbox = document.getElementById("approve-builder-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }

      router.refresh();
    }
  }, [isSuccessApprove, isRejectSuccess, router]);

  return (
    <div className="flex gap-2">
      <button className="btn btn-xs btn-success" onClick={handleApprove} disabled={isPendingApprove || isPendingReject}>
        {isPendingApprove ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <Check className="h-3 w-3" />
        )}
      </button>

      <button className="btn btn-xs btn-error" onClick={OpenRejectModal}>
        {isPendingReject ? <span className="loading loading-spinner loading-xs"></span> : <X className="h-3 w-3" />}
      </button>

      {/* Modal for approving builder */}
      <input type="checkbox" id="approve-builder-modal" className="modal-toggle" />
      <label htmlFor="approve-builder-modal" className="modal cursor-pointer">
        <label className="modal-box relative bg-base-100 border border-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <p className="font-bold mb-6 flex items-center gap-1">Approve Builder</p>
          <label htmlFor="approve-builder-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Builder Address</span>
              </label>
              <AddressInput value={builderAddress} onChange={() => {}} />
            </div>

            {githubUsername && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">GitHub Username</span>
                </label>
                <input
                  type="text"
                  className="input input-sm rounded-md input-bordered border border-base-300 bg-transparent"
                  value={githubUsername}
                />
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Stream Cap</span>
              </label>
              {isErc20 ? (
                <input
                  className="input input-sm rounded-md input-bordered border border-base-300 w-full"
                  placeholder="Enter stream cap"
                  type="number"
                  onChange={e => setCap(e.target.value.toString())}
                  value={cap}
                />
              ) : (
                <EtherInput
                  value={cap}
                  onChange={value => setCap(value?.toString() || "")}
                  placeholder="Enter stream cap"
                />
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Note (optional)</span>
              </label>

              <textarea
                className="textarea textarea-sm rounded-md input-bordered border border-base-300 w-full h-36 bg-base-100"
                placeholder="Add a note "
                onChange={e => {
                  setNote((e.target as HTMLTextAreaElement).value);
                }}
                value={note}
              />
            </div>

            <button
              className="btn btn-sm btn-primary w-full mt-4"
              onClick={approveApplication}
              disabled={isPendingApprove || !cap}
            >
              {isPendingApprove ? "Processing..." : "Approve Builder"}
            </button>
          </div>
        </label>
      </label>

      <input type="checkbox" id="reject-builder-modal" className="modal-toggle" />
      <label htmlFor="reject-builder-modal" className="modal cursor-pointer">
        <label className="modal-box relative bg-base-100 border border-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <p className="font-bold mb-6 flex items-center gap-1">Reject Application</p>
          <label htmlFor="reject-builder-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Note (optional)</span>
              </label>

              <textarea
                className="textarea textarea-sm rounded-md input-bordered border border-base-300 w-full h-36 bg-base-100"
                placeholder="Reason for rejection"
                onChange={e => {
                  setNote((e.target as HTMLTextAreaElement).value);
                }}
                value={note}
              />
            </div>

            <button
              className="btn btn-sm btn-primary w-full mt-4"
              onClick={handleReject}
              disabled={isPendingApprove || isPendingReject}
            >
              {isPendingApprove ? "Processing..." : "Reject Application"}
            </button>
          </div>
        </label>
      </label>
    </div>
  );
};

export default ApproveApplication;
