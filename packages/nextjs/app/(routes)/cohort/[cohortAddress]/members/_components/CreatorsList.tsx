import React from "react";
import { Actions } from "./Actions";
import { AddBatch } from "./AddBatch";
import { NotificationBell } from "./NotificationBell";
import { Address } from "~~/components/scaffold-eth";

interface CreatorFlow {
  creatorAddress: string;
  cap: number;
  availableAmount: number;
}

interface CreatorsListProps {
  cohortAddress: string;
  creatorFlows: Map<string, CreatorFlow> | undefined;
  isAdmin: boolean;
  isCreator: boolean;
  userAddress: string | undefined;
  isERC20: boolean;
  tokenSymbol: string;
  isLoading: boolean;
  requiresApproval: boolean;
  pendingRequestEvents: any[];
  approvedRequestEvents: any[];
  openEventsModal: (address: string, view: "contributions" | "requests") => void;
}

export const CreatorsList: React.FC<CreatorsListProps> = ({
  cohortAddress,
  creatorFlows,
  isAdmin,
  isCreator,
  userAddress,
  isERC20,
  tokenSymbol,
  isLoading,
  requiresApproval,
  pendingRequestEvents,
  approvedRequestEvents,
  openEventsModal,
}) => {
  const getPendingRequestsCount = (creatorAddress: string) => {
    return pendingRequestEvents.filter(event => event.args && event.args.creator === creatorAddress).length;
  };

  const getApprovedRequestsCount = (creatorAddress: string) => {
    return approvedRequestEvents.filter(event => event.args && event.args.creator === creatorAddress).length;
  };

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && <AddBatch cohortAddress={cohortAddress} isErc20={isERC20} />}

      {isLoading ? (
        <div>
          <div className="text-4xl animate-bounce mb-2">👾</div>
          <div className="text-lg ">Loading...</div>
        </div>
      ) : !creatorFlows || Array.from(creatorFlows.values()).length == 0 ? (
        <div>No creators</div>
      ) : (
        Array.from(creatorFlows.values()).map(creatorFlow => {
          if (creatorFlow.cap == 0) return null;
          const cap = creatorFlow.cap;
          const unlocked = creatorFlow.availableAmount;
          const percentage = Math.floor((unlocked / cap) * 100);
          const pendingCount = getPendingRequestsCount(creatorFlow.creatorAddress);
          const approvedCount = getApprovedRequestsCount(creatorFlow.creatorAddress);

          // Show notification for admin or if it's the creator's own approved requests
          const showNotification =
            (isAdmin && pendingCount > 0) ||
            (isCreator && userAddress === creatorFlow.creatorAddress && approvedCount > 0);

          // Count to display
          const notificationCount = isAdmin
            ? pendingCount
            : isCreator && userAddress === creatorFlow.creatorAddress
              ? approvedCount
              : 0;

          return (
            <div className="flex items-center" key={creatorFlow.creatorAddress}>
              <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6">
                <div className="flex flex-col md:items-center">
                  <div>
                    {isERC20 ? tokenSymbol : "Ξ"} {unlocked.toFixed(4)} / {cap}
                  </div>
                  <progress className="progress w-56 progress-primary bg-white" value={percentage} max="100"></progress>
                </div>
                <div className="md:w-1/2 flex items-center">
                  <div
                    className="cursor-pointer"
                    onClick={() => openEventsModal(creatorFlow.creatorAddress, "contributions")}
                  >
                    <Address address={creatorFlow.creatorAddress} disableAddressLink={true} />
                  </div>
                  <div className="ml-4 flex items-center">
                    {isAdmin && (
                      <Actions
                        cohortAddress={cohortAddress}
                        creatorAddress={creatorFlow.creatorAddress}
                        requiresApproval={requiresApproval}
                      />
                    )}
                    {showNotification && (
                      <NotificationBell
                        count={notificationCount}
                        onClick={() => openEventsModal(creatorFlow.creatorAddress, "requests")}
                        variant={isAdmin ? "warning" : "info"}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
