import React from "react";
import Link from "next/link";
import { Address } from "~~/components/scaffold-eth";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

interface CohortCardProps {
  name?: string;
  cohortAddress?: string;
  chainId?: AllowedChainIds;
  createdAt: any;
  owner?: string;
  chainName?: string;
}

export const CohortCard = ({ cohortAddress, chainName, owner, name }: CohortCardProps) => {
  return (
    <div>
      <Link href={`/cohort/${cohortAddress}`}>
        <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-2 h-full relative">
          <span className="text-xs top-1 right-1 absolute text-error px-2 py-1">{chainName}</span>
          <div className="flex flex-col pt-4 ">
            <div className="text-2xl font-medium group-hover:text-sky-700 transition line-clamp-2 ">{name}</div>
            <Address address={cohortAddress} disableAddressLink={true} />

            <div className="flex flex-row items-center justify-start mt-2 text-xs">
              Owner:
              <Address address={owner} size="xs" disableAddressLink={true} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
