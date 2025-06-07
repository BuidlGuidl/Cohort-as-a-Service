// packages/ponder/src/CohortFactory.ts
import { ponder } from "ponder:registry";
import { cohort } from "ponder:schema";

// Index CohortCreated events
ponder.on("CohortFactory:CohortCreated", async ({ event, context }) => {
  const { cohortAddress, primaryAdmin, name, description } = event.args;
  const chainId = context.chain.id;

  await context.db.insert(cohort).values({
    id: `${chainId}-${cohortAddress.toLowerCase()}`,
    address: cohortAddress.toLowerCase() as `0x${string}`,
    chainId,
    chainName: context.chain.name,
    primaryAdmin: primaryAdmin.toLowerCase() as `0x${string}`,
    name,
    description,
    createdAt: event.block.timestamp,
    transactionHash: event.transaction.hash,
    blockNumber: event.block.number,
  });
});
