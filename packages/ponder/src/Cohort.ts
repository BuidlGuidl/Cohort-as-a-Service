import { ponder } from "ponder:registry";
import {
  builder,
  admin,
  withdrawEvent,
  withdrawRequest,
  cohortState,
} from "ponder:schema";

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
      cap,
      isActive: true,
      blockNumber: event.block.number,
    });
});

ponder.on("Cohort:UpdateBuilder", async ({ event, context }) => {
  const builderAddress = event.args.to;
  const newCap = event.args.amount;
  const cohortAddress = event.log.address.toLowerCase();
  const builderId = `${cohortAddress}-${builderAddress.toLowerCase()}`;

  if (newCap === 0n) {
    await context.db.update(builder, { id: builderId }).set({
      cap: newCap,
      isActive: false,
      blockNumber: event.block.number,
    });
  } else {
    await context.db.update(builder, { id: builderId }).set({
      cap: newCap,
      blockNumber: event.block.number,
    });
  }
});

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
      isActive: true,
      blockNumber: event.block.number,
    });
});

ponder.on("Cohort:AdminRemoved", async ({ event, context }) => {
  const adminAddress = event.args.to;
  const cohortAddress = event.log.address.toLowerCase();
  const adminId = `${cohortAddress}-${adminAddress.toLowerCase()}`;

  await context.db.update(admin, { id: adminId }).set({
    isActive: false,
    blockNumber: event.block.number,
  });
});

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

ponder.on("Cohort:WithdrawApproved", async ({ event, context }) => {
  const { builder: builderAddress, requestId } = event.args;
  const cohortAddress = event.log.address.toLowerCase();
  const requestIdStr = `${cohortAddress}-${builderAddress.toLowerCase()}-${requestId}`;

  await context.db.update(withdrawRequest, { id: requestIdStr }).set({
    status: "approved",
    lastUpdated: event.block.timestamp,
  });
});

ponder.on("Cohort:WithdrawRejected", async ({ event, context }) => {
  const { builder: builderAddress, requestId } = event.args;
  const cohortAddress = event.log.address.toLowerCase();
  const requestIdStr = `${cohortAddress}-${builderAddress.toLowerCase()}-${requestId}`;

  await context.db.update(withdrawRequest, { id: requestIdStr }).set({
    status: "rejected",
    lastUpdated: event.block.timestamp,
  });
});

ponder.on("Cohort:WithdrawCompleted", async ({ event, context }) => {
  const { builder: builderAddress, requestId } = event.args;
  const cohortAddress = event.log.address.toLowerCase();
  const requestIdStr = `${cohortAddress}-${builderAddress.toLowerCase()}-${requestId}`;

  await context.db.update(withdrawRequest, { id: requestIdStr }).set({
    status: "completed",
    lastUpdated: event.block.timestamp,
  });
});

ponder.on("Cohort:ContractLocked", async ({ event, context }) => {
  const locked = event.args.locked;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db.update(cohortState, { id: cohortAddress }).set({
    locked,
    lastUpdated: event.block.timestamp,
  });
});

ponder.on("Cohort:ApprovalRequirementChanged", async ({ event, context }) => {
  const cohortAddress = event.log.address.toLowerCase();
  const builderAddress = event.args.builder;
  const requiresApproval = event.args.requiresApproval;
  const builderId = `${cohortAddress}-${builderAddress.toLowerCase()}`;

  if (builderAddress !== "0x0000000000000000000000000000000000000000") {
    const dbBuilder = await context.db.find(builder, {
      id: builderId,
    });

    if (dbBuilder) {
      await context.db
        .update(builder, {
          id: builderId,
        })
        .set({
          requiresApproval,
        });
    }
  }

  if (builderAddress.toLowerCase() === cohortAddress) {
    await context.db.update(cohortState, { id: cohortAddress }).set({
      requireApprovalForWithdrawals: requiresApproval,
      lastUpdated: event.block.timestamp,
    });
  }
});

ponder.on("Cohort:AllowApplicationsChanged", async ({ event, context }) => {
  const allowApplications = event.args.allowApplications;
  const cohortAddress = event.log.address.toLowerCase();

  await context.db.update(cohortState, { id: cohortAddress }).set({
    allowApplications,
    lastUpdated: event.block.timestamp,
  });
});
