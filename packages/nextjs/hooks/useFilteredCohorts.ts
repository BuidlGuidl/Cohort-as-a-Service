import { useEffect, useState } from "react";
import { useCohorts } from "./useCohorts";
import { useLocalDeployedContractInfo } from "./useLocalDeployedContractInfo";
import { readContract } from "@wagmi/core";
import { Abi } from "abitype";
import { useAccount } from "wagmi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

type Cohort = {
  chainId: AllowedChainIds;
  chainName: string;
  cohortAddress: string | undefined;
  owner: string | undefined;
  name: string | undefined;
  createdAt: any;
  role?: "ADMIN" | "BUILDER";
};

interface useFilteredCohortsProps {
  filter?: "admin" | "builder";
  chainId?: AllowedChainIds;
  cohort?: string;
}

export const useFilteredCohorts = ({ filter, chainId, cohort }: useFilteredCohortsProps) => {
  const { cohorts, isLoading: isLoadingCohorts } = useCohorts({ chainId, cohort });
  const [adminCohorts, setAdminCohorts] = useState<Cohort[]>([]);
  const [builderCohorts, setBuilderCohorts] = useState<Cohort[]>([]);
  const [combinedCohorts, setCombinedCohorts] = useState<Cohort[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [isLoadingBuilder, setIsLoadingBuilder] = useState(true);

  const { address, isConnecting, isReconnecting } = useAccount();
  const { data: deployedContract } = useLocalDeployedContractInfo({ contractName: "Cohort" });

  useEffect(() => {
    const fetchAdminCohorts = async () => {
      try {
        const validCohorts: Cohort[] = [];

        for (const cohort of cohorts) {
          try {
            const isAdmin = await readContract(wagmiConfig, {
              address: cohort.cohortAddress as `0x${string}`,
              abi: deployedContract?.abi as Abi,
              functionName: "isAdmin",
              args: [address],
              chainId: cohort.chainId,
            });

            if (isAdmin) {
              validCohorts.push({
                ...cohort,
                role: "ADMIN",
              });
            }
          } catch (error) {
            console.error(`Error checking admin status for cohort ${cohort.cohortAddress}:`, error);
            continue;
          }
        }

        setAdminCohorts(validCohorts);
      } catch (error) {
        console.error("Error fetching admin cohorts:", error);
        setAdminCohorts([]);
      }

      setIsLoadingAdmin(false);
    };

    setIsLoadingAdmin(true);
    fetchAdminCohorts();
  }, [deployedContract, cohorts, address]);

  useEffect(() => {
    const fetchBuilderCohorts = async () => {
      try {
        const validCohorts: Cohort[] = [];

        for (const cohort of cohorts) {
          try {
            const builderIndex = await readContract(wagmiConfig, {
              address: cohort.cohortAddress as `0x${string}`,
              abi: deployedContract?.abi as Abi,
              functionName: "builderIndex",
              args: [address],
              chainId: cohort.chainId,
            });

            const builder = builderIndex
              ? await readContract(wagmiConfig, {
                  address: cohort.cohortAddress as `0x${string}`,
                  abi: deployedContract?.abi as Abi,
                  functionName: "activeBuilders",
                  args: [builderIndex],
                  chainId: cohort.chainId,
                })
              : null;

            if (address?.toLowerCase() === (builder as string)?.toLowerCase()) {
              validCohorts.push({
                ...cohort,
                role: "BUILDER",
              });
            }
          } catch (error) {
            console.error(`Error checking builder status for cohort ${cohort.cohortAddress}:`, error);
            continue;
          }
        }

        setBuilderCohorts(validCohorts);
      } catch (error) {
        console.error("Error fetching builder cohorts:", error);
        setBuilderCohorts([]);
      }

      setIsLoadingBuilder(false);
    };

    setIsLoadingBuilder(true);
    fetchBuilderCohorts();
  }, [deployedContract, cohorts, address]);

  // Effect to combine and sort cohorts
  useEffect(() => {
    // Create a map to deduplicate cohorts (a user might be both admin and builder)
    const cohortMap = new Map<string, Cohort>();

    // Add admin cohorts to the map
    adminCohorts.forEach(cohort => {
      const key = `${cohort.chainId}-${cohort.cohortAddress}`;
      cohortMap.set(key, { ...cohort, role: "ADMIN" });
    });

    // Add builder cohorts to the map (admin role takes precedence if already exists)
    builderCohorts.forEach(cohort => {
      const key = `${cohort.chainId}-${cohort.cohortAddress}`;
      if (!cohortMap.has(key)) {
        cohortMap.set(key, { ...cohort, role: "BUILDER" });
      }
    });

    // Convert map to array and sort by createdAt
    const combined = Array.from(cohortMap.values()).sort((a, b) => {
      // Assuming createdAt is a timestamp or can be compared directly
      // If createdAt might be in different formats, you may need additional conversion logic
      return a.createdAt > b.createdAt ? -1 : 1; // Sort descending (newest first)
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
    isLoading:
      isLoadingCohorts ||
      isConnecting ||
      isReconnecting ||
      !address ||
      (filter === "admin" ? isLoadingAdmin : filter === "builder" ? isLoadingBuilder : false),
  };
};
