import { useEffect, useState } from "react";
import { useCohorts } from "./useCohorts";
import { Cohort } from "./useCohorts";
import { useLocalDeployedContractInfo } from "./useLocalDeployedContractInfo";
import { readContract } from "@wagmi/core";
import { Abi } from "abitype";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

type CohortWithRole = Cohort & {
  role?: "ADMIN" | "BUILDER";
};

interface useFilteredCohortsProps {
  filter?: "admin" | "builder";
  chainId?: AllowedChainIds | AllowedChainIds[];
  cohort?: string;
}

export const useFilteredCohorts = ({ filter, chainId, cohort }: useFilteredCohortsProps) => {
  const { data: cohorts, isLoading: isLoadingCohorts } = useCohorts();
  const [adminCohorts, setAdminCohorts] = useState<CohortWithRole[]>([]);
  const [builderCohorts, setBuilderCohorts] = useState<CohortWithRole[]>([]);
  const [combinedCohorts, setCombinedCohorts] = useState<CohortWithRole[]>([]);
  const [searchedCohorts, setSearchedCohorts] = useState<CohortWithRole[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [isLoadingBuilder, setIsLoadingBuilder] = useState(true);

  const { address, isReconnecting } = useAccount();
  const { data: deployedContract } = useLocalDeployedContractInfo({ contractName: "Cohort" });

  useEffect(() => {
    if (!cohorts) return;
    if (!address || cohorts.length < 1 || !deployedContract) {
      setIsLoadingAdmin(false);
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
    if (!cohorts) return;
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

            const builderAddress: any = await readContract(wagmiConfig, {
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
          } catch {
            // console.error(`Error checking builder status for cohort ${cohort.address}:`, error);
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
      return bTime - aTime;
    });

    setCombinedCohorts(combined);
  }, [adminCohorts, builderCohorts]);

  const getFilteredCohorts = () => {
    if (!filter) return combinedCohorts;
    if (filter === "admin") return adminCohorts;
    if (filter === "builder") return builderCohorts;
    return [];
  };

  useEffect(() => {
    let filtered = getFilteredCohorts();

    // Apply chain filter if chainId(s) are selected
    if (chainId) {
      const chainIds = Array.isArray(chainId) ? chainId : [chainId];
      filtered = filtered.filter(c => chainIds.some(id => c.chainId.toString() === id.toString()));
    }

    // Apply text search filter if cohort search term exists
    if (cohort) {
      const lowerCohort = cohort.toLowerCase();

      if (isAddress(cohort)) {
        filtered = filtered.filter(c => c.address.toLowerCase() === lowerCohort);
      } else {
        filtered = filtered.filter(
          c => c.name.toLowerCase().includes(lowerCohort) || c.description?.toLowerCase().includes(lowerCohort),
        );
      }
    }

    setSearchedCohorts(filtered);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohort, combinedCohorts, chainId]);

  return {
    cohorts: searchedCohorts,
    adminCohorts,
    builderCohorts,
    combinedCohorts,
    isLoading: isLoadingCohorts || isReconnecting || !address || isLoadingAdmin || isLoadingBuilder,
  };
};
