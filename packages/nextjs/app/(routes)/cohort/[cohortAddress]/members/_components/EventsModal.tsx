import React from "react";
import { ApproveWithdrawal } from "./ApproveWithdrawal";
import { CompleteWithdrawal } from "./CompleteWithdrawal";
import { RejectWithdrawal } from "./RejectWithdrawal";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddress: string;
  modalView: "contributions" | "requests";
  setModalView: (view: "contributions" | "requests") => void;
  isERC20: boolean;
  tokenSymbol: string;
  filteredWithdrawnEvents: any[];
  filteredRequestEvents: any[];
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
  filteredWithdrawnEvents,
  filteredRequestEvents,
  isLoadingWithdrawEvents,
  isLoadingRequests,
  cohortAddress,
  isAdmin,
}) => {
  const { address } = useAccount();

  if (!isOpen) return null;

  return (
    <>
      <input type="checkbox" id="withdraw-events-modal" className="modal-toggle" checked={isOpen} readOnly />
      <label htmlFor="withdraw-events-modal" className="modal cursor-pointer" onClick={onClose}>
        <label className="modal-box relative max-w-4xl shadow shadow-primary" onClick={e => e.stopPropagation()}>
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
                      <div key={event.transactionHash} className="flex flex-col">
                        <div>
                          <span className="font-bold">Date: </span>
                          {new Date(Number(event.blockData.timestamp) * 1000).toISOString().split("T")[0]}
                        </div>
                        <div>
                          <span className="font-bold">Amount: </span>
                          {isERC20 ? tokenSymbol + " " : "Ξ"}
                          {formatEther(event.args[1].toString())}
                        </div>
                        <div>{event.args[2]}</div>
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
                      <div key={event.transactionHash} className="flex flex-col">
                        <div>
                          <span className="font-bold">Date: </span>
                          {new Date(Number(event.blockData.timestamp) * 1000).toISOString().split("T")[0]}
                        </div>
                        <div>
                          <span className="font-bold">Amount: </span>
                          {isERC20 ? tokenSymbol + " " : "Ξ"}
                          {formatEther(event.args.amount.toString())}
                        </div>
                        <div>
                          <span className="font-bold">Reason: </span>
                          {event.args.reason}
                        </div>
                        <div>
                          <span className="font-bold">Status: </span>
                          <span
                            className={`badge ${
                              event.status === "Completed"
                                ? "badge-success"
                                : event.status === "Approved"
                                  ? "badge-info"
                                  : "badge-warning"
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                        {isAdmin && event.status == "Pending" && (
                          <div className="flex gap-2 mt-2">
                            <ApproveWithdrawal
                              cohortAddress={cohortAddress}
                              builderAddress={event.args.builder}
                              requestId={event.args.requestId}
                            />
                            <RejectWithdrawal
                              cohortAddress={cohortAddress}
                              builderAddress={event.args.builder}
                              requestId={event.args.requestId}
                            />
                          </div>
                        )}
                        {address == event.args.builder && event.status === "Approved" && (
                          <div className="flex gap-2 mt-2">
                            <CompleteWithdrawal cohortAddress={cohortAddress} requestId={event.args.requestId} />
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
