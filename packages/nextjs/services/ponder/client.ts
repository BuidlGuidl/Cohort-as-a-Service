import axios from "axios";

const PONDER_API_URL = process.env.NEXT_PUBLIC_PONDER_API_URL || "http://localhost:42069";

export const ponderClient = axios.create({
  baseURL: PONDER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface PonderCohort {
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
  role?: "ADMIN" | "BUILDER" | null;
}

export interface PonderBuilder {
  id: string;
  cohortAddress: string;
  builderAddress: string;
  cap: string;
  last: string;
  addedAt: string;
  blockNumber: string;
  isActive: boolean;
}

export interface PonderAdmin {
  id: string;
  cohortAddress: string;
  adminAddress: string;
  addedAt: string;
  blockNumber: string;
  isActive: boolean;
}

export interface PonderCohortState {
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
  lastUpdated: string;
}

export interface PonderWithdrawEvent {
  id: string;
  cohortAddress: string;
  builderAddress: string;
  amount: string;
  reason: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: string;
}

export interface PonderWithdrawRequest {
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
}
