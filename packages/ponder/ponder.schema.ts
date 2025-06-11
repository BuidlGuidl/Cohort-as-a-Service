// packages/ponder/ponder.schema.ts
import { onchainTable } from "ponder";

export const cohort = onchainTable("cohort", (t) => ({
  id: t.text().primaryKey(),
  address: t.hex().notNull(),
  chainId: t.integer().notNull(),
  chainName: t.text().notNull(),
  primaryAdmin: t.hex().notNull(),
  name: t.text().notNull(),
  description: t.text().notNull(),
  createdAt: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  blockNumber: t.bigint().notNull(),
}));

export const builder = onchainTable("builder", (t) => ({
  id: t.text().primaryKey(),
  cohortAddress: t.hex().notNull(),
  builderAddress: t.hex().notNull(),
  cap: t.bigint().notNull(),
  last: t.bigint().notNull(),
  requiresApproval: t.boolean().notNull().default(false),
  addedAt: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  isActive: t.boolean().notNull().default(true),
}));

export const admin = onchainTable("admin", (t) => ({
  id: t.text().primaryKey(),
  cohortAddress: t.hex().notNull(),
  adminAddress: t.hex().notNull(),
  addedAt: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  isActive: t.boolean().notNull().default(true),
}));

export const withdrawEvent = onchainTable("withdraw_event", (t) => ({
  id: t.text().primaryKey(),
  cohortAddress: t.hex().notNull(),
  builderAddress: t.hex().notNull(),
  amount: t.bigint().notNull(),
  reason: t.text().notNull(),
  timestamp: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  blockNumber: t.bigint().notNull(),
}));

export const withdrawRequest = onchainTable("withdraw_request", (t) => ({
  id: t.text().primaryKey(),
  cohortAddress: t.hex().notNull(),
  builderAddress: t.hex().notNull(),
  requestId: t.bigint().notNull(),
  amount: t.bigint().notNull(),
  reason: t.text().notNull(),
  status: t.text().notNull(),
  requestTime: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  lastUpdated: t.bigint().notNull(),
}));

export const cohortState = onchainTable("cohort_state", (t) => ({
  id: t.text().primaryKey(),
  cohortAddress: t.hex().notNull(),
  chainId: t.integer().notNull(),
  isERC20: t.boolean().notNull(),
  isONETIME: t.boolean().notNull(),
  tokenAddress: t.hex(),
  cycle: t.bigint().notNull(),
  locked: t.boolean().notNull().default(false),
  requireApprovalForWithdrawals: t.boolean().notNull().default(false),
  allowApplications: t.boolean().notNull().default(false),
  tokenSymbol: t.text(),
  tokenDecimals: t.integer().default(18),
  lastUpdated: t.bigint().notNull(),
}));
