"use client";

// import { useState } from "react";
import Link from "next/link";
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
  // const [filter, setFilter] = useState<"admin" | "builder">("admin");
  const { isLoading, combinedCohorts: allMyCohorts } = useFilteredCohorts({ ...searchParams });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="py-3 space-y-4">
        <Chains />
        <div className="pb-2 md:mb-0 flex md:flex-row flex-col gap-2">
          <SearchInput />

          <Link href="/create">
            <button className="btn btn-sm rounded-md btn-primary">Create new</button>
          </Link>
        </div>
        {/* <div className="flex justify-start">
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
        </div> */}
        <CohortsList items={allMyCohorts} loading={isLoading} />
      </div>
    </div>
  );
};

export default SearchPage;
