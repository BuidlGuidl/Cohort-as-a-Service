import { CohortCard } from "./CohortCard";
import { CohortLoadingCard } from "./CohortLoadingCard";
import { Cohort } from "~~/hooks/useCohorts";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

type CohortWithRole = Cohort & {
  role?: "ADMIN" | "BUILDER";
};

interface CohortsListProps {
  items: CohortWithRole[];
  loading: boolean;
}

const CohortsList = ({ items, loading }: CohortsListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <CohortLoadingCard key={index} />
        ))}
      </div>
    );
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
          />
        ))}
      </div>
      {items.length === 0 && <div className="text-center text-sm text-muted-foreground mt-10">No cohort found</div>}
    </div>
  );
};

export default CohortsList;
