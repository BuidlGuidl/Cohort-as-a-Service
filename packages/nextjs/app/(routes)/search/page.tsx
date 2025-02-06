"use client";

import SearchInput from "../../../components/search-input";
import Chains from "./_components/Chains";
import CohortsList from "./_components/CohortsList";
import { useCohorts } from "~~/hooks/useCohorts";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

interface SearchPageProps {
  searchParams: {
    cohort: string;
    chainId: AllowedChainIds;
  };
}

const SearchPage = ({ searchParams }: SearchPageProps) => {
  const { cohorts } = useCohorts({ ...searchParams });

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Chains />
        <CohortsList items={cohorts} />
      </div>
    </>
  );
};

export default SearchPage;
