"use client";

import React, { useState } from "react";
import { BuildersList } from "./_components/BuildersList";
import { EditDescription } from "./_components/EditDescription";
import { NativeBalance } from "./_components/NativeBalance";
import { StreamContractInfo } from "./_components/StreamContractInfo";
import { ThemeCustomizer } from "./_components/ThemeCustomizer";
import { TokenBalance } from "./_components/TokenBalance";
import { EventsModal } from "./members/_components/EventsModal";
import { useAccount } from "wagmi";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import { CohortLink } from "~~/components/CohortLink";
import { SubdomainLink } from "~~/components/SubDomainLink";
import { Preview } from "~~/components/preview";
import { useCohortData } from "~~/hooks/useCohortData";

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
    connectedAddressRequiresApproval,
    isLoading,
    locked,
    requiresApproval,
    builderStreams,
    cycle,
    allowApplications,
  } = useCohortData(params.cohortAddress);

  const { address } = useAccount();
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"contributions" | "requests">("contributions");
  const buildersData = builderStreams ? Array.from(builderStreams.values()) : [];

  const openEventsModal = (builderAddress: string, view: "contributions" | "requests") => {
    setSelectedAddress(builderAddress);
    setModalView(view);
    // Optional: you may want to filter events on open
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-7">
      {/* Header + Cohort Title */}
      <div className="flex flex-col items-start gap-4 mb-3">
        {isAdmin && (
          <SubdomainLink
            href="/cohorts"
            className="btn btn-ghost btn-sm rounded-md font-share-tech-mono"
            toMainDomain={true}
          >
            <ArrowLongLeftIcon className="w-6 h-5" />
            My cohorts
          </SubdomainLink>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-primary-content bg-primary px-4 py-2 rounded font-share-tech-mono shadow-sm">
          {name}
        </h1>
        {/* Projects Navigation Button */}
        <div className="mt-1">
          <CohortLink
            href="/projects"
            cohortAddress={params.cohortAddress}
            className="btn btn-outline btn-sm rounded-md"
          >
            Projects
          </CohortLink>
        </div>
      </div>

      {/* Description & Quick Admin Controls card */}
      <div className="bg-base-100 rounded-lg shadow-md p-6 md:flex md:items-start md:justify-between gap-8">
        <div className="flex-1">
          <h2 className="text-xl font-bold font-share-tech-mono mb-1">Description</h2>
          <div className="prose max-w-none mb-2">
            {description && description.length > 0 && description != "<p><br></p>" ? (
              <Preview value={description} />
            ) : (
              <span className="text-gray-400 italic">No description yet.</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end min-w-[180px] space-y-2 ml-0 md:ml-6 mt-6 md:mt-0">
          {isAdmin && <EditDescription cohortAddress={params.cohortAddress} currentDescription={description} />}
          <ThemeCustomizer cohortAddress={params.cohortAddress} isAdmin={isAdmin ?? false} />
        </div>
      </div>

      {/* Metrics Quick Stats Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-base-100 rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-sm text-base-content/60 font-medium">Members</span>
          <span className="text-3xl font-bold">{buildersData.length}</span>
        </div>
        <div className="bg-base-100 rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-sm text-base-content/60 font-medium">Type</span>
          <span className="text-lg font-bold">{isERC20 ? "ERC20" : "Native"}</span>
        </div>
        <div className="bg-base-100 rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-sm text-base-content/60 font-medium">Cycle</span>
          <span className="text-lg font-bold">{cycle > 0 ? `${cycle} days` : "One-time"}</span>
        </div>
        <div className="bg-base-100 rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-sm text-base-content/60 font-medium">Balance</span>
          {isERC20 ? (
            <TokenBalance balance={balance ?? 0} tokenSymbol={tokenSymbol ?? ""} />
          ) : (
            <NativeBalance address={params.cohortAddress} className="text-lg" chainId={chainId as number} />
          )}
        </div>
      </div>

      {/* Main Content Grid: Members (left), Stream Info (right) */}
      <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
        <div className="bg-base-100 rounded-lg shadow-md p-6 flex flex-col h-full">
          <h3 className="text-xl font-bold font-share-tech-mono mb-4">Members</h3>
          <BuildersList
            cohortAddress={params.cohortAddress}
            builderStreams={builderStreams}
            isAdmin={isAdmin ?? false}
            isBuilder={isBuilder ?? false}
            userAddress={address}
            isERC20={isERC20 ?? false}
            tokenSymbol={tokenSymbol ?? ""}
            isLoading={isLoading}
            pendingRequestEvents={[]}
            completedRequestEvents={[]}
            rejectedRequestEvents={[]}
            openEventsModal={openEventsModal}
            tokenDecimals={tokenDecimals}
            allowApplications={allowApplications ?? false}
          />
        </div>
        <div className="bg-base-100 rounded-lg shadow-md p-6 flex flex-col h-full">
          <h3 className="text-xl font-bold font-share-tech-mono mb-4">Stream Contract Info</h3>
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
            isLoadingAdmins={isLoading}
            isAdmin={isAdmin ?? false}
            connectedAddressRequiresApproval={connectedAddressRequiresApproval ?? false}
            tokenAddress={tokenAddress ?? ""}
            isLoading={isLoading}
            locked={locked ?? false}
            tokenDecimals={tokenDecimals}
            cycle={cycle ?? 0}
            requiresApproval={requiresApproval ?? false}
            allowApplications={allowApplications ?? false}
          />
        </div>
      </div>

      {/* Events Modal (do not display unless open) */}
      <EventsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAddress={selectedAddress}
        modalView={modalView}
        setModalView={setModalView}
        isERC20={isERC20 ?? false}
        tokenSymbol={tokenSymbol ?? ""}
        filteredWithdrawnEvents={[]}
        filteredRequestEvents={[]}
        isLoadingWithdrawEvents={false}
        isLoadingRequests={false}
        isAdmin={isAdmin ?? false}
        cohortAddress={params.cohortAddress}
        projects={[]}
      />
    </div>
  );
};

export default CohortPage;
