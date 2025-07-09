"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Editor } from "~~/components/editor";
import { Preview } from "~~/components/preview";
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
  tokenSymbol?: string;
}

export const ApproveApplication = ({
  applicationId,
  cohortAddress,
  builderAddress,
  githubUsername,
  isErc20,
  tokenDecimals,
  tokenSymbol,
}: ApproveApplicationProps) => {
  const router = useRouter();
  const [isPendingReject, setIsPendingReject] = useState(false);
  const [cap, setCap] = useState<string>("");
  const [approveNote, setApproveNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  // Preview states for both modals
  const [isApproveNotePreviewing, setIsApproveNotePreviewing] = useState(false);
  const [isRejectNotePreviewing, setIsRejectNotePreviewing] = useState(false);

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
    note: approveNote,
  });

  const { rejectApplication, isSuccess: isRejectSuccess } = useRejectApplication({
    applicationId,
    cohortAddress,
    note: rejectNote,
  });

  const handleApprove = () => {
    const modalCheckbox = document.getElementById("approve-builder-modal") as HTMLInputElement;
    if (modalCheckbox) {
      modalCheckbox.checked = true;
    }
  };

  const openRejectModal = () => {
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
      // Close both modals
      const approveModalCheckbox = document.getElementById("approve-builder-modal") as HTMLInputElement;
      const rejectModalCheckbox = document.getElementById("reject-builder-modal") as HTMLInputElement;

      if (approveModalCheckbox) {
        approveModalCheckbox.checked = false;
      }
      if (rejectModalCheckbox) {
        rejectModalCheckbox.checked = false;
      }

      // Reset states
      setCap("");
      setApproveNote("");
      setRejectNote("");
      setIsApproveNotePreviewing(false);
      setIsRejectNotePreviewing(false);

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

      <button className="btn btn-xs btn-error" onClick={openRejectModal}>
        {isPendingReject ? <span className="loading loading-spinner loading-xs"></span> : <X className="h-3 w-3" />}
      </button>

      {/* Modal for approving builder */}
      <input type="checkbox" id="approve-builder-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative bg-base-100 border border-primary max-w-2xl">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-4 flex items-center gap-1">Approve Builder</div>
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
                  readOnly
                />
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Stream Cap</span>
              </label>
              {isErc20 ? (
                <div className="relative">
                  <input
                    className="input input-sm rounded-md input-bordered border border-base-300 w-full"
                    placeholder="Enter stream cap"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*(\.[0-9]+)?"
                    onChange={e => setCap(e.target.value.toString())}
                    value={cap}
                    disabled={isPendingApprove}
                  />
                  {tokenSymbol && (
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                      {tokenSymbol}
                    </span>
                  )}
                </div>
              ) : (
                <EtherInput
                  value={cap}
                  onChange={value => setCap(value?.toString() || "")}
                  placeholder="Enter stream cap"
                  disabled={isPendingApprove}
                />
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Note (optional)</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`btn btn-xs ${!isApproveNotePreviewing ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setIsApproveNotePreviewing(false)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${isApproveNotePreviewing ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setIsApproveNotePreviewing(true)}
                  >
                    Preview
                  </button>
                </div>
              </label>

              <div className="rounded-md">
                {isApproveNotePreviewing ? (
                  <div className="p-4">
                    {approveNote && approveNote !== "<p><br></p>" ? (
                      <Preview value={approveNote} />
                    ) : (
                      <p className="text-base-content/60 italic">Nothing to preview yet...</p>
                    )}
                  </div>
                ) : (
                  <Editor value={approveNote} onChange={setApproveNote} />
                )}
              </div>
            </div>

            <button
              className="btn btn-sm btn-primary w-full mt-4"
              onClick={approveApplication}
              disabled={isPendingApprove || !cap}
            >
              {isPendingApprove ? "Processing..." : "Approve Builder"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal for rejecting builder */}
      <input type="checkbox" id="reject-builder-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative bg-base-100 border border-primary max-w-2xl">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-4 flex items-center gap-1">Reject Application</div>
          <label htmlFor="reject-builder-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>

          <div className="space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Note (optional)</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`btn btn-xs ${!isRejectNotePreviewing ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setIsRejectNotePreviewing(false)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${isRejectNotePreviewing ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setIsRejectNotePreviewing(true)}
                  >
                    Preview
                  </button>
                </div>
              </label>

              <div className="rounded-md">
                {isRejectNotePreviewing ? (
                  <div className="p-4">
                    {rejectNote && rejectNote !== "<p><br></p>" ? (
                      <Preview value={rejectNote} />
                    ) : (
                      <p className="text-base-content/60 italic">Nothing to preview yet...</p>
                    )}
                  </div>
                ) : (
                  <Editor value={rejectNote} onChange={setRejectNote} />
                )}
              </div>
            </div>

            <button
              className="btn btn-sm btn-primary w-full mt-4"
              onClick={handleReject}
              disabled={isPendingApprove || isPendingReject}
            >
              {isPendingReject ? "Processing..." : "Reject Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveApplication;
