import { CohortCard } from "./CohortCard";
import { AllowedChainIds } from "~~/utils/scaffold-eth/networks.js";

type Cohort = {
  chainId: AllowedChainIds;
  cohortAddress?: string;
  owner?: string;
  name?: string;
  createdAt: any;
  chainName?: string;
};

interface CohortsListProps {
  items: Cohort[];
}

const CohortsList = ({ items }: CohortsListProps) => {
  return (
    <div>
      <div className=" grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(item => (
          <CohortCard
            key={item.cohortAddress}
            cohortAddress={item.cohortAddress}
            chainId={item.chainId}
            createdAt={item.createdAt}
            owner={item.owner}
            name={item.name}
            chainName={item.chainName}
          />
        ))}
      </div>
      {items.length === 0 && <div className="text-center text-sm text-muted-foreground mt-10">No cohort found</div>}
    </div>
  );
};

export default CohortsList;
