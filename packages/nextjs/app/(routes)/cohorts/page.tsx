import { MyCohorts } from "./_components/MyCohorts";
import db from "~~/lib/db";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

interface SearchPageProps {
  searchParams: {
    cohort: string;
    chainId: AllowedChainIds;
  };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const dbCohorts = await db.cohort.findMany({});

  return <MyCohorts searchParams={searchParams} dbCohorts={dbCohorts} />;
};

export default SearchPage;
