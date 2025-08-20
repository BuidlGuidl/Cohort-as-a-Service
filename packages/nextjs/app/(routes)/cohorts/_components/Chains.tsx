import { Suspense } from "react";
import ChainItem from "./ChainItem";
import { Chain as ChainType, chains } from "~~/data/chains";

interface ChainListProps {
  items: ChainType[];
}

const ChainsLoader = () => {
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:items-center lg:gap-x-2 lg:overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-8 w-full rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>
  );
};

const ChainsList = ({ items }: ChainListProps) => {
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:items-center lg:gap-x-2 lg:overflow-x-auto pb-2 w-full justify-center">
        {items.map(item => (
          <ChainItem key={item.chainId} chainId={item.chainId} icon={item.icon} name={item.name} />
        ))}
      </div>
    </div>
  );
};

const Chains = () => {
  const evmChains = chains.filter(chain => chain.isEVM);
  return (
    <Suspense fallback={<ChainsLoader />}>
      <ChainsList items={evmChains} />
    </Suspense>
  );
};

export default Chains;
