import { CohortCard } from "./CohortCard";
import { CohortLoadingCard } from "./CohortLoadingCard";
import { AllowedChainIds } from "~~/utils/scaffold-eth/networks.js";

type Cohort = {
  chainId: AllowedChainIds;
  cohortAddress?: string;
  owner?: string;
  name?: string;
  createdAt: any;
  chainName?: string;
  role?: "ADMIN" | "BUILDER";
};

interface CohortsListProps {
  items: Cohort[];
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
            key={item?.address}
            cohortAddress={item.address}
            chainId={item.chainId}
            createdAt={item.createdAt}
            owner={item.primaryAdmin}
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
