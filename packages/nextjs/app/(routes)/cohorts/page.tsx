"use client";

import { useState } from "react";
import SearchInput from "../../../components/search-input";
import Chains from "./_components/Chains";
import CohortsList from "./_components/CohortsList";
import { useFilteredCohorts } from "~~/hooks/useFilteredCohorts";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

interface SearchPageProps {
  searchParams: {
    cohort: string;
    chainId: AllowedChainIds;
  };
}

const SearchPage = ({ searchParams }: SearchPageProps) => {
  const [filter, setFilter] = useState<"admin" | "builder">("admin");
  const { cohorts, isLoading } = useFilteredCohorts({ ...searchParams, filter });

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Chains />
        <div className="flex justify-start">
          <div className="dropdown dropdown-start">
            <button tabIndex={0} className="btn btn-sm btn-outline rounded-md">
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 z-10 border mt-2">
              <li>
                <button onClick={() => setFilter("admin")}>Admin</button>
              </li>
              <li>
                <button onClick={() => setFilter("builder")}>Builder</button>
              </li>
            </ul>
          </div>
        </div>
        <CohortsList items={cohorts} loading={isLoading} />
      </div>
    </>
  );
};

export default SearchPage;
