import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AddBatch } from "../members/_components/AddBatch";
import { AdminActions } from "../members/_components/AdminActions";
import { BuilderActions } from "../members/_components/BuilderActions";
import { NotificationBell } from "../members/_components/NotificationBell";
import { NotificationNote } from "../members/_components/NotificationNote";
import { ApplicationModal } from "./ApplicationModal";
import { Application, Builder } from "@prisma/client";
import { Plus } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { EmptyMembersState } from "~~/components/Empty-states";
import { MembersSkeleton } from "~~/components/Skeletons";
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
  dbAdminAddresses?: string[];
  allowApplications?: boolean;
  applications?: Application[];
  onApplicationSuccess?: () => void;
  onDataUpdate?: () => void;
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
  dbAdminAddresses,
  allowApplications,
  applications,
  onApplicationSuccess,
  onDataUpdate,
}) => {
  const { address } = useAccount();
  const router = useRouter();

  const isDbBuilderorAdmin = () => {
    if (!address) return false;
    const isBuilder = dbBuilders?.some(builder => builder.address.toLowerCase() === address.toLowerCase());
    const isAdmin = dbAdminAddresses?.some(admin => admin.toLowerCase() === address.toLowerCase());
    return isBuilder || isAdmin;
  };

  const getPendingRequestsCount = (builderAddress: string) => {
    return pendingRequestEvents.filter(event => event.args && event.args.builder === builderAddress).length;
  };

  const getCompletedRequestsCountInThePastDay = (builderAddress: string) => {
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const oneDayInSeconds = 86400n;
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
    const oneDayInSeconds = 86400n;
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

  const handleClick = () => {
    router.push(`/cohort/${cohortAddress}/myapplications`);
  };

  const pendingApplicationsCount = applications?.filter(app => app.status === "PENDING").length || 0;
  const userApplications = applications?.filter(app => app.address.toLowerCase() === address?.toLowerCase()) || [];

  const dayOldUserRejectedApplicationsCount = userApplications.filter(
    app =>
      app.status === "REJECTED" &&
      app.updatedAt &&
      new Date(app.updatedAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000),
  ).length;

  const userPendingApplicationsCount = userApplications.filter(app => app.status === "PENDING").length;

  const canApply = () => {
    if (!userApplications.length && allowApplications) return true;

    const hasPending = userApplications.some(app => app.status === "PENDING");
    return !hasPending;
  };

  return (
    <div className="flex flex-col gap-6">
      {address && !isDbBuilderorAdmin() && !isLoading && !canApply() && (
        <Link href={`/cohort/${cohortAddress}/myapplications`}>
          <button className="btn btn-sm btn-primary rounded-md w-fit">My applications</button>
        </Link>
      )}

      {address && !isDbBuilderorAdmin() && !isLoading && canApply() && allowApplications && (
        <div className="mb-6 flex gap-4 items-center">
          <label
            htmlFor="add-application-modal"
            className="btn rounded-md btn-primary btn-sm font-normal space-x-2 normal-case relative"
          >
            Apply to join
            <Plus className="h-4 w-4" />
          </label>

          {dayOldUserRejectedApplicationsCount > 0 && userPendingApplicationsCount == 0 && (
            <span
              className="tooltip text-white font-normal tooltip-right"
              data-tip="Your recent application was rejected. Click to see details."
              onClick={handleClick}
            >
              <AlertCircle className="h-6 w-6 inline-block text-error" />
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <div>
          <MembersSkeleton />
        </div>
      ) : !builderStreams || Array.from(builderStreams.values()).length == 0 ? (
        <EmptyMembersState />
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

          const showNotification =
            (isAdmin && pendingCount > 0) ||
            (isBuilder && userAddress === builderStream.builderAddress && (completedCount > 0 || rejectedCount > 0));

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
                    {isERC20 ? (
                      <>
                        {tokenSymbol} {unlocked.toFixed(2)} / {cap.toFixed(2)}
                      </>
                    ) : (
                      <>
                        Ξ {unlocked.toFixed(4)} / {cap.toFixed(4)}
                      </>
                    )}
                  </div>
                  <progress
                    className="progress w-56 progress-primary bg-secondary"
                    value={percentage}
                    max="100"
                  ></progress>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="cursor-pointer"
                    onClick={() => openEventsModal(builderStream.builderAddress, "contributions")}
                  >
                    <Address address={builderStream.builderAddress} disableAddressLink={true} />
                  </div>
                  {githubUsername && (
                    <div className="">
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
                        onDataUpdate={onDataUpdate}
                      />
                    )}
                    {isBuilder && address?.toLowerCase() == builderStream.builderAddress && (
                      <BuilderActions cohortAddress={cohortAddress} dbBuilder={dbBuilder} onDataUpdate={onDataUpdate} />
                    )}
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
      {isAdmin && (
        <div className="flex flex-col md:flex-row gap-4">
          <AddBatch
            cohortAddress={cohortAddress}
            isErc20={isERC20}
            tokenDecimals={tokenDecimals}
            tokenSymbol={tokenSymbol}
          />

          {pendingApplicationsCount > 0 && (
            <Link href={`/cohort/${cohortAddress}/applications`}>
              <button className="btn btn-sm btn-primary rounded-md w-fit relative">
                Applications
                <div className="badge badge-warning badge-sm absolute -top-2 -right-2">{pendingApplicationsCount}</div>
              </button>
            </Link>
          )}
        </div>
      )}
      <ApplicationModal cohortAddress={cohortAddress} onApplicationSuccess={onApplicationSuccess} />
    </div>
  );
};
