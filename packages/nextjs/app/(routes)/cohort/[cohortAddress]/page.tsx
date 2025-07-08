"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BuildersList } from "./_components/BuildersList";
import { EditDescription } from "./_components/EditDescription";
import { StreamContractInfo } from "./_components/StreamContractInfo";
import { ThemeCustomizer } from "./_components/ThemeCustomizer";
import { EventsModal } from "./members/_components/EventsModal";
import { Application, Builder, Cohort, Project } from "@prisma/client";
import axios from "axios";
import { useAccount } from "wagmi";
import { useSwitchChain } from "wagmi";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import { Preview } from "~~/components/preview";
import { useCohortData } from "~~/hooks/useCohortData";
import { useWithdrawEvents } from "~~/hooks/useWithdrawEvents";

type CohortWithBuilder = Cohort & {
  Builder: Builder[];
  Application: Application[];
  Project: Project[];
};

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

  const { switchChain } = useSwitchChain();

  const router = useRouter();
  const { address, chainId: connectedChainId } = useAccount();

  const [selectedAddress, setSelectedAddress] = useState("");
  const [dbCohort, setDbCohort] = useState<CohortWithBuilder>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"contributions" | "requests">("contributions");

  const buildersData = builderStreams ? Array.from(builderStreams.values()) : [];

  const {
    filteredWithdrawnEvents,
    filteredRequestEvents,
    pendingRequestEvents,
    rejectedRequestEvents,
    completedRequestEvents,
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

  const fetchCohort = useCallback(async () => {
    if (!params.cohortAddress) return;

    try {
      const response = await axios.get(`/api/cohort/${params.cohortAddress}`);
      const cohort = response.data?.cohort;
      setDbCohort(cohort);
    } catch (error) {
      console.error("Error fetching cohort from db:", error);
    }
  }, [params.cohortAddress]);

  useEffect(() => {
    fetchCohort();
  }, [fetchCohort, builderStreams]);

  useEffect(() => {
    if (chainId && connectedChainId && chainId !== connectedChainId) {
      switchChain({ chainId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, address]);

  const handleApplicationSuccess = () => {
    fetchCohort();
  };

  return (
    <div className="max-w-4xl text-base-content px-4 sm:px-6 lg:px-8 mt-8">
      {isAdmin && (
        <Link href="/cohorts" className="btn btn-ghost btn-sm rounded-sm mb-5">
          <ArrowLongLeftIcon className="w-7 h-4" />
          My cohorts
        </Link>
      )}
      <div>
        <h1 className="text-4xl font-bold mb-8 text-primary-content bg-primary inline-block p-2">Cohort</h1>
        <h2 className="text-2xl font-bold">{name}</h2>
        <div className="flex gap-2">
          {description && description.length > 0 && description != "<p><br></p>" && <Preview value={description} />}
          {isAdmin && <EditDescription cohortAddress={params.cohortAddress} currentDescription={description} />}
        </div>
      </div>

      {buildersData.length <= 8 && (
        <div className="mt-8 ">
          <h3 className="text-xl font-bold mb-4">Members</h3>
          <BuildersList
            cohortAddress={params.cohortAddress}
            builderStreams={builderStreams}
            isAdmin={isAdmin ?? false}
            isBuilder={isBuilder ?? false}
            userAddress={address}
            isERC20={isERC20 ?? false}
            tokenSymbol={tokenSymbol ?? ""}
            isLoading={isLoading}
            pendingRequestEvents={pendingRequestEvents}
            completedRequestEvents={completedRequestEvents}
            rejectedRequestEvents={rejectedRequestEvents}
            openEventsModal={openEventsModal}
            tokenDecimals={tokenDecimals}
            dbBuilders={dbCohort?.Builder}
            dbAdminAddresses={dbCohort?.adminAddresses}
            applications={dbCohort?.Application}
            onApplicationSuccess={handleApplicationSuccess}
            allowApplications={allowApplications ?? false}
          />
        </div>
      )}

      <div className="flex gap-3">
        {buildersData.length > 8 && (
          <div className="">
            <button className="btn btn-sm btn-primary rounded-md " onClick={onMemeberClick}>
              Members
            </button>
          </div>
        )}

        {isAdmin ? (
          <button className="btn btn-sm rounded-md btn-primary" onClick={onProjectClick}>
            View Projects
          </button>
        ) : (
          dbCohort?.Project &&
          dbCohort.Project.length > 0 && (
            <button className="btn btn-sm rounded-md btn-primary mb-4" onClick={onProjectClick}>
              View Projects
            </button>
          )
        )}
      </div>

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
        projects={dbCohort?.Project}
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
        projects={dbCohort?.Project}
      />

      <ThemeCustomizer cohortAddress={params.cohortAddress} isAdmin={isAdmin ?? false} />
    </div>
  );
};

export default CohortPage;
