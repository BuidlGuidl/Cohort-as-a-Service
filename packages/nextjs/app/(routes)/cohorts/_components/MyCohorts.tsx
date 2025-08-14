"use client";

import Link from "next/link";
import SearchInput from "../../../../components/search-input";
import Chains from "./Chains";
import CohortsList from "./CohortsList";
import { Cohort } from "@prisma/client";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useFilteredCohorts } from "~~/hooks/useFilteredCohorts";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

interface MyCohortProps {
  searchParams: {
    cohort: string;
    chainId: AllowedChainIds;
  };
  dbCohorts: Cohort[];
}

export const MyCohorts = ({ searchParams, dbCohorts }: MyCohortProps) => {
  const { isLoading, cohorts: allMyCohorts } = useFilteredCohorts({ ...searchParams });
  const { address } = useAccount();

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="py-3 space-y-4">
        <Chains />

        {address ? (
          <div>
            <div className="pb-2 md:mb-0 flex md:flex-row flex-col gap-2">
              <SearchInput />

              <Link href="/deploy">
                <button className="btn btn-sm rounded-md btn-primary font-share-tech-mono">Create new</button>
              </Link>
            </div>
            <CohortsList items={allMyCohorts} loading={isLoading} dbCohorts={dbCohorts} />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="[&_.btn]:bg-gray-800 [&_.btn]:hover:bg-gray-700 [&_.btn]:text-primary-content [&_.btn]:text-lg [&_.btn]:w-56 [&_.btn]:h-12 [&_.btn]:rounded-lg [&_.btn]:border-none [&_.btn]:font-share-tech-mono">
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
