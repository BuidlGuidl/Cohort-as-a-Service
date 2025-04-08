"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BuildersList } from "./_components/BuildersList";
import { StreamContractInfo } from "./_components/StreamContractInfo";
import { EventsModal } from "./members/_components/EventsModal";
import { useAccount } from "wagmi";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import { useCohortData } from "~~/hooks/useCohortData";
import { useWithdrawEvents } from "~~/hooks/useWithdrawEvents";

const CohortPage = ({ params }: { params: { cohortAddress: string } }) => {
  const {
    isAdmin,
    isERC20,
    tokenAddress,
    description,
    primaryAdmin,
    isBuilder,
    oneTimeAlreadyWithdrawn,
    tokenSymbol,
    tokenDecimals,
    balance,
    name,
    chainName,
    chainId,
    admins,
    isLoadingAdmins,
    connectedAddressRequiresApproval,
    isLoading,
    locked,
    requiresApproval,
    builderStreams,
    isLoadingBuilders,
    cycle,
  } = useCohortData(params.cohortAddress);

  const router = useRouter();
  const { address } = useAccount();

  const [selectedAddress, setSelectedAddress] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"contributions" | "requests">("contributions");

  const buildersData = builderStreams ? Array.from(builderStreams.values()) : [];

  const {
    filteredWithdrawnEvents,
    filteredRequestEvents,
    pendingRequestEvents,
    approvedRequestEvents,
    rejectedRequestEvents,
    isLoadingWithdrawEvents,
    isLoadingRequests,
    filterEventsByAddress,
  } = useWithdrawEvents(params.cohortAddress, selectedAddress);

  const openEventsModal = (builderAddress: string, view: "contributions" | "requests") => {
    setSelectedAddress(builderAddress);
    setModalView(view);
    filterEventsByAddress(builderAddress);
    setIsModalOpen(true);
  };

  const onMemeberClick = () => {
    router.push(`/cohort/${params.cohortAddress}/members`);
  };

  const onProjectClick = () => {
    router.push(`/cohort/${params.cohortAddress}/projects`);
  };

  return (
    <div className="max-w-4xl mt-8">
      {isAdmin && (
        <Link href="/cohorts" className="btn btn-ghost btn-sm rounded-sm">
          <ArrowLongLeftIcon className="w-7 h-4" />
          My cohorts
        </Link>
      )}

      <div className="mt-8">
        <h1 className="text-4xl font-bold mb-8 text-primary-content bg-primary inline-block p-2">Cohort</h1>
        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="mt-0">{description}</p>
        <p>
          <span onClick={onMemeberClick} className="link link-primary mr-1">
            Members
          </span>
          contributing to any of the active{" "}
          <span onClick={onProjectClick} className="link link-primary">
            projects
          </span>{" "}
          can submit their work and claim grant streams, while showcasing their contributions to the public.
        </p>
      </div>

      {buildersData.length <= 8 && (
        <div className="mt-8 mb-8">
          <h3 className="text-xl font-bold mb-4">Members</h3>
          <BuildersList
            cohortAddress={params.cohortAddress}
            builderStreams={builderStreams}
            isAdmin={isAdmin ?? false}
            isBuilder={isBuilder ?? false}
            userAddress={address}
            isERC20={isERC20 ?? false}
            tokenSymbol={tokenSymbol ?? ""}
            isLoading={isLoadingBuilders}
            pendingRequestEvents={pendingRequestEvents}
            approvedRequestEvents={approvedRequestEvents}
            rejectedRequestEvents={rejectedRequestEvents}
            openEventsModal={openEventsModal}
            tokenDecimals={tokenDecimals}
          />
        </div>
      )}

      <p className="font-bold mb-2 text-secondary">
        Stream Contract
        <span
          className="tooltip text-white font-normal"
          data-tip={`All streams and contributions are handled by a contract on ${chainName}.`}
        >
          <QuestionMarkCircleIcon className="h-5 w-5 inline-block ml-2" />
        </span>
      </p>

      <StreamContractInfo
        owner={primaryAdmin || ""}
        isBuilder={isBuilder || false}
        oneTimeAlreadyWithdrawn={oneTimeAlreadyWithdrawn ?? false}
        cohortAddress={params.cohortAddress}
        isErc20={isERC20 ?? false}
        tokenSymbol={tokenSymbol ?? ""}
        balance={balance ?? 0}
        chainName={chainName}
        chainId={chainId}
        admins={admins ?? []}
        isLoadingAdmins={isLoadingAdmins}
        isAdmin={isAdmin ?? false}
        connectedAddressRequiresApproval={connectedAddressRequiresApproval ?? false}
        tokenAddress={tokenAddress ?? ""}
        isLoading={isLoading}
        locked={locked ?? false}
        tokenDecimals={tokenDecimals}
        cycle={cycle ?? 0}
        requiresApproval={requiresApproval ?? false}
      />

      <EventsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAddress={selectedAddress}
        modalView={modalView}
        setModalView={setModalView}
        isERC20={isERC20 ?? false}
        tokenSymbol={tokenSymbol ?? ""}
        filteredWithdrawnEvents={filteredWithdrawnEvents}
        filteredRequestEvents={filteredRequestEvents}
        isLoadingWithdrawEvents={isLoadingWithdrawEvents}
        isLoadingRequests={isLoadingRequests}
        isAdmin={isAdmin ?? false}
        cohortAddress={params.cohortAddress}
      />
    </div>
  );
};

export default CohortPage;
