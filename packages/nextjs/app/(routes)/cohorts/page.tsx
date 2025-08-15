import { MyCohorts } from "./_components/MyCohorts";
import db from "~~/lib/db";

interface SearchPageProps {
  searchParams: {
    cohort: string;
    chainId: string;
  };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const dbCohorts = await db.cohort.findMany({});

  return <MyCohorts searchParams={searchParams} dbCohorts={dbCohorts} />;
};

export default SearchPage;
