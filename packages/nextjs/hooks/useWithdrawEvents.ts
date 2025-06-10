import { useEffect, useState } from "react";
import { ponderClient } from "~~/services/ponder/client";

export type WithdrawEvent = {
  id: string;
  cohortAddress: string;
  builderAddress: string;
  amount: string;
  reason: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: string;
};

export type WithdrawRequest = {
  id: string;
  cohortAddress: string;
  builderAddress: string;
  requestId: string;
  amount: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestTime: string;
  blockNumber: string;
  lastUpdated: string;
};

export const useWithdrawEvents = (cohortAddress: string, selectedAddress: string) => {
  const [withdrawnEvents, setWithdrawnEvents] = useState<WithdrawEvent[]>([]);
  const [requestEvents, setRequestEvents] = useState<WithdrawRequest[]>([]);
  const [filteredWithdrawnEvents, setFilteredWithdrawnEvents] = useState<WithdrawEvent[]>([]);
  const [filteredRequestEvents, setFilteredRequestEvents] = useState<WithdrawRequest[]>([]);
  const [pendingRequestEvents, setPendingRequestEvents] = useState<WithdrawRequest[]>([]);
  const [approvedRequestEvents, setApprovedRequestEvents] = useState<WithdrawRequest[]>([]);
  const [rejectedRequestEvents, setRejectedRequestEvents] = useState<WithdrawRequest[]>([]);
  const [completedRequestEvents, setCompletedRequestEvents] = useState<WithdrawRequest[]>([]);
  const [isLoadingWithdrawEvents, setIsLoadingWithdrawEvents] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawData = async (builderAddress?: string) => {
    if (!cohortAddress) return;

    setIsLoadingWithdrawEvents(true);
    setIsLoadingRequests(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (builderAddress) {
        params.append("builder", builderAddress);
      }

      const queryString = params.toString();
      const url = `/cohort/${cohortAddress.toLowerCase()}/withdrawals${queryString ? `?${queryString}` : ""}`;

      const response = await ponderClient.get<{
        events: WithdrawEvent[];
        requests: WithdrawRequest[];
      }>(url);

      const { events, requests } = response.data;

      setWithdrawnEvents(events);
      setRequestEvents(requests);

      const filteredEvents = events.filter(
        event => event.builderAddress.toLowerCase() === selectedAddress.toLowerCase(),
      );
      setFilteredWithdrawnEvents(filteredEvents);

      const filteredRequests = requests.filter(
        request => request.builderAddress.toLowerCase() === selectedAddress.toLowerCase(),
      );
      setFilteredRequestEvents(filteredRequests);

      const pending = requests.filter(req => req.status === "pending");
      const approved = requests.filter(req => req.status === "approved");
      const rejected = requests.filter(req => req.status === "rejected");
      const completed = requests.filter(req => req.status === "completed");

      setPendingRequestEvents(pending);
      setApprovedRequestEvents(approved);
      setRejectedRequestEvents(rejected);
      setCompletedRequestEvents(completed);
    } catch (e) {
      console.error("Error fetching withdraw data:", e);
      setError("Failed to fetch withdraw data");
    } finally {
      setIsLoadingWithdrawEvents(false);
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchWithdrawData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortAddress]);

  useEffect(() => {
    if (withdrawnEvents.length > 0 || requestEvents.length > 0) {
      const filteredEvents = withdrawnEvents.filter(
        event => event.builderAddress.toLowerCase() === selectedAddress.toLowerCase(),
      );
      setFilteredWithdrawnEvents(filteredEvents);

      const filteredRequests = requestEvents.filter(
        request => request.builderAddress.toLowerCase() === selectedAddress.toLowerCase(),
      );
      setFilteredRequestEvents(filteredRequests);
    }
  }, [selectedAddress, withdrawnEvents, requestEvents]);

  const filterEventsByAddress = (address: string) => {
    const filteredEvents = withdrawnEvents.filter(
      event => event.builderAddress.toLowerCase() === address.toLowerCase(),
    );
    setFilteredWithdrawnEvents(filteredEvents);

    const filteredRequests = requestEvents.filter(
      request => request.builderAddress.toLowerCase() === address.toLowerCase(),
    );
    setFilteredRequestEvents(filteredRequests);
  };

  const refetchWithdrawEvents = () => {
    fetchWithdrawData();
  };

  const refetchRequestEvents = () => {
    fetchWithdrawData();
  };

  return {
    withdrawnEvents,
    requestEvents,
    filteredWithdrawnEvents,
    filteredRequestEvents,
    pendingRequestEvents,
    approvedRequestEvents,
    completedRequestEvents,
    rejectedRequestEvents,
    isLoadingWithdrawEvents,
    isLoadingRequests,
    error,
    filterEventsByAddress,
    refetchWithdrawEvents,
    refetchRequestEvents,
  };
};
