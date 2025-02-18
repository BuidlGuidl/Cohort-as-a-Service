"use client";

import React, { useState } from "react";
import { StreamContractInfo } from "../_components/StreamContractInfo";
import { CreatorsList } from "./_components/CreatorsList";
import { EventsModal } from "./_components/EventsModal";
import { useAccount } from "wagmi";
import { useCohortData } from "~~/hooks/useCohortData";
import { useWithdrawEvents } from "~~/hooks/useWithdrawEvents";

export interface CreatorFlow {
  creatorAddress: string;
  cap: number;
  availableAmount: number;
}

const Page = ({ params }: { params: { cohortAddress: string } }) => {
  const {
    name,
    primaryAdmin,
    creatorFlows,
    isCreator,
    isAdmin,
    tokenAddress,
    isERC20,
    tokenSymbol,
    balance,
    isLoading,
    admins,
    requiresApproval,
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

  const openEventsModal = (creatorAddress: string, view: "contributions" | "requests") => {
    setSelectedAddress(creatorAddress);
    setModalView(view);
    filterEventsByAddress(creatorAddress);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="max-w-3xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-primary-content bg-primary inline-block p-2">Members</h1>
        <div className="mb-16">
          <p className="mt-0 mb-10">
            These are the {name} active creators and their streams. You can click on any creator to see their detailed
            contributions.
          </p>

          <CreatorsList
            cohortAddress={params.cohortAddress}
            creatorFlows={creatorFlows}
            isAdmin={isAdmin ?? false}
            isCreator={isCreator ?? false}
            userAddress={address}
            isERC20={isERC20 ?? false}
            tokenSymbol={tokenSymbol ?? ""}
            isLoading={isLoading}
            requiresApproval={requiresApproval ?? false}
            pendingRequestEvents={pendingRequestEvents}
            approvedRequestEvents={approvedRequestEvents}
            openEventsModal={openEventsModal}
          />
        </div>
        <StreamContractInfo
          owner={primaryAdmin || ""}
          isCreator={isCreator || false}
          cohortAddress={params.cohortAddress}
          isErc20={isERC20 ?? false}
          tokenSymbol={tokenSymbol ?? ""}
          balance={balance ?? 0}
          admins={admins ?? []}
          isLoading={isLoading}
          isAdmin={isAdmin ?? false}
          requiresApproval={requiresApproval ?? false}
          tokenAddress={tokenAddress ?? ""}
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
