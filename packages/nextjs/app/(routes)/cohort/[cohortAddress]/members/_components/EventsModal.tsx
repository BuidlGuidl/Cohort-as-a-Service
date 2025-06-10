import React from "react";
import { ApproveWithdrawal } from "./ApproveWithdrawal";
import { CompleteWithdrawal } from "./CompleteWithdrawal";
import { RejectWithdrawal } from "./RejectWithdrawal";
import { formatEther, formatUnits } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { WithdrawEvent, WithdrawRequest } from "~~/hooks/useWithdrawEvents";

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddress: string;
  modalView: "contributions" | "requests";
  setModalView: (view: "contributions" | "requests") => void;
  isERC20: boolean;
  tokenSymbol: string;
  tokenDecimals?: number;
  filteredWithdrawnEvents: WithdrawEvent[];
  filteredRequestEvents: WithdrawRequest[];
  isLoadingWithdrawEvents: boolean;
  isLoadingRequests: boolean;
  cohortAddress: string;
  isAdmin: boolean;
}

export const EventsModal: React.FC<EventsModalProps> = ({
  isOpen,
  onClose,
  selectedAddress,
  modalView,
  setModalView,
  isERC20,
  tokenSymbol,
  tokenDecimals = 18,
  filteredWithdrawnEvents,
  filteredRequestEvents,
  isLoadingWithdrawEvents,
  isLoadingRequests,
  cohortAddress,
  isAdmin,
}) => {
  const { address } = useAccount();

  if (!isOpen) return null;

  const formatAmount = (amount: string) => {
    if (isERC20) {
      return formatUnits(BigInt(amount), tokenDecimals);
    }
    return formatEther(BigInt(amount));
  };

  const formatDate = (timestamp: string) => {
    return new Date(Number(timestamp) * 1000).toISOString().split("T")[0];
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "badge-success";
      case "approved":
        return "badge-info";
      case "rejected":
        return "badge-error";
      default:
        return "badge-warning";
    }
  };

  return (
    <>
      <input type="checkbox" id="withdraw-events-modal" className="modal-toggle" checked={isOpen} readOnly />
      <label htmlFor="withdraw-events-modal" className="modal cursor-pointer " onClick={onClose}>
        <label
          className="modal-box relative bg-base-100 max-w-4xl border border-primary"
          onClick={e => e.stopPropagation()}
        >
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="text-xl font-bold mb-2">
            <p className="mb-1">{modalView === "contributions" ? "Contributions" : "Requests"}</p>
            <Address address={selectedAddress} />
          </h3>
          <label className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3" onClick={onClose}>
            ✕
          </label>

          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setModalView("contributions")}
              className={`btn btn-sm ${modalView === "contributions" ? "btn-primary" : "btn-outline"}`}
            >
              Contributions
            </button>
            <button
              onClick={() => setModalView("requests")}
              className={`btn btn-sm ${modalView === "requests" ? "btn-primary" : "btn-outline"}`}
            >
              Requests
            </button>
          </div>

          <div className="space-y-3">
            {modalView === "contributions" ? (
              <ul>
                {isLoadingWithdrawEvents ? (
                  <div>
                    <div className="text-4xl animate-bounce mb-2">👾</div>
                    <div className="text-lg">Loading...</div>
                  </div>
                ) : filteredWithdrawnEvents?.length > 0 ? (
                  <div className="flex flex-col">
                    {filteredWithdrawnEvents?.map(event => (
                      <div key={event.id} className="flex flex-col">
                        <div>
                          <span className="font-bold">Date: </span>
                          {formatDate(event.timestamp)}
                        </div>
                        <div>
                          <span className="font-bold">Amount: </span>
                          {isERC20 ? tokenSymbol + " " : "Ξ"}
                          {formatAmount(event.amount)}
                        </div>
                        <div>
                          <span className="font-bold">Reason: </span>
                          {event.reason}
                        </div>
                        <div>
                          <span className="font-bold">Transaction: </span>
                          <a
                            href={`https://etherscan.io/tx/${event.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            {event.transactionHash.slice(0, 10)}...
                          </a>
                        </div>
                        <hr className="my-8" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No contributions</p>
                )}
              </ul>
            ) : (
              <ul>
                {isLoadingRequests ? (
                  <div>
                    <div className="text-4xl animate-bounce mb-2">👾</div>
                    <div className="text-lg">Loading...</div>
                  </div>
                ) : filteredRequestEvents?.length > 0 ? (
                  <div className="flex flex-col">
                    {filteredRequestEvents?.map(event => (
                      <div key={event.id} className="flex flex-col">
                        <div>
                          <span className="font-bold">Date: </span>
                          {formatDate(event.requestTime)}
                        </div>
                        <div>
                          <span className="font-bold">Amount: </span>
                          {isERC20 ? tokenSymbol + " " : "Ξ"}
                          {formatAmount(event.amount)}
                        </div>
                        <div>
                          <span className="font-bold">Reason: </span>
                          {event.reason}
                        </div>
                        <div>
                          <span className="font-bold">Status: </span>
                          <span className={`badge ${getStatusBadgeClass(event.status)}`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </div>
                        {isAdmin && event.status.toLowerCase() === "pending" && (
                          <div className="flex gap-2 mt-2">
                            <ApproveWithdrawal
                              cohortAddress={cohortAddress}
                              builderAddress={event.builderAddress}
                              requestId={Number(event.requestId)}
                              onClose={onClose}
                            />
                            <RejectWithdrawal
                              cohortAddress={cohortAddress}
                              builderAddress={event.builderAddress}
                              requestId={Number(event.requestId)}
                              onClose={onClose}
                            />
                          </div>
                        )}
                        {address?.toLowerCase() === event.builderAddress.toLowerCase() &&
                          event.status.toLowerCase() === "approved" && (
                            <div className="flex gap-2 mt-2">
                              <CompleteWithdrawal
                                cohortAddress={cohortAddress}
                                requestId={Number(event.requestId)}
                                onClose={onClose}
                              />
                            </div>
                          )}
                        <hr className="my-8" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No requests</p>
                )}
              </ul>
            )}
          </div>
        </label>
      </label>
    </>
  );
};
