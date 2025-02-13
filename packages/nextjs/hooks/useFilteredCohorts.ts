import { useEffect, useState } from "react";
import { useCohorts } from "./useCohorts";
import { useLocalDeployedContractInfo } from "./useLocalDeployedContractInfo";
import { readContract } from "@wagmi/core";
import { Abi } from "abitype";
import { useAccount } from "wagmi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

interface useFilteredCohortsProps {
  filter?: "admin" | "creator";
  chainId?: AllowedChainIds;
  cohort?: string;
}

export const useFilteredCohorts = ({ filter, chainId, cohort }: useFilteredCohortsProps) => {
  const { cohorts, isLoading: isLoadingCohorts } = useCohorts({ chainId, cohort });
  const [filteredCohorts, setFilteredCohorts] = useState(cohorts);
  const [isLoading, setIsLoading] = useState(true);

  const { address } = useAccount();

  const { data: deployedContract } = useLocalDeployedContractInfo({ contractName: "Cohort" });

  useEffect(() => {
    const filterCohorts = async () => {
      if (!filter) {
        setFilteredCohorts(cohorts);
        setIsLoading(false);
        return;
      }

      try {
        const validCohorts = [];

        for (const cohort of cohorts) {
          try {
            if (filter === "admin") {
              const isAdmin = await readContract(wagmiConfig, {
                address: cohort.cohortAddress as `0x${string}`,
                abi: deployedContract?.abi as Abi,
                functionName: "isAdmin",
                args: [address],
                chainId: cohort.chainId,
              });

              if (isAdmin) {
                validCohorts.push(cohort);
              }
            } else if (filter === "creator") {
              const creatorIndex = await readContract(wagmiConfig, {
                address: cohort.cohortAddress as `0x${string}`,
                abi: deployedContract?.abi as Abi,
                functionName: "creatorIndex",
                args: [address],
                chainId: cohort.chainId,
              });

              const creator = creatorIndex
                ? await readContract(wagmiConfig, {
                    address: cohort.cohortAddress as `0x${string}`,
                    abi: deployedContract?.abi as Abi,
                    functionName: "activeCreators",
                    args: [creatorIndex],
                    chainId: cohort.chainId,
                  })
                : null;

              if (address?.toLowerCase() === (creator as string).toLowerCase()) {
                validCohorts.push(cohort);
              }
            }
          } catch (error) {
            console.error(`Error checking permissions for cohort ${cohort.cohortAddress}:`, error);
            continue;
          }
        }

        setFilteredCohorts(validCohorts);
      } catch (error) {
        console.error("Error filtering cohorts:", error);
        setFilteredCohorts([]);
      }

      setIsLoading(false);
    };

    setIsLoading(true);
    filterCohorts();
  }, [deployedContract, cohorts, filter]);

  return {
    cohorts: filteredCohorts,
    isLoading: isLoadingCohorts || isLoading,
  };
};
