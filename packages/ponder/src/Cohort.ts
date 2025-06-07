// packages/ponder/src/Cohort.ts
import { ponder } from "ponder:registry";
import {
  builder,
  admin,
  withdrawEvent,
  withdrawRequest,
  cohortState,
} from "ponder:schema";
import { eq } from "drizzle-orm";

// Index AddBuilder events
ponder.on("Cohort:AddBuilder", async ({ event, context }) => {
  const builderAddress = event.args.to;
  const cap = event.args.amount;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db
    .insert(builder)
    .values({
      id: `${cohortAddress}-${builderAddress.toLowerCase()}`,
      cohortAddress: cohortAddress as `0x${string}`,
      builderAddress: builderAddress.toLowerCase() as `0x${string}`,
      cap,
      last: 0n,
      addedAt: event.block.timestamp,
      blockNumber: event.block.number,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: builder.id,
      set: {
        cap,
        isActive: true,
        blockNumber: event.block.number,
      },
    });
});

// Index UpdateBuilder events
ponder.on("Cohort:UpdateBuilder", async ({ event, context }) => {
  const builderAddress = event.args.to;
  const newCap = event.args.amount;
  const cohortAddress = event.log.address.toLowerCase();

  if (newCap === 0n) {
    // Builder removed
    await context.db
      .update(builder)
      .set({
        cap: newCap,
        isActive: false,
        blockNumber: event.block.number,
      })
      .where(
        eq(builder.id, `${cohortAddress}-${builderAddress.toLowerCase()}`)
      );
  } else {
    // Builder updated
    await context.db
      .update(builder)
      .set({
        cap: newCap,
        blockNumber: event.block.number,
      })
      .where(
        eq(builder.id, `${cohortAddress}-${builderAddress.toLowerCase()}`)
      );
  }
});

// Index AdminAdded events
ponder.on("Cohort:AdminAdded", async ({ event, context }) => {
  const adminAddress = event.args.to;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db
    .insert(admin)
    .values({
      id: `${cohortAddress}-${adminAddress.toLowerCase()}`,
      cohortAddress: cohortAddress as `0x${string}`,
      adminAddress: adminAddress.toLowerCase() as `0x${string}`,
      addedAt: event.block.timestamp,
      blockNumber: event.block.number,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: admin.id,
      set: {
        isActive: true,
        blockNumber: event.block.number,
      },
    });
});

// Index AdminRemoved events
ponder.on("Cohort:AdminRemoved", async ({ event, context }) => {
  const adminAddress = event.args.to;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db
    .update(admin)
    .set({
      isActive: false,
      blockNumber: event.block.number,
    })
    .where(eq(admin.id, `${cohortAddress}-${adminAddress.toLowerCase()}`));
});

// Index Withdraw events
ponder.on("Cohort:Withdraw", async ({ event, context }) => {
  const { to: builderAddress, amount, reason } = event.args;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db.insert(withdrawEvent).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    cohortAddress: cohortAddress as `0x${string}`,
    builderAddress: builderAddress.toLowerCase() as `0x${string}`,
    amount,
    reason,
    timestamp: event.block.timestamp,
    transactionHash: event.transaction.hash,
    blockNumber: event.block.number,
  });
});

// Index WithdrawRequested events
ponder.on("Cohort:WithdrawRequested", async ({ event, context }) => {
  const { builder: builderAddress, requestId, amount, reason } = event.args;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db.insert(withdrawRequest).values({
    id: `${cohortAddress}-${builderAddress.toLowerCase()}-${requestId}`,
    cohortAddress: cohortAddress as `0x${string}`,
    builderAddress: builderAddress.toLowerCase() as `0x${string}`,
    requestId,
    amount,
    reason,
    status: "pending",
    requestTime: event.block.timestamp,
    blockNumber: event.block.number,
    lastUpdated: event.block.timestamp,
  });
});

// Update request status on approval
ponder.on("Cohort:WithdrawApproved", async ({ event, context }) => {
  const { builder: builderAddress, requestId } = event.args;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db
    .update(withdrawRequest)
    .set({
      status: "approved",
      lastUpdated: event.block.timestamp,
    })
    .where(
      eq(
        withdrawRequest.id,
        `${cohortAddress}-${builderAddress.toLowerCase()}-${requestId}`
      )
    );
});

// Update request status on rejection
ponder.on("Cohort:WithdrawRejected", async ({ event, context }) => {
  const { builder: builderAddress, requestId } = event.args;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db
    .update(withdrawRequest)
    .set({
      status: "rejected",
      lastUpdated: event.block.timestamp,
    })
    .where(
      eq(
        withdrawRequest.id,
        `${cohortAddress}-${builderAddress.toLowerCase()}-${requestId}`
      )
    );
});

// Update request status on completion
ponder.on("Cohort:WithdrawCompleted", async ({ event, context }) => {
  const { builder: builderAddress, requestId } = event.args;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db
    .update(withdrawRequest)
    .set({
      status: "completed",
      lastUpdated: event.block.timestamp,
    })
    .where(
      eq(
        withdrawRequest.id,
        `${cohortAddress}-${builderAddress.toLowerCase()}-${requestId}`
      )
    );
});

// Index ContractLocked events
ponder.on("Cohort:ContractLocked", async ({ event, context }) => {
  const locked = event.args.locked;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db
    .update(cohortState)
    .set({
      locked,
      lastUpdated: event.block.timestamp,
    })
    .where(eq(cohortState.id, cohortAddress));
});

// Index ApprovalRequirementChanged events
ponder.on("Cohort:ApprovalRequirementChanged", async ({ event, context }) => {
  const cohortAddress = event.log.address.toLowerCase();
  const builderAddress = event.args.builder;
  const requiresApproval = event.args.requiresApproval;

  // If builder is zero address, it's a contract-wide setting
  if (builderAddress === "0x0000000000000000000000000000000000000000") {
    await context.db
      .update(cohortState)
      .set({
        requireApprovalForWithdrawals: requiresApproval,
        lastUpdated: event.block.timestamp,
      })
      .where(eq(cohortState.id, cohortAddress));
  }
});

// Index AllowApplicationsChanged events
ponder.on("Cohort:AllowApplicationsChanged", async ({ event, context }) => {
  const allowApplications = event.args.allowApplications;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db
    .update(cohortState)
    .set({
      allowApplications,
      lastUpdated: event.block.timestamp,
    })
    .where(eq(cohortState.id, cohortAddress));
});
