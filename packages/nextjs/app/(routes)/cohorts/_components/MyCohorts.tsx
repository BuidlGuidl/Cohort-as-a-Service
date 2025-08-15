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
    chainId: string;
  };
  dbCohorts: Cohort[];
}

export const MyCohorts = ({ searchParams, dbCohorts }: MyCohortProps) => {
  // Parse chainId parameter to support multiple chains
  const parsedSearchParams = {
    ...searchParams,
    chainId: searchParams.chainId
      ? (searchParams.chainId
          .split(",")
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id)) as AllowedChainIds[])
      : undefined,
  };

  const { isLoading, cohorts: allMyCohorts } = useFilteredCohorts(parsedSearchParams);
  const { address } = useAccount();

  return (
    <div className="max-w-6xl mx-auto mt-8 relative">
      <div className="py-3 space-y-4">
        {/* Content - always visible, blur only the main content area */}
        <div className={address ? "" : "blur-sm pointer-events-none relative z-0"}>
          <Chains />
          <div className="mt-8">
            <div className="pb-2 md:mb-0 flex md:flex-row flex-col gap-2">
              <SearchInput />

              <Link href="/deploy">
                <button className="btn btn-sm rounded-md bg-gray-800 hover:bg-gray-700 text-primary-content border-none font-share-tech-mono">
                  Create new
                </button>
              </Link>
            </div>
            <CohortsList items={allMyCohorts} loading={isLoading} dbCohorts={dbCohorts} />
          </div>
        </div>

        {/* Fixed floating Connect Wallet button when not connected */}
        {!address && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="pointer-events-auto [&_.btn]:bg-gray-800 [&_.btn]:hover:bg-gray-700 [&_.btn]:text-primary-content [&_.btn]:text-lg [&_.btn]:w-56 [&_.btn]:h-12 [&_.btn]:rounded-lg [&_.btn]:border-none [&_.btn]:font-share-tech-mono [&_.btn]:shadow-2xl">
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
