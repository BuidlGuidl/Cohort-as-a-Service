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
  const [adminCohorts, setAdminCohorts] = useState(cohorts);
  const [creatorCohorts, setCreatorCohorts] = useState(cohorts);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [isLoadingCreator, setIsLoadingCreator] = useState(true);




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
    const fetchCreatorCohorts = async () => {
      try {
        const validCohorts = [];

        for (const cohort of cohorts) {
          try {
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
          } catch (error) {
            console.error(`Error checking creator status for cohort ${cohort.cohortAddress}:`, error);
            continue;
          }
        }

        setCreatorCohorts(validCohorts);
      } catch (error) {
        console.error("Error fetching creator cohorts:", error);
        setCreatorCohorts([]);
      }

      setIsLoadingCreator(false);
    };

    setIsLoadingCreator(true);
    fetchCreatorCohorts();
  }, [deployedContract, cohorts, address]);

  const getFilteredCohorts = () => {
    if (!filter) return cohorts;
    if (filter === "admin") return adminCohorts;
    if (filter === "creator") return creatorCohorts;
    return [];
  };

  return {
    cohorts: getFilteredCohorts(),
    isLoading:
      isLoadingCohorts ||
      isConnecting ||
      isReconnecting ||
      !address ||
      (filter === "admin" ? isLoadingAdmin : filter === "creator" ? isLoadingCreator : false),
  };
};
