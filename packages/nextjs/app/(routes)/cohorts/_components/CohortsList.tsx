import { CohortCard } from "./CohortCard";
import { Cohort as DbCohort } from "@prisma/client";
import { EmptyCohortsState } from "~~/components/Empty-states";
import { CardSkeleton } from "~~/components/Skeletons";
import { Cohort } from "~~/hooks/useCohorts";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

type CohortWithRole = Cohort & {
  role?: "ADMIN" | "BUILDER";
};

interface CohortsListProps {
  items: CohortWithRole[];
  loading: boolean;
  dbCohorts: DbCohort[];
}

const CohortsList = ({ items, loading, dbCohorts }: CohortsListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyCohortsState />;
  }

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      {items.length === 0 && <div className="text-center text-sm text-muted-foreground mt-10">No cohort found</div>}
    </div>
  );
};

export default CohortsList;
