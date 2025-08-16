"use client";

import Link from "next/link";
import SearchInput from "../../../../components/SearchInput";
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
                <button className="btn btn-sm rounded-md btn-primary">Create new</button>
              </Link>
            </div>
            <CohortsList
              items={allMyCohorts}
              loading={isLoading}
              dbCohorts={dbCohorts}
              isFiltered={searchParams.cohort?.length > 0 || !!searchParams.chainId}
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="[&_.btn]:btn-md [&_.btn]:text-lg">
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
