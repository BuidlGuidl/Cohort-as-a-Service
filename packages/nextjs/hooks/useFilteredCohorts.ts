import { useEffect, useState } from "react";
import { useCohorts } from "./useCohorts";
import { useLocalDeployedContractInfo } from "./useLocalDeployedContractInfo";
import { readContract } from "@wagmi/core";
import { Abi } from "abitype";
import { useAccount } from "wagmi";
import { PonderCohort } from "~~/services/ponder/client";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

// Extend PonderCohort type to include role
type CohortWithRole = PonderCohort & {
  role?: "ADMIN" | "BUILDER";
};

interface useFilteredCohortsProps {
  filter?: "admin" | "builder";
  chainId?: AllowedChainIds;
  cohort?: string;
}

export const useFilteredCohorts = ({ filter, chainId, cohort }: useFilteredCohortsProps) => {
  const { cohorts, isLoading: isLoadingCohorts } = useCohorts({ chainId, cohort });
  const [adminCohorts, setAdminCohorts] = useState<CohortWithRole[]>([]);
  const [builderCohorts, setBuilderCohorts] = useState<CohortWithRole[]>([]);
  const [combinedCohorts, setCombinedCohorts] = useState<CohortWithRole[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [isLoadingBuilder, setIsLoadingBuilder] = useState(true);

  const { address, isReconnecting } = useAccount();
  const { data: deployedContract } = useLocalDeployedContractInfo({ contractName: "Cohort" });

  useEffect(() => {
    if (!address || cohorts.length < 1 || !deployedContract) {
      setIsLoadingAdmin(false);
      setIsLoadingBuilder(false);
      return;
    }

    const fetchAdminCohorts = async () => {
      setIsLoadingAdmin(true);
      try {
        const validCohorts: CohortWithRole[] = [];

        for (const cohort of cohorts) {
          try {
            const isAdmin = await readContract(wagmiConfig, {
              address: cohort.address as `0x${string}`,
              abi: deployedContract?.abi as Abi,
              functionName: "isAdmin",
              args: [address],
              chainId: cohort.chainId as AllowedChainIds,
            });

            if (isAdmin) {
              validCohorts.push({
                ...cohort,
                role: "ADMIN",
              });
            }
          } catch (error) {
            console.error(`Error checking admin status for cohort ${cohort.address}:`, error);
            continue;
          }
        }

        setAdminCohorts(validCohorts);
      } catch (error) {
        console.error("Error fetching admin cohorts:", error);
        setAdminCohorts([]);
      } finally {
        setIsLoadingAdmin(false);
      }
    };

    fetchAdminCohorts();
  }, [deployedContract, cohorts, address]);

  useEffect(() => {
    if (!address || cohorts.length < 1 || !deployedContract) {
      setIsLoadingBuilder(false);
      return;
    }

    const fetchBuilderCohorts = async () => {
      setIsLoadingBuilder(true);
      try {
        const validCohorts: CohortWithRole[] = [];

        for (const cohort of cohorts) {
          try {
            const builderIndexResult = await readContract(wagmiConfig, {
              address: cohort.address as `0x${string}`,
              abi: deployedContract?.abi as Abi,
              functionName: "builderIndex",
              args: [address],
              chainId: cohort.chainId as AllowedChainIds,
            });

            if (builderIndexResult && builderIndexResult !== 0n) {
              const builderAddress = await readContract(wagmiConfig, {
                address: cohort.address as `0x${string}`,
                abi: deployedContract?.abi as Abi,
                functionName: "activeBuilders",
                args: [builderIndexResult],
                chainId: cohort.chainId as AllowedChainIds,
              });

              if (address?.toLowerCase() === (builderAddress as string)?.toLowerCase()) {
                validCohorts.push({
                  ...cohort,
                  role: "BUILDER",
                });
              }
            }
          } catch (error) {
            console.error(`Error checking builder status for cohort ${cohort.address}:`, error);
            continue;
          }
        }

        setBuilderCohorts(validCohorts);
      } catch (error) {
        console.error("Error fetching builder cohorts:", error);
        setBuilderCohorts([]);
      } finally {
        setIsLoadingBuilder(false);
      }
    };

    fetchBuilderCohorts();
  }, [deployedContract, cohorts, address]);

  useEffect(() => {
    const cohortMap = new Map<string, CohortWithRole>();

    adminCohorts.forEach(cohort => {
      const key = `${cohort.chainId}-${cohort.address}`;
      cohortMap.set(key, { ...cohort, role: "ADMIN" });
    });

    builderCohorts.forEach(cohort => {
      const key = `${cohort.chainId}-${cohort.address}`;
      if (!cohortMap.has(key)) {
        cohortMap.set(key, { ...cohort, role: "BUILDER" });
      }
    });

    const combined = Array.from(cohortMap.values()).sort((a, b) => {
      const aTime = parseInt(a.createdAt);
      const bTime = parseInt(b.createdAt);
      return bTime - aTime; // Newest first
    });

    setCombinedCohorts(combined);
  }, [adminCohorts, builderCohorts]);

  const getFilteredCohorts = () => {
    if (!filter) return combinedCohorts;
    if (filter === "admin") return adminCohorts;
    if (filter === "builder") return builderCohorts;
    return [];
  };

  return {
    cohorts: getFilteredCohorts(),
    adminCohorts,
    builderCohorts,
    combinedCohorts,
    isLoading: isLoadingCohorts || isReconnecting || !address || isLoadingAdmin || isLoadingBuilder,
  };
};
