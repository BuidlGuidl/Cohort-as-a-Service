import { MyCohorts } from "./_components/MyCohorts";
import { PageAnimation } from "~~/components/PageAnimation";
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

  return (
    <PageAnimation>
      <MyCohorts searchParams={searchParams} dbCohorts={dbCohorts} />
    </PageAnimation>
  );
};

export default SearchPage;
