"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StreamContractInfo } from "./_components/StreamContractInfo";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useCohortData } from "~~/hooks/useCohortData";

const CohortPage = ({ params }: { params: { cohortAddress: string } }) => {
  const {
    isAdmin,
    isERC20,
    tokenAddress,
    description,
    primaryAdmin,
    isBuilder,
    tokenSymbol,
    balance,
    name,
    chainName,
    chainId,
    admins,
    isLoadingAdmins,
    connectedAddressRequiresApproval,
    isLoading,
    locked,
  } = useCohortData(params.cohortAddress);

  const router = useRouter();

  const onMemeberClick = () => {
    router.push(`/cohort/${params.cohortAddress}/members`);
  };

  // const onProjectClick = () => {
  //   router.push(`/cohort/${params.cohortAddress}/projects`);
  // };

  return (
    <div className="max-w-4xl mx-auto mt-16">
      <div>
        <h1 className="text-4xl font-bold mb-8 text-primary-content bg-primary inline-block p-2">Cohort</h1>
        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="mt-0">{description}</p>
        <p>
          <span onClick={onMemeberClick} className="link link-primary mr-1">
            Members
          </span>
          contributing to any of the active{" "}
          <span
            // onClick={onProjectClick}
            className="link link-primary"
          >
            projects
          </span>{" "}
          can submit their work and claim grant streams, while showcasing their contributions to the public.
        </p>
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
      />
    </div>
  );
};

export default CohortPage;
