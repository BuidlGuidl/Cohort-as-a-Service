import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AddBatch } from "../members/_components/AddBatch";
import { AdminActions } from "../members/_components/AdminActions";
import { BuilderActions } from "../members/_components/BuilderActions";
import { NotificationBell } from "../members/_components/NotificationBell";
import { NotificationNote } from "../members/_components/NotificationNote";
import { Builder } from "@prisma/client";
import { useAccount } from "wagmi";
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
  tokenDecimals?: number;
  isLoading: boolean;
  pendingRequestEvents: any[];
  rejectedRequestEvents: any[];
  completedRequestEvents: any[];
  openEventsModal: (address: string, view: "contributions" | "requests") => void;
  dbBuilders?: Builder[];
}

export const BuildersList: React.FC<BuildersListProps> = ({
  cohortAddress,
  builderStreams,
  isAdmin,
  isBuilder,
  userAddress,
  isERC20,
  tokenSymbol,
  tokenDecimals,
  isLoading,
  pendingRequestEvents,
  rejectedRequestEvents,
  completedRequestEvents,
  openEventsModal,
  dbBuilders,
}) => {
  const { address } = useAccount();
  const getPendingRequestsCount = (builderAddress: string) => {
    return pendingRequestEvents.filter(event => event.args && event.args.builder === builderAddress).length;
  };

  const getCompletedRequestsCountInThePastDay = (builderAddress: string) => {
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const oneDayInSeconds = 86400n; // 24 hours * 60 minutes * 60 seconds
    const oneDayAgoTimestamp = currentTimestamp - oneDayInSeconds;

    return completedRequestEvents?.filter(
      event =>
        event.args &&
        event.args.builder === builderAddress &&
        event.blockData &&
        event.blockData.timestamp &&
        event.blockData.timestamp >= oneDayAgoTimestamp,
    ).length;
  };

  const getRejectedRequestsCountInThePastDay = (builderAddress: string) => {
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const oneDayInSeconds = 86400n; // 24 hours * 60 minutes * 60 seconds
    const oneDayAgoTimestamp = currentTimestamp - oneDayInSeconds;

    return rejectedRequestEvents.filter(
      event =>
        event.args &&
        event.args.builder === builderAddress &&
        event.blockData &&
        event.blockData.timestamp &&
        event.blockData.timestamp >= oneDayAgoTimestamp,
    ).length;
  };

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && <AddBatch cohortAddress={cohortAddress} isErc20={isERC20} tokenDecimals={tokenDecimals} />}

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
          const completedCount = getCompletedRequestsCountInThePastDay(builderStream.builderAddress);
          const rejectedCount = getRejectedRequestsCountInThePastDay(builderStream.builderAddress);
          const dbBuilder = dbBuilders?.find(
            builder => builderStream.builderAddress.toLowerCase() == builder.address.toLowerCase(),
          );
          const githubUsername = dbBuilder?.githubUsername;
          const githubUrl = "https://github.com/" + githubUsername;

          // Show notification for admin or if it's the builder's own approved requests
          const showNotification =
            (isAdmin && pendingCount > 0) ||
            (isBuilder && userAddress === builderStream.builderAddress && (completedCount > 0 || rejectedCount > 0));

          // Count to display
          const bellNotificationCount = isAdmin
            ? pendingCount
            : isBuilder && userAddress === builderStream.builderAddress
              ? completedCount + rejectedCount
              : 0;

          const showNotificationNote = isBuilder && pendingCount > 0;

          const noteNotificationCount = pendingCount;

          return (
            <div className="flex items-center" key={builderStream.builderAddress}>
              <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6">
                <div className="flex flex-col md:items-center">
                  <div>
                    {isERC20 ? tokenSymbol : "Ξ"} {unlocked.toFixed(4)} / {cap.toFixed(4)}
                  </div>
                  <progress
                    className="progress w-56 progress-primary bg-secondary"
                    value={percentage}
                    max="100"
                  ></progress>
                </div>
                <div className="md:w-1/2 flex items-center">
                  <div
                    className="cursor-pointer"
                    onClick={() => openEventsModal(builderStream.builderAddress, "contributions")}
                  >
                    <Address address={builderStream.builderAddress} disableAddressLink={true} />
                  </div>
                  {githubUsername && (
                    <div className="ml-4">
                      <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
                        <Image src="/github.svg" alt="GitHub Url" width={25} height={25} />
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center">
                    {isAdmin && (
                      <AdminActions
                        cohortAddress={cohortAddress}
                        builderAddress={builderStream.builderAddress}
                        requiresApproval={builderStream.requiresApproval}
                        isErc20={isERC20}
                        tokenDecimals={tokenDecimals}
                        dbBuilder={dbBuilder}
                      />
                    )}
                    {isBuilder && address == builderStream.builderAddress && <BuilderActions dbBuilder={dbBuilder} />}
                    {showNotification && (
                      <NotificationBell
                        count={bellNotificationCount}
                        onClick={() => openEventsModal(builderStream.builderAddress, "requests")}
                        variant={isAdmin ? "warning" : "info"}
                      />
                    )}
                    {showNotificationNote && (
                      <NotificationNote
                        count={noteNotificationCount}
                        onClick={() => openEventsModal(builderStream.builderAddress, "requests")}
                        variant={"info"}
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
