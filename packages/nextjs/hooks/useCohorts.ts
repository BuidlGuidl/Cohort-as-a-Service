import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { useAccount } from "wagmi";

export type Cohort = {
  id: string;
  address: string;
  chainId: number;
  chainName: string;
  primaryAdmin: string;
  name: string;
  description: string;
  createdAt: string;
  transactionHash: string;
  blockNumber: string;
};

type GraphQLCohortsResponse = {
  cohorts: {
    items: {
      id: string;
      address: string;
      chainId: number;
      chainName: string;
      primaryAdmin: string;
      name: string;
      description: string;
      createdAt: string;
      transactionHash: string;
      blockNumber: string;
    }[];
  };
  builders?: {
    items: {
      cohortAddress: string;
      builderAddress: string;
      isActive: boolean;
    }[];
  };
  admins?: {
    items: {
      cohortAddress: string;
      adminAddress: string;
      isActive: boolean;
    }[];
  };
};

const fetchCohorts = async (address?: string) => {
  let query: string;

  if (address) {
    query = gql`
      query GetCohorts {
        cohorts {
          items {
            id
            address
            chainId
            chainName
            primaryAdmin
            name
            description
            createdAt
            transactionHash
            blockNumber
          }
        }
        builders(where: { builderAddress: "${address.toLowerCase()}", isActive: true }) {
          items {
            cohortAddress
            builderAddress
            isActive
          }
        }
        admins(where: { adminAddress: "${address.toLowerCase()}", isActive: true }) {
          items {
            cohortAddress
            adminAddress
            isActive
          }
        }
      }
    `;
  } else {
    query = gql`
      query GetCohorts {
        cohorts {
          items {
            id
            address
            chainId
            chainName
            primaryAdmin
            name
            description
            createdAt
            transactionHash
            blockNumber
          }
        }
      }
    `;
  }

  const data = await request<GraphQLCohortsResponse>(
    process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069",
    query,
  );

  return data;
};

export const useCohorts = () => {
  const { address } = useAccount();

  return useQuery<Cohort[]>({
    queryKey: ["cohorts", address],
    queryFn: async (): Promise<Cohort[]> => {
      const response = await fetchCohorts(address);

      let filteredCohorts = response.cohorts.items;

      if (address && (response.builders || response.admins)) {
        const userCohortAddresses = new Set<string>();

        filteredCohorts.forEach(cohort => {
          if (cohort.primaryAdmin.toLowerCase() === address.toLowerCase()) {
            userCohortAddresses.add(cohort.address.toLowerCase());
          }
        });

        response.admins?.items.forEach(admin => {
          userCohortAddresses.add(admin.cohortAddress.toLowerCase());
        });

        response.builders?.items.forEach(builder => {
          userCohortAddresses.add(builder.cohortAddress.toLowerCase());
        });

        filteredCohorts = filteredCohorts.filter(cohort => userCohortAddresses.has(cohort.address.toLowerCase()));
      }

      return filteredCohorts.map(cohort => ({
        ...cohort,
        createdAt: cohort.createdAt,
        blockNumber: cohort.blockNumber,
      }));
    },
    enabled: true,
    staleTime: 2 * 60_000, // Consider data fresh for 2 minutes
    refetchInterval: 5 * 60_000, // Auto-refetch every 5 minutes (reduced from default)
    refetchIntervalInBackground: false, // Don't refetch when tab is not visible
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 3,
  });
};
