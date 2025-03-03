"use client";

import React, { useState } from "react";
import { StreamContractInfo } from "../_components/StreamContractInfo";
import { BuildersList } from "./_components/BuildersList";
import { EventsModal } from "./_components/EventsModal";
import { useAccount } from "wagmi";
import { useCohortData } from "~~/hooks/useCohortData";
import { useWithdrawEvents } from "~~/hooks/useWithdrawEvents";

export interface BuilderStream {
  builderAddress: string;
  cap: number;
  unlockedAmount: number;
}

const Page = ({ params }: { params: { cohortAddress: string } }) => {
  const {
    name,
    primaryAdmin,
    builderStreams,
    isBuilder,
    isAdmin,
    tokenAddress,
    isERC20,
    tokenSymbol,
    balance,
    admins,
    connectedAddressRequiresApproval,
    isLoadingBuilders,
    isLoadingAdmins,
    isLoading,
    locked,
  } = useCohortData(params.cohortAddress);

  const [selectedAddress, setSelectedAddress] = useState("");
  const [modalView, setModalView] = useState<"contributions" | "requests">("contributions");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { address } = useAccount();

  const {
    filteredWithdrawnEvents,
    filteredRequestEvents,
    pendingRequestEvents,
    approvedRequestEvents,
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

  return (
    <div>
      <div className="max-w-3xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-primary-content bg-primary inline-block p-2">Members</h1>
        <div className="mb-16">
          <p className="mt-0 mb-10">
            These are the {name} active builders and their streams. You can click on any builder to see their detailed
            contributions.
          </p>

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
            openEventsModal={openEventsModal}
          />
        </div>
        <StreamContractInfo
          owner={primaryAdmin || ""}
          isBuilder={isBuilder || false}
          cohortAddress={params.cohortAddress}
          isErc20={isERC20 ?? false}
          tokenSymbol={tokenSymbol ?? ""}
          balance={balance ?? 0}
          admins={admins ?? []}
          isLoadingAdmins={isLoadingAdmins}
          isAdmin={isAdmin ?? false}
          connectedAddressRequiresApproval={connectedAddressRequiresApproval ?? false}
          tokenAddress={tokenAddress ?? ""}
          isLoading={isLoading}
          locked={locked ?? false}
        />
      </div>

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

export default Page;
