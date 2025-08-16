import React from "react";
import { ApproveWithdrawal } from "./ApproveWithdrawal";
import { CompleteWithdrawal } from "./CompleteWithdrawal";
import { RejectWithdrawal } from "./RejectWithdrawal";
import { Project } from "@prisma/client";
import { Github, Globe } from "lucide-react";
import { formatEther, formatUnits } from "viem";
import { useAccount } from "wagmi";
import { EmptyEventsState } from "~~/components/Empty-states";
import { ShimmerBlock } from "~~/components/Skeletons";
import { Preview } from "~~/components/preview";
import { Address } from "~~/components/scaffold-eth";
import { WithdrawalEvent, WithdrawalRequest } from "~~/hooks/useWithdrawEvents";

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddress: string;
  modalView: "contributions" | "requests";
  setModalView: (view: "contributions" | "requests") => void;
  isERC20: boolean;
  tokenSymbol: string;
  tokenDecimals?: number;
  filteredWithdrawnEvents: WithdrawalEvent[];
  filteredRequestEvents: WithdrawalRequest[];
  isLoadingWithdrawEvents: boolean;
  isLoadingRequests: boolean;
  cohortAddress: string;
  isAdmin: boolean;
  projects?: Project[];
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
  projects,
}) => {
  const { address } = useAccount();

  const getProjectsFromIds = (projectIds: string[]) => {
    if (!projects || !projectIds) return [];
    return projectIds.map(id => projects.find(project => project.id === id)).filter(Boolean) as Project[];
  };

  const getProjectLink = (project: Project) => {
    if (project.websiteUrl) {
      return { url: project.websiteUrl, icon: Globe, label: "Website" };
    }
    if (project.githubUrl) {
      return { url: project.githubUrl, icon: Github, label: "GitHub" };
    }
    return null;
  };

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

  return (
    <>
      <input type="checkbox" id="withdraw-events-modal" className="modal-toggle" checked={isOpen} readOnly />
      <label htmlFor="withdraw-events-modal" className="modal cursor-pointer " onClick={onClose}>
        <label
          className="modal-box relative bg-base-100 max-w-4xl border border-primary"
          onClick={e => e.stopPropagation()}
        >
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
                  <div className="space-y-4">
                    <ShimmerBlock className="h-20 w-full" />
                    <ShimmerBlock className="h-20 w-full" />
                    <ShimmerBlock className="h-20 w-full" />
                  </div>
                ) : filteredWithdrawnEvents?.length > 0 ? (
                  <div className="flex flex-col">
                    {filteredWithdrawnEvents?.map(event => {
                      const relatedProjects = getProjectsFromIds(event.projectIds);

                      return (
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
                          Reason:
                          <Preview value={event.reason} fontSize={16} />
                          {relatedProjects.length > 0 && (
                            <div className="mt-1">
                              <span className="font-bold mb-2 block">Related Projects:</span>
                              <div className="flex flex-wrap gap-2">
                                {relatedProjects.map(project => {
                                  const linkInfo = getProjectLink(project);

                                  return linkInfo ? (
                                    <a
                                      key={project.id}
                                      href={linkInfo.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-3 py-2 bg-base-100 rounded-lg border border-base-300 hover:bg-primary transition-colors cursor-pointer"
                                      title={`Open ${linkInfo.label}`}
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{project.name}</div>
                                      </div>
                                      <linkInfo.icon size={14} />
                                    </a>
                                  ) : (
                                    <div
                                      key={project.id}
                                      className="flex items-center gap-2 px-3 py-2 bg-base-100 rounded-lg border border-base-300"
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{project.name}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <hr className="my-8" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyEventsState type="transactions" />
                )}
              </ul>
            ) : (
              <ul>
                {isLoadingRequests ? (
                  <div className="space-y-4">
                    <ShimmerBlock className="h-20 w-full" />
                    <ShimmerBlock className="h-20 w-full" />
                    <ShimmerBlock className="h-20 w-full" />
                  </div>
                ) : filteredRequestEvents?.length > 0 ? (
                  <div className="flex flex-col">
                    {filteredRequestEvents?.map(event => {
                      const relatedProjects = getProjectsFromIds(event.projectIds);

                      return (
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
                            <Preview value={event.reason} fontSize={16} />
                          </div>

                          {relatedProjects.length > 0 && (
                            <div className="mt-1">
                              <span className="font-bold mb-2 block">Related Projects:</span>
                              <div className="flex flex-wrap gap-2">
                                {relatedProjects.map(project => {
                                  const linkInfo = getProjectLink(project);

                                  return linkInfo ? (
                                    <a
                                      key={project.id}
                                      href={linkInfo.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-3 py-2 bg-base-100 rounded-lg border border-base-300 hover:bg-primary transition-colors cursor-pointer"
                                      title={`Open ${linkInfo.label}`}
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{project.name}</div>
                                      </div>
                                      <linkInfo.icon size={14} />
                                    </a>
                                  ) : (
                                    <div
                                      key={project.id}
                                      className="flex items-center gap-2 px-3 py-2 bg-base-100 rounded-lg border border-base-300"
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{project.name}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="mt-3">
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
                      );
                    })}
                  </div>
                ) : (
                  <EmptyEventsState type="requests" />
                )}
              </ul>
            )}
          </div>
        </label>
      </label>
    </>
  );
};
