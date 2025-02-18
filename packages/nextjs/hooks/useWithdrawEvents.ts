import { useEffect, useState } from "react";
import { readContract } from "@wagmi/core";
import { formatEther } from "viem";
import { Abi } from "viem";
import { useCohortEventHistory } from "~~/hooks/useCohortEventHistory";
import { useLocalDeployedContractInfo } from "~~/hooks/useLocalDeployedContractInfo";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const useWithdrawEvents = (cohortAddress: string, selectedAddress: string) => {
  const [filteredWithdrawnEvents, setFilteredWithdrawnEvents] = useState<any[]>([]);
  const [requestEvents, setRequestEvents] = useState<any[]>([]);
  const [filteredRequestEvents, setFilteredRequestEvents] = useState<any[]>([]);
  const [pendingRequestEvents, setPendingRequestEvents] = useState<any[]>([]);
  const [approvedRequestEvents, setApprovedRequestEvents] = useState<any[]>([]);

  const { data: deployedContract } = useLocalDeployedContractInfo({
    contractName: "Cohort",
  });

  const {
    data: withdrawn,
    isLoading: isLoadingWithdrawEvents,
    refetch: refetchWithdrawEvents,
  } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "Withdraw",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    blockData: true,
    watch: true,
    receiptData: true,
    contractAddress: cohortAddress,
  });

  useEffect(() => {
    if (withdrawn && withdrawn.length > 0) {
      for (let i = 0; i < withdrawn.length; i++) {
        if (!withdrawn[i].args) {
          refetchWithdrawEvents();
        }
      }
    }
  }, [withdrawn, refetchWithdrawEvents]);

  const {
    data: requests,
    isLoading: isLoadingRequests,
    refetch: refetchRequestEvents,
  } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "WithdrawalRequested",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    blockData: true,
    watch: true,
    receiptData: true,
    contractAddress: cohortAddress,
  });

  useEffect(() => {
    if (requests && requests.length > 0) {
      for (let i = 0; i < requests.length; i++) {
        if (!requests[i].args) {
          refetchRequestEvents();
        }
      }
    }
  }, [requests, refetchRequestEvents]);

  useEffect(() => {
    if (withdrawn && withdrawn.length > 0) {
      for (let i = 0; i < withdrawn.length; i++) {
        if (!withdrawn[0].args) {
          return;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const filtered = withdrawn?.filter(event => event.args && event.args[0] === selectedAddress);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setFilteredWithdrawnEvents(filtered || []);
  }, [withdrawn, selectedAddress]);

  useEffect(() => {
    if (requests && requests.length > 0) {
      for (let i = 0; i < requests.length; i++) {
        if (!requests[0].args) {
          return;
        }
      }
    }

    const extendEventWithStatus = async (event: any) => {
      try {
        const WithdrawalRequest = (await readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract?.abi as Abi,
          functionName: "withdrawalRequests",
          args: [event.args.creator, event.args.requestId],
        })) as any[];

        return {
          ...event,
          completed: WithdrawalRequest[3],
          approved: WithdrawalRequest[2],
          rejected: !WithdrawalRequest[2] && WithdrawalRequest[3],
          status: WithdrawalRequest[3]
            ? WithdrawalRequest[2]
              ? "Completed"
              : "Rejected"
            : WithdrawalRequest[2]
              ? "Approved"
              : "Pending",
        };
      } catch (e) {
        console.log("Error extending event", e);
        return {
          ...event,
          completed: false,
          approved: false,
          rejected: false,
          status: "Pending",
        };
      }
    };

    const processEvents = async () => {
      const pendingRequests: any[] = [];
      const approvedRequests: any[] = [];
      const processedEvents: any[] = [];

      if (requests) {
        for (let i = 0; i < requests.length; i++) {
          const extendedEvent = await extendEventWithStatus(requests[i]);
          processedEvents.push(extendedEvent);

          // Sort events into pending and approved categories
          if (!extendedEvent.completed) {
            if (extendedEvent.approved) {
              approvedRequests.push(extendedEvent);
            } else {
              pendingRequests.push(extendedEvent);
            }
          }
        }
      }

      setRequestEvents(processedEvents);
      setPendingRequestEvents(pendingRequests);
      setApprovedRequestEvents(approvedRequests);

      // Filter for selected address
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const filtered = processedEvents?.filter(event => event.args && event.args.creator === selectedAddress);
      setFilteredRequestEvents(filtered || []);
    };

    processEvents();
  }, [requests, selectedAddress, deployedContract?.abi, cohortAddress]);

  const filterEventsByAddress = (address: string) => {
    if (!withdrawn) {
      setFilteredWithdrawnEvents([]);
    } else {
      const filteredWithdrawn = withdrawn.filter((event: any) => event && event.args && event.args[0] === address);
      setFilteredWithdrawnEvents(filteredWithdrawn);
    }

    if (!requestEvents) {
      setFilteredRequestEvents([]);
    } else {
      const filteredRequests = requestEvents.filter(
        (event: any) => event && event.args && event.args.creator === address,
      );
      setFilteredRequestEvents(filteredRequests);
    }
  };

  return {
    withdrawnEvents: withdrawn,
    requestEvents,
    filteredWithdrawnEvents,
    filteredRequestEvents,
    pendingRequestEvents,
    approvedRequestEvents,
    isLoadingWithdrawEvents,
    isLoadingRequests,
    filterEventsByAddress,
  };
};
