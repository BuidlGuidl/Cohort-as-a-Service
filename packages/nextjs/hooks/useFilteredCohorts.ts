import { useEffect, useState } from "react";
import { useCohorts } from "./useCohorts";
import { useLocalDeployedContractInfo } from "./useLocalDeployedContractInfo";
import { readContract } from "@wagmi/core";
import { Abi } from "abitype";
import { useAccount } from "wagmi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

interface useFilteredCohortsProps {
  filter?: "admin" | "builder";
  chainId?: AllowedChainIds;
  cohort?: string;
}

export const useFilteredCohorts = ({ filter, chainId, cohort }: useFilteredCohortsProps) => {
  const { cohorts, isLoading: isLoadingCohorts } = useCohorts({ chainId, cohort });
  const [adminCohorts, setAdminCohorts] = useState(cohorts);
  const [builderCohorts, setBuilderCohorts] = useState(cohorts);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [isLoadingBuilder, setIsLoadingBuilder] = useState(true);

  const { address, isConnecting, isReconnecting } = useAccount();
  const { data: deployedContract } = useLocalDeployedContractInfo({ contractName: "Cohort" });

  useEffect(() => {
    const fetchAdminCohorts = async () => {
      try {
        const validCohorts = [];

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
              validCohorts.push(cohort);
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
        const validCohorts = [];

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
              validCohorts.push(cohort);
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

  const getFilteredCohorts = () => {
    if (!filter) return cohorts;
    if (filter === "admin") return adminCohorts;
    if (filter === "builder") return builderCohorts;
    return [];
  };

  return {
    cohorts: getFilteredCohorts(),
    isLoading:
      isLoadingCohorts ||
      isConnecting ||
      isReconnecting ||
      !address ||
      (filter === "admin" ? isLoadingAdmin : filter === "builder" ? isLoadingBuilder : false),
  };
};
