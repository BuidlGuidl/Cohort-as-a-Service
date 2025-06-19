import { useLocalDeployedContractInfo } from "./useLocalDeployedContractInfo";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { formatEther, formatUnits } from "viem";
import { erc20Abi } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

export type BuilderStreamInfo = {
  cap: bigint;
  last: bigint;
};

export type CohortData = {
  name: string;
  description: string;
  isERC20: boolean;
  isONETIME: boolean;
  cycle: number;
  tokenAddress: string | null;
  tokenSymbol: string | null;
  tokenDecimals: number;
  primaryAdmin: string;
  locked: boolean;
  requiresApproval: boolean;
  allowApplications: boolean;
  balance: number;
  activeBuilders: string[];
  builderStreams: Map<
    string,
    {
      builderAddress: string;
      cap: number;
      last: number;
      unlockedAmount: number;
      requiresApproval: boolean;
    }
  >;
  isAdmin: boolean;
  isBuilder: boolean;
  oneTimeAlreadyWithdrawn: boolean;
  chainName?: string;
  chainId?: AllowedChainIds;
  admins: string[];
  connectedAddressRequiresApproval: boolean;
};

interface CohortStateResponse {
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
  cohortState: {
    id: string;
    cohortAddress: string;
    chainId: number;
    isERC20: boolean;
    isONETIME: boolean;
    tokenAddress: string | null;
    cycle: string;
    locked: boolean;
    requireApprovalForWithdrawals: boolean;
    allowApplications: boolean;
    tokenSymbol: string | null;
    tokenDecimals: number;
    lastUpdated: string;
  };
  builders: {
    items: {
      id: string;
      cohortAddress: string;
      builderAddress: string;
      cap: string;
      last: string;
      requiresApproval: boolean;
      addedAt: string;
      blockNumber: string;
      isActive: boolean;
    }[];
  };
  admins: {
    items: {
      id: string;
      cohortAddress: string;
      adminAddress: string;
      addedAt: string;
      blockNumber: string;
      isActive: boolean;
    }[];
  };
  withdrawEvents: {
    items: {
      id: string;
      cohortAddress: string;
      builderAddress: string;
      amount: string;
      reason: string;
      timestamp: string;
      transactionHash: string;
      blockNumber: string;
    }[];
  };
}

const fetchCohortData = async (cohortAddress: string) => {
  const query = gql`
    query GetCohortData($cohortAddress: String!) {
      cohorts(where: { address: $cohortAddress }) {
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
      cohortState(id: $cohortAddress) {
        id
        cohortAddress
        chainId
        isERC20
        isONETIME
        tokenAddress
        cycle
        locked
        requireApprovalForWithdrawals
        allowApplications
        tokenSymbol
        tokenDecimals
        lastUpdated
      }
      builders(where: { cohortAddress: $cohortAddress, isActive: true }) {
        items {
          id
          cohortAddress
          builderAddress
          cap
          last
          requiresApproval
          addedAt
          blockNumber
          isActive
        }
      }
      admins(where: { cohortAddress: $cohortAddress, isActive: true }) {
        items {
          id
          cohortAddress
          adminAddress
          addedAt
          blockNumber
          isActive
        }
      }
      withdrawEvents(where: { cohortAddress: $cohortAddress }) {
        items {
          id
          cohortAddress
          builderAddress
          amount
          reason
          timestamp
          transactionHash
          blockNumber
        }
      }
    }
  `;

  const variables = {
    cohortAddress: cohortAddress.toLowerCase(),
  };

  const data = await request<CohortStateResponse>(
    process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069",
    query,
    variables,
  );

  return data;
};

const defaultCohortData: CohortData = {
  name: "",
  description: "",
  isERC20: false,
  isONETIME: false,
  cycle: 0,
  tokenAddress: null,
  tokenSymbol: null,
  tokenDecimals: 18,
  primaryAdmin: "",
  locked: false,
  requiresApproval: false,
  allowApplications: false,
  balance: 0,
  activeBuilders: [],
  builderStreams: new Map(),
  isAdmin: false,
  isBuilder: false,
  oneTimeAlreadyWithdrawn: false,
  chainName: "",
  chainId: undefined,
  admins: [],
  connectedAddressRequiresApproval: false,
};

export const useCohortData = (cohortAddress: string) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: deployedContract } = useLocalDeployedContractInfo({
    contractName: "Cohort",
  });

  const query = useQuery<CohortData>({
    queryKey: ["cohortData", cohortAddress, address],
    queryFn: async (): Promise<CohortData> => {
      const response = await fetchCohortData(cohortAddress);

      if (!response.cohorts?.items?.length || !response.cohortState) {
        throw new Error("Cohort not found");
      }

      const cohort = response.cohorts.items[0];
      const cohortState = response.cohortState;
      const builders = response.builders?.items || [];
      const admins = response.admins?.items || [];
      const withdrawEvents = response.withdrawEvents?.items || [];

      const chainId = cohort.chainId as AllowedChainIds;

      if (!deployedContract) {
        throw new Error(`No deployed contract found for chain ${chainId}`);
      }

      const buildersAddresses = builders.map(builder => builder.builderAddress);

      const adminAddresses = admins.map(admin => admin.adminAddress);

      const builderStreams = new Map();

      const unlockedAmountsPromises = builders.map(async builder => {
        const cap = parseFloat(
          cohortState.isERC20
            ? formatUnits(BigInt(builder.cap), cohortState.tokenDecimals || 18)
            : formatEther(BigInt(builder.cap)),
        );

        let unlockedAmount = 0;

        if (publicClient) {
          try {
            const available = await publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "unlockedBuilderAmount",
              args: [builder.builderAddress as `0x${string}`],
            });

            unlockedAmount = parseFloat(
              cohortState.isERC20
                ? formatUnits(available as bigint, cohortState.tokenDecimals || 18)
                : formatEther(available as bigint),
            );
          } catch (error) {
            console.warn(`Failed to fetch unlocked amount for ${builder.builderAddress}:`, error);
            unlockedAmount = 0;
          }
        }

        return {
          builderAddress: builder.builderAddress,
          cap,
          last: parseInt(builder.last),
          unlockedAmount,
          requiresApproval: builder.requiresApproval || false,
        };
      });

      const builderStreamData = await Promise.all(unlockedAmountsPromises);

      builderStreamData.forEach(streamData => {
        builderStreams.set(streamData.builderAddress, streamData);
      });

      const isAdmin = address
        ? cohort.primaryAdmin.toLowerCase() === address.toLowerCase() ||
          adminAddresses.some(admin => admin.toLowerCase() === address.toLowerCase())
        : false;

      const isBuilder = address
        ? buildersAddresses.some(builder => builder.toLowerCase() === address.toLowerCase())
        : false;

      const userBuilder = builders.find(builder => builder.builderAddress.toLowerCase() === address?.toLowerCase());
      const connectedAddressRequiresApproval = userBuilder?.requiresApproval || false;

      const oneTimeAlreadyWithdrawn =
        cohortState.isONETIME && address
          ? withdrawEvents.some(event => event.builderAddress.toLowerCase() === address.toLowerCase())
          : false;

      let balance = 0;
      let tokenDecimals = cohortState.tokenDecimals || 18;

      if (publicClient) {
        try {
          if (cohortState.isERC20 && cohortState.tokenAddress) {
            const tokenBalance = await publicClient.readContract({
              address: cohortState.tokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [cohortAddress as `0x${string}`],
            });

            const decimals = await publicClient.readContract({
              address: cohortState.tokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: "decimals",
            });

            tokenDecimals = decimals || 18;
            balance = parseFloat(formatUnits(tokenBalance as bigint, decimals));
          } else {
            const ethBalance = await publicClient.getBalance({
              address: cohortAddress as `0x${string}`,
            });
            balance = parseFloat(formatEther(ethBalance || BigInt(0)));
          }
        } catch (error) {
          console.warn(`Failed to fetch balance for cohort ${cohortAddress}:`, error);
          balance = 0;
        }
      }

      return {
        name: cohort.name,
        description: cohort.description,
        isERC20: cohortState.isERC20,
        isONETIME: cohortState.isONETIME,
        cycle: parseInt(cohortState.cycle) / (60 * 60 * 24),
        tokenAddress: cohortState.tokenAddress,
        tokenSymbol: cohortState.tokenSymbol,
        tokenDecimals,
        primaryAdmin: cohort.primaryAdmin,
        locked: cohortState.locked,
        requiresApproval: cohortState.requireApprovalForWithdrawals,
        allowApplications: cohortState.allowApplications,
        balance,
        activeBuilders: buildersAddresses,
        builderStreams,
        isAdmin,
        isBuilder,
        oneTimeAlreadyWithdrawn,
        chainName: cohort.chainName,
        chainId: cohort.chainId as AllowedChainIds,
        admins: adminAddresses,
        connectedAddressRequiresApproval,
      };
    },
    enabled: !!cohortAddress && !!publicClient,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 3,
  });

  return {
    ...defaultCohortData,
    ...query.data,
    isLoading: query.isLoading,
    error: query.error?.message || null,
  };
};
