import { useEffect, useMemo, useState } from "react";
import { useScaffoldEventHistory } from "./scaffold-eth";
import { isAddress } from "viem";
import * as chains from "viem/chains";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

interface useCohortsProps {
  chainId?: AllowedChainIds;
  cohort?: string;
}

type Cohort = {
  chainId: AllowedChainIds;
  chainName: string;
  cohortAddress: string | undefined;
  owner: string | undefined;
  name: string | undefined;
  createdAt: any;
};

export const useCohorts = ({ chainId, cohort }: useCohortsProps) => {
  const deployBlock = BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0);
  const [isMounted, setIsMounted] = useState(false);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoadingState, setIsloading] = useState(true);

  // const hardhatEvents = useScaffoldEventHistory({
  //   contractName: "CohortFactory",
  //   eventName: "CohortCreated",
  //   fromBlock: deployBlock,
  //   blockData: true,
  //   watch: true,
  //   receiptData: true,
  //   chainId: chains.hardhat.id,
  // });

  const baseSepoliaEvents = useScaffoldEventHistory({
    contractName: "CohortFactory",
    eventName: "CohortCreated",
    fromBlock: deployBlock,
    blockData: true,
    watch: true,
    receiptData: true,
    chainId: chains.baseSepolia.id,
  });

  const mainnetEvents = useScaffoldEventHistory({
    contractName: "CohortFactory",
    eventName: "CohortCreated",
    fromBlock: deployBlock,
    blockData: true,
    watch: true,
    receiptData: true,
    chainId: chains.mainnet.id,
  });

  const optimismEvents = useScaffoldEventHistory({
    contractName: "CohortFactory",
    eventName: "CohortCreated",
    fromBlock: deployBlock,
    blockData: true,
    watch: true,
    receiptData: true,
    chainId: chains.optimism.id,
  });

  const arbitrumEvents = useScaffoldEventHistory({
    contractName: "CohortFactory",
    eventName: "CohortCreated",
    fromBlock: deployBlock,
    blockData: true,
    watch: true,
    receiptData: true,
    chainId: chains.arbitrum.id,
  });

  const polygonEvents = useScaffoldEventHistory({
    contractName: "CohortFactory",
    eventName: "CohortCreated",
    fromBlock: deployBlock,
    blockData: true,
    watch: true,
    receiptData: true,
    chainId: chains.polygon.id,
  });

  const avalancheEvents = useScaffoldEventHistory({
    contractName: "CohortFactory",
    eventName: "CohortCreated",
    fromBlock: deployBlock,
    blockData: true,
    watch: true,
    receiptData: true,
    chainId: chains.avalanche.id,
  });

  const bscEvents = useScaffoldEventHistory({
    contractName: "CohortFactory",
    eventName: "CohortCreated",
    fromBlock: deployBlock,
    blockData: true,
    watch: true,
    receiptData: true,
    chainId: chains.bsc.id,
  });

  const baseEvents = useScaffoldEventHistory({
    contractName: "CohortFactory",
    eventName: "CohortCreated",
    fromBlock: deployBlock,
    blockData: true,
    watch: true,
    receiptData: true,
    chainId: chains.base.id,
  });

  const allChainEvents = [
    // { chainId: chains.hardhat.id, chainName: "Hardhat", ...hardhatEvents },
    { chainId: chains.baseSepolia.id, chainName: "Base Sepolia", ...baseSepoliaEvents },
    { chainId: chains.mainnet.id, chainName: "Ethereum", ...mainnetEvents },
    { chainId: chains.optimism.id, chainName: "Optimism", ...optimismEvents },
    { chainId: chains.arbitrum.id, chainName: "Arbitrum", ...arbitrumEvents },
    { chainId: chains.polygon.id, chainName: "Polygon", ...polygonEvents },
    { chainId: chains.avalanche.id, chainName: "Avalanche", ...avalancheEvents },
    { chainId: chains.bsc.id, chainName: "BSC", ...bscEvents },
    { chainId: chains.base.id, chainName: "Base", ...baseEvents },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const creationEvents = useMemo(() => {
    if (!isMounted) return [];

    return allChainEvents
      .flatMap(({ chainId, chainName, data }) =>
        (data || []).map(event => ({
          chainId,
          chainName,
          cohortAddress: event.args?.cohortAddress,
          owner: event.args?.primaryAdmin,
          name: event.args?.name,
          // @ts-ignore
          createdAt: event.blockData?.timestamp,
        })),
      )
      .filter(event => event.cohortAddress)
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }, [allChainEvents, isMounted]);

  useEffect(() => {
    allChainEvents.forEach(({ data, refetch }) => {
      if (data && data.length > 0 && !data[0].args) {
        refetch();
      }
    });
  }, [allChainEvents]);

  useEffect(() => {
    let filteredCohorts = creationEvents;

    if (isMounted) {
      if (chainId) {
        filteredCohorts = filteredCohorts.filter(event => event.chainId.toString() === chainId.toString());
      }

      if (cohort) {
        const searchTerm = cohort.toLowerCase();
        const isCohortAddress = isAddress(cohort);

        filteredCohorts = filteredCohorts.filter(event =>
          isCohortAddress
            ? event.cohortAddress?.toLowerCase().includes(searchTerm)
            : event.name?.toLowerCase().includes(searchTerm),
        );
      }
    }

    setCohorts(filteredCohorts);

    if (isMounted && !allChainEvents.some(({ isLoading }) => isLoading)) {
      setIsloading(false);
    }
  }, [isMounted, chainId, cohort, ...allChainEvents.map(e => e.data)]);

  return {
    cohorts: cohorts,
    isLoading: !isMounted || allChainEvents.some(({ isLoading }) => isLoading) || isLoadingState,
  };
};
