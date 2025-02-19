import React from "react";
import { Actions } from "./Actions";
import { AddBatch } from "./AddBatch";
import { NotificationBell } from "./NotificationBell";
import { Address } from "~~/components/scaffold-eth";

interface BuilderStream {
  builderAddress: string;
  cap: number;
  unlockedAmount: number;
  requiresApproval: boolean;
}

interface BuildersListProps {
  cohortAddress: string;
  builderStreams: Map<string, BuilderStream> | undefined;
  isAdmin: boolean;
  isBuilder: boolean;
  userAddress: string | undefined;
  isERC20: boolean;
  tokenSymbol: string;
  isLoading: boolean;
  pendingRequestEvents: any[];
  approvedRequestEvents: any[];
  openEventsModal: (address: string, view: "contributions" | "requests") => void;
}

export const BuildersList: React.FC<BuildersListProps> = ({
  cohortAddress,
  builderStreams,
  isAdmin,
  isBuilder,
  userAddress,
  isERC20,
  tokenSymbol,
  isLoading,
  pendingRequestEvents,
  approvedRequestEvents,
  openEventsModal,
}) => {
  const getPendingRequestsCount = (builderAddress: string) => {
    return pendingRequestEvents.filter(event => event.args && event.args.builder === builderAddress).length;
  };

  const getApprovedRequestsCount = (builderAddress: string) => {
    return approvedRequestEvents.filter(event => event.args && event.args.builder === builderAddress).length;
  };

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && <AddBatch cohortAddress={cohortAddress} isErc20={isERC20} />}

      {isLoading ? (
        <div>
          <div className="text-4xl animate-bounce mb-2">👾</div>
          <div className="text-lg ">Loading...</div>
        </div>
      ) : !builderStreams || Array.from(builderStreams.values()).length == 0 ? (
        <div>No builders</div>
      ) : (
        Array.from(builderStreams.values()).map(builderStream => {
          if (builderStream.cap == 0) return null;
          const cap = builderStream.cap;
          const unlocked = builderStream.unlockedAmount;
          const percentage = Math.floor((unlocked / cap) * 100);
          const pendingCount = getPendingRequestsCount(builderStream.builderAddress);
          const approvedCount = getApprovedRequestsCount(builderStream.builderAddress);

          // Show notification for admin or if it's the builder's own approved requests
          const showNotification =
            (isAdmin && pendingCount > 0) ||
            (isBuilder && userAddress === builderStream.builderAddress && approvedCount > 0);

          // Count to display
          const notificationCount = isAdmin
            ? pendingCount
            : isBuilder && userAddress === builderStream.builderAddress
              ? approvedCount
              : 0;

          return (
            <div className="flex items-center" key={builderStream.builderAddress}>
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
                    onClick={() => openEventsModal(builderStream.builderAddress, "contributions")}
                  >
                    <Address address={builderStream.builderAddress} disableAddressLink={true} />
                  </div>
                  <div className="ml-4 flex items-center">
                    {isAdmin && (
                      <Actions
                        cohortAddress={cohortAddress}
                        builderAddress={builderStream.builderAddress}
                        requiresApproval={builderStream.requiresApproval}
                      />
                    )}
                    {showNotification && (
                      <NotificationBell
                        count={notificationCount}
                        onClick={() => openEventsModal(builderStream.builderAddress, "requests")}
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
