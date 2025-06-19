import { ponder } from "ponder:registry";
import { CohortAbi } from "../abis/Cohort";
import { erc20Abi } from "viem";
import { cohortState, cohort } from "../ponder.schema";

ponder.on("CohortFactory:CohortCreated", async ({ event, context }) => {
  const { cohortAddress, primaryAdmin, name, description } = event.args;
  const chainId = context.network.chainId as number;

  await context.db.insert(cohort).values({
    id: `${chainId}-${cohortAddress.toLowerCase()}`,
    address: cohortAddress.toLowerCase() as `0x${string}`,
    chainId,
    chainName: context.network.name,
    primaryAdmin: primaryAdmin.toLowerCase() as `0x${string}`,
    name,
    description,
    createdAt: event.block.timestamp,
    transactionHash: event.transaction.hash,
    blockNumber: event.block.number,
  });

  const [
    isERC20,
    isONETIME,
    cycle,
    tokenAddress,
    locked,
    requireApprovalForWithdrawals,
    allowApplications,
  ] = await Promise.all([
    context.client.readContract({
      abi: CohortAbi,
      address: cohortAddress,
      functionName: "isERC20",
    }),
    context.client.readContract({
      abi: CohortAbi,
      address: cohortAddress,
      functionName: "isONETIME",
    }),
    context.client.readContract({
      abi: CohortAbi,
      address: cohortAddress,
      functionName: "cycle",
    }),
    context.client.readContract({
      abi: CohortAbi,
      address: cohortAddress,
      functionName: "tokenAddress",
    }),
    context.client.readContract({
      abi: CohortAbi,
      address: cohortAddress,
      functionName: "locked",
    }),
    context.client.readContract({
      abi: CohortAbi,
      address: cohortAddress,
      functionName: "requireApprovalForWithdrawals",
    }),
    context.client.readContract({
      abi: CohortAbi,
      address: cohortAddress,
      functionName: "allowApplications",
    }),
  ]);

  let tokenSymbol = null;
  let tokenDecimals = 18;

  if (
    isERC20 &&
    tokenAddress !== "0x0000000000000000000000000000000000000000"
  ) {
    [tokenSymbol, tokenDecimals] = await Promise.all([
      context.client.readContract({
        abi: erc20Abi,
        address: tokenAddress,
        functionName: "symbol",
      }),
      context.client.readContract({
        abi: erc20Abi,
        address: tokenAddress,
        functionName: "decimals",
      }),
    ]);
  }
  await context.db.insert(cohortState).values({
    id: cohortAddress.toLowerCase(),
    cohortAddress: cohortAddress.toLowerCase() as `0x${string}`,
    chainId: context.network.chainId as number,
    isERC20,
    isONETIME,
    tokenAddress,
    cycle,
    locked,
    requireApprovalForWithdrawals,
    allowApplications,
    tokenSymbol,
    tokenDecimals,
    lastUpdated: event.block.timestamp,
  });
});
