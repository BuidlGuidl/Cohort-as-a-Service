import { useEffect, useState } from "react";
import { gql, request } from "graphql-request";
import { useAccount } from "wagmi";
import { chains } from "~~/data/chains";

export type ChainAnalytics = {
  chainId: number;
  chainName: string;
  totalCohorts: number;
  totalBuilders: number;
  totalWithdrawn: bigint;
  activeBuilders: number;
};

export type CohortAnalytics = {
  id: string;
  address: string;
  name: string;
  chainId: number;
  chainName: string;
  isERC20: boolean;
  tokenSymbol?: string;
  tokenDecimals: number;
  totalBuilders: number;
  activeBuilders: number;
  totalWithdrawn: bigint;
  createdAt: bigint;
};

export type AnalyticsData = {
  chainAnalytics: ChainAnalytics[];
  cohortAnalytics: CohortAnalytics[];
};

export type UseAnalyticsReturn = {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  refetch: () => Promise<void>;
};

const ANALYTICS_QUERY = gql`
  query GetAnalytics {
    cohorts {
      items {
        id
        address
        name
        chainId
        chainName
        createdAt
      }
    }
    cohortStates {
      items {
        id
        cohortAddress
        chainId
        isERC20
        tokenSymbol
        tokenDecimals
      }
    }
    builders {
      items {
        cohortAddress
        isActive
      }
    }
    withdrawEvents {
      items {
        cohortAddress
        amount
      }
    }
  }
`;

export const useAnalytics = (): UseAnalyticsReturn => {
  const { address } = useAccount();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!address) {
      setIsAdmin(false);
      return;
    }

    const bgAdmins = process.env.NEXT_PUBLIC_BG_ADMINS?.split(",").map(addr => addr.toLowerCase()) || [];
    setIsAdmin(bgAdmins.includes(address.toLowerCase()));
  }, [address]);

  const fetchAnalytics = async () => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      const response: any = await request(
        process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069",
        ANALYTICS_QUERY,
      );

      const chainMap = new Map<number, ChainAnalytics>();
      chains.forEach(chain => {
        chainMap.set(chain.chainId, {
          chainId: chain.chainId,
          chainName: chain.name,
          totalCohorts: 0,
          totalBuilders: 0,
          totalWithdrawn: 0n,
          activeBuilders: 0,
        });
      });

      const cohortMap = new Map<string, CohortAnalytics>();

      response.cohorts.items.forEach((cohort: any) => {
        const cohortState = response.cohortStates.items.find((state: any) => state.cohortAddress === cohort.address);

        cohortMap.set(cohort.address, {
          id: cohort.id,
          address: cohort.address,
          name: cohort.name,
          chainId: cohort.chainId,
          chainName: cohort.chainName,
          isERC20: cohortState?.isERC20 || false,
          tokenSymbol: cohortState?.tokenSymbol,
          tokenDecimals: cohortState?.tokenDecimals || 18,
          totalBuilders: 0,
          activeBuilders: 0,
          totalWithdrawn: 0n,
          createdAt: BigInt(cohort.createdAt),
        });

        const chain = chainMap.get(cohort.chainId);
        if (chain) {
          chain.totalCohorts++;
        }
      });

      response.builders.items.forEach((builder: any) => {
        const cohort = cohortMap.get(builder.cohortAddress);
        if (cohort) {
          cohort.totalBuilders++;

          if (builder.isActive) {
            cohort.activeBuilders++;

            const chain = chainMap.get(cohort.chainId);
            if (chain) {
              chain.activeBuilders++;
            }
          }

          const chain = chainMap.get(cohort.chainId);
          if (chain) {
            chain.totalBuilders++;
          }
        }
      });

      response.withdrawEvents.items.forEach((withdraw: any) => {
        const cohort = cohortMap.get(withdraw.cohortAddress);
        if (cohort) {
          cohort.totalWithdrawn += BigInt(withdraw.amount);

          const chain = chainMap.get(cohort.chainId);
          if (chain) {
            chain.totalWithdrawn += BigInt(withdraw.amount);
          }
        }
      });

      setData({
        chainAnalytics: Array.from(chainMap.values()),
        cohortAnalytics: Array.from(cohortMap.values()),
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    } else {
      setData(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  return {
    data,
    loading,
    error,
    isAdmin,
    refetch: fetchAnalytics,
  };
};
