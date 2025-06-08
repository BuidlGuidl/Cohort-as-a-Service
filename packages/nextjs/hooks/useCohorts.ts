// packages/nextjs/hooks/useCohorts.ts
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { PonderCohort, ponderClient } from "~~/services/ponder/client";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

interface useCohortsProps {
  chainId?: AllowedChainIds;
  cohort?: string;
}

export const useCohorts = ({ chainId, cohort }: useCohortsProps) => {
  const [cohorts, setCohorts] = useState<PonderCohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    const fetchCohorts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (chainId) params.append("chainId", chainId.toString());
        if (cohort) params.append("cohort", cohort);
        if (address) params.append("address", address);

        const response = await ponderClient.get<{ cohorts: PonderCohort[] }>(`/cohorts?${params.toString()}`);

        setCohorts(response.data.cohorts);
      } catch (err) {
        console.error("Error fetching cohorts from Ponder:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch cohorts");
        setCohorts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCohorts();
  }, [chainId, cohort, address]);

  return {
    cohorts,
    isLoading,
    error,
  };
};
