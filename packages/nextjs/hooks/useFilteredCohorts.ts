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

  const { address, isReconnecting } = useAccount();
  const { data: deployedContract } = useLocalDeployedContractInfo({ contractName: "Cohort" });

  useEffect(() => {
    if (!address) return;
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
    if (!address) return;
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

  useEffect(() => {
    const cohortMap = new Map<string, Cohort>();

    adminCohorts.forEach(cohort => {
      const key = `${cohort.chainId}-${cohort.cohortAddress}`;
      cohortMap.set(key, { ...cohort, role: "ADMIN" });
    });

    builderCohorts.forEach(cohort => {
      const key = `${cohort.chainId}-${cohort.cohortAddress}`;
      if (!cohortMap.has(key)) {
        cohortMap.set(key, { ...cohort, role: "BUILDER" });
      }
    });

    const combined = Array.from(cohortMap.values()).sort((a, b) => {
      return a.createdAt > b.createdAt ? -1 : 1;
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
      isReconnecting ||
      !address ||
      (filter === "admin" ? isLoadingAdmin : filter === "builder" ? isLoadingBuilder : false),
  };
};
