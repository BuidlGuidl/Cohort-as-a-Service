import { CohortCard } from "./CohortCard";
import { Cohort as DbCohort } from "@prisma/client";
import { EmptyCohortsState } from "~~/components/EmptyStates";
import { Cohort } from "~~/hooks/useCohorts";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

type CohortWithRole = Cohort & {
  role?: "ADMIN" | "BUILDER";
};

interface CohortsListProps {
  items: CohortWithRole[];
  loading: boolean;
  dbCohorts: DbCohort[];
  isFiltered: boolean;
}

const CohortsList = ({ items, loading, dbCohorts, isFiltered }: CohortsListProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-sm text-base-content/60 font-share-tech-mono">Loading your cohorts...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <CohortCard
            key={item.address}
            address={item.address}
            chainId={item.chainId as AllowedChainIds}
            createdAt={item.createdAt}
            primaryAdmin={item.primaryAdmin}
            name={item.name}
            chainName={item.chainName}
            role={item.role}
            dbCohorts={dbCohorts}
          />
        ))}
      </div>
      {items.length === 0 && <EmptyCohortsState isFiltered={isFiltered} />}
    </div>
  );
};

export default CohortsList;
