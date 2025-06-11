import { useLocalDeployedContractInfo } from "./useLocalDeployedContractInfo";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { gql, request } from "graphql-request";
import { Abi } from "viem";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export type WithdrawalEvent = {
  id: string;
  cohortAddress: string;
  builderAddress: string;
  amount: string;
  reason: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: number;
};

export interface WithdrawEventResponse {
  withdrawEvents: {
    items: WithdrawalEvent[];
  };
}

export type WithdrawalRequest = {
  id: string;
  cohortAddress: string;
  builderAddress: string;
  requestId: string;
  amount: string;
  reason: string;
  status: string;
  requestTime: string;
  blockNumber: number;
  lastUpdated: string;
};

export interface WithdrawRequestResponse {
  withdrawRequests: {
    items: WithdrawalRequest[];
  };
}

const graphqlEndpoint = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";

const WITHDRAW_EVENTS_QUERY = gql`
  query WithdrawEvents($cohortAddress: String!) {
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

const WITHDRAW_REQUESTS_QUERY = gql`
  query WithdrawRequests($cohortAddress: String!) {
    withdrawRequests(where: { cohortAddress: $cohortAddress }) {
      items {
        id
        cohortAddress
        builderAddress
        requestId
        amount
        reason
        status
        requestTime
        blockNumber
        lastUpdated
      }
    }
  }
`;

export const useWithdrawEvents = (cohortAddress: string, selectedAddress: string) => {
  const { data: deployedContract } = useLocalDeployedContractInfo({
    contractName: "Cohort",
  });

  const { data: withdrawEvents, isLoading: isLoadingWithdrawEvents } = useQuery({
    queryKey: ["withdraw_events", cohortAddress],
    queryFn: async () => {
      const res = await request<WithdrawEventResponse>(graphqlEndpoint, WITHDRAW_EVENTS_QUERY, {
        cohortAddress: cohortAddress.toLowerCase(),
      });

      return res.withdrawEvents.items;
    },
    enabled: !!cohortAddress,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });

  const { data: withdrawRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["withdraw_requests", cohortAddress],
    queryFn: async () => {
      const res = await request<WithdrawRequestResponse>(graphqlEndpoint, WITHDRAW_REQUESTS_QUERY, {
        cohortAddress: cohortAddress.toLowerCase(),
      });
      return res.withdrawRequests.items;
    },
    enabled: !!cohortAddress,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });

  const processRequests = async (requests: any[]) => {
    const processedEvents = await Promise.all(
      requests.map(async event => {
        try {
          const res = (await readContract(wagmiConfig, {
            address: cohortAddress as `0x${string}`,
            abi: deployedContract?.abi as Abi,
            functionName: "withdrawRequests",
            args: [event.builderAddress, BigInt(event.requestId)],
          })) as any[];

          const completed = res[3];
          const approved = res[2];
          const rejected = !res[2] && res[3];

          return {
            ...event,
            completed,
            approved,
            rejected,
            status: completed ? (approved ? "Completed" : "Rejected") : approved ? "Approved" : "Pending",
            args: {
              builder: event.builderAddress,
              requestId: BigInt(event.requestId),
            },
          };
        } catch (err) {
          return {
            ...event,
            completed: false,
            approved: false,
            rejected: false,
            status: "Pending",
            args: {
              builder: event.builderAddress,
              requestId: BigInt(event.requestId),
            },
          };
        }
      }),
    );

    return processedEvents;
  };

  const { data: enrichedRequests = [] } = useQuery({
    queryKey: ["enriched_withdraw_requests", cohortAddress, withdrawRequests],
    queryFn: () => processRequests(withdrawRequests || []),
    enabled: !!withdrawRequests && !!deployedContract?.abi,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });

  const filteredWithdrawnEvents = (withdrawEvents || []).filter(
    event => event.builderAddress.toLowerCase() === selectedAddress.toLowerCase(),
  );

  const filteredRequestEvents = enrichedRequests.filter(
    event => event.builderAddress.toLowerCase() === selectedAddress.toLowerCase(),
  );

  const pendingRequestEvents = enrichedRequests.filter(r => r.status === "Pending");
  const approvedRequestEvents = enrichedRequests.filter(r => r.status === "Approved");
  const rejectedRequestEvents = enrichedRequests.filter(r => r.status === "Rejected");
  const completedRequestEvents = enrichedRequests.filter(r => r.status === "Completed");

  const filterEventsByAddress = (address: string) => {
    return {
      filteredWithdrawnEvents:
        withdrawEvents?.filter(event => event.builderAddress.toLowerCase() === address.toLowerCase()) || [],
      filteredRequestEvents:
        enrichedRequests.filter(event => event.builderAddress.toLowerCase() === address.toLowerCase()) || [],
    };
  };

  return {
    withdrawnEvents: withdrawEvents || [],
    requestEvents: enrichedRequests,
    filteredWithdrawnEvents,
    filteredRequestEvents,
    pendingRequestEvents,
    approvedRequestEvents,
    completedRequestEvents,
    rejectedRequestEvents,
    isLoadingWithdrawEvents,
    isLoadingRequests,
    filterEventsByAddress,
  };
};
