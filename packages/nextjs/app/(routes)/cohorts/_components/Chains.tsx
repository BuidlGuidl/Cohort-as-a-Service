import { Suspense } from "react";
import ChainItem from "./ChainItem";
import { Chain as ChainType, chains } from "~~/data/chains";

interface ChainListProps {
  items: ChainType[];
}

const ChainsLoader = () => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2 ">
      {[1, 2].map(i => (
        <div key={i} className="h-8 w-24 rounded-lg bg-gray-200 animate-pulse" />
      ))}
    </div>
  );
};

const ChainsList = ({ items }: ChainListProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map(item => (
        <ChainItem key={item.chainId} chainId={item.chainId} icon={item.icon} name={item.name} />
      ))}
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
