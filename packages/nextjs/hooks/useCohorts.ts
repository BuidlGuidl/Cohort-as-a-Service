import { useEffect, useMemo } from "react";
import { useScaffoldEventHistory } from "./scaffold-eth";
import { isAddress } from "viem";
import { getTargetNetworks } from "~~/utils/scaffold-eth";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

interface useCohortsProps {
  chainId?: AllowedChainIds;
  cohort?: string;
}

export const useCohorts = ({ chainId, cohort }: useCohortsProps) => {
  const targetNetworks = getTargetNetworks();

  const eventHistories = targetNetworks.map(network => ({
    chainId: network.id as AllowedChainIds,
    chainName: network.name,
    // @ts-ignore
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ...useScaffoldEventHistory({
      contractName: "CohortFactory",
      eventName: "CohortCreated",
      fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
      blockData: true,
      watch: true,
      receiptData: true,
      chainId: network.id as AllowedChainIds,
    }),
  }));

  const creationEvents = useMemo(() => {
    return eventHistories
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
  }, [eventHistories]);

  const isLoading = eventHistories.some(({ isLoading }) => isLoading);

  useEffect(() => {
    eventHistories.forEach(({ data, refetch }) => {
      if (data && data.length > 0 && !data[0].args) {
        refetch();
      }
    });
  }, [eventHistories]);

  if (chainId && cohort) {
    if (isAddress(cohort)) {
      return {
        cohorts: creationEvents.filter(
          event =>
            event.chainId.toString() === chainId.toString() &&
            event.cohortAddress?.toLowerCase().includes(cohort.toLowerCase()),
        ),
        isLoading,
      };
    } else {
      return {
        cohorts: creationEvents.filter(
          event =>
            event.chainId.toString() === chainId.toString() &&
            event.name?.toLowerCase().includes((cohort as string).toLowerCase()),
        ),
        isLoading,
      };
    }
  }

  if (chainId) {
    return {
      cohorts: creationEvents.filter(event => event.chainId.toString() === chainId.toString()),
      isLoading,
    };
  }

  if (cohort && isAddress(cohort)) {
    return {
      cohorts: creationEvents.filter(event => event.cohortAddress?.toLowerCase().includes(cohort.toLowerCase())),
      isLoading,
    };
  } else if (cohort) {
    return {
      cohorts: creationEvents.filter(event => event.name?.toLowerCase().includes(cohort.toLowerCase())),
      isLoading,
    };
  }

  return { cohorts: creationEvents, isLoading };
};
