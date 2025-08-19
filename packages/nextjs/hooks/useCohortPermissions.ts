"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useDeployedContractInfo } from "./scaffold-eth";
import { readContract } from "@wagmi/core";
import { Abi } from "viem";
import { useAccount } from "wagmi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

/**
 * Hook to determine if the current user has admin/owner permissions for the current cohort
 * Returns null if not on a cohort page, true/false if on a cohort page
 */
export const useCohortPermissions = () => {
  const pathname = usePathname();
  const { address } = useAccount();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: deployedContract } = useDeployedContractInfo("Cohort");

  // Extract cohort address from pathname if on cohort page
  const cohortMatch = pathname.match(/^\/cohort\/([^\/]+)/);
  const cohortAddress = cohortMatch ? cohortMatch[1] : null;
  const isOnCohortPage = !!cohortAddress;

  useEffect(() => {
    if (!isOnCohortPage || !address || !deployedContract || !cohortAddress) {
      setIsAdmin(null);
      setIsLoading(false);
      return;
    }

    const checkAdminStatus = async () => {
      setIsLoading(true);
      try {
        // Try to read from the contract to check if user is admin
        const adminStatus = await readContract(wagmiConfig, {
          address: cohortAddress as `0x${string}`,
          abi: deployedContract.abi as Abi,
          functionName: "isAdmin",
          args: [address],
          // We'll try with a default chainId and let wagmi handle chain switching if needed
        });

        setIsAdmin(adminStatus as boolean);
      } catch (error) {
        console.error("Error checking admin status:", error);
        // If contract call fails, assume not admin
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [address, cohortAddress, deployedContract, isOnCohortPage]);

  return {
    isOnCohortPage,
    isAdmin,
    isLoading,
    cohortAddress,
  };
};
