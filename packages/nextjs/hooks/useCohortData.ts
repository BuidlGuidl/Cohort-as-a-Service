// packages/nextjs/hooks/useCohortData.ts
import { useEffect, useState } from "react";
import { useLocalDeployedContractInfo } from "./useLocalDeployedContractInfo";
import { erc20Abi, formatEther, formatUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { PonderAdmin, PonderBuilder, PonderCohort, PonderCohortState, ponderClient } from "~~/services/ponder/client";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

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

export const useCohortData = (cohortAddress: string) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CohortData | null>(null);

  const { data: deployedContract } = useLocalDeployedContractInfo({
    contractName: "Cohort",
  });

  useEffect(() => {
    const fetchCohortData = async () => {
      if (!cohortAddress || !deployedContract?.abi || !publicClient) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const response = await ponderClient.get<{
          cohort: PonderCohort;
          builders: PonderBuilder[];
          admins: PonderAdmin[];
          state: PonderCohortState | null;
        }>(`/cohort/${cohortAddress.toLowerCase()}`);

        const { cohort, builders, admins, state } = response.data;

        let balance = 0;
        if (
          state?.isERC20 &&
          state?.tokenAddress &&
          state?.tokenAddress != "0x0000000000000000000000000000000000000000"
        ) {
          const tokenBalance = await publicClient.readContract({
            address: state?.tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [cohortAddress as `0x${string}`],
          });
          balance = parseFloat(formatUnits(tokenBalance as bigint, state?.tokenDecimals ?? 18));
        } else {
          const ethBalance = await publicClient.getBalance({
            address: cohortAddress as `0x${string}`,
          });
          balance = parseFloat(formatEther(ethBalance || BigInt(0)));
        }

        const activeBuilders = builders
          .filter(b => b.isActive && b.cohortAddress == cohortAddress)
          .map(b => b.builderAddress);

        const builderStreams = new Map();

        for (const builder of builders.filter(b => b.isActive && b.cohortAddress == cohort.address)) {
          try {
            const unlockedAmount = await publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "unlockedBuilderAmount",
              args: [builder.builderAddress],
            });

            const requiresApproval = builder.requiresApproval;

            builderStreams.set(builder.builderAddress, {
              builderAddress: builder.builderAddress,
              cap: parseFloat(
                state?.isERC20
                  ? formatUnits(BigInt(builder.cap), state?.tokenDecimals ?? 18)
                  : formatEther(BigInt(builder.cap)),
              ),
              last: Number(builder.last),
              unlockedAmount: parseFloat(
                state?.isERC20
                  ? formatUnits(unlockedAmount as bigint, state?.tokenDecimals ?? 18)
                  : formatEther(unlockedAmount as bigint),
              ),
              requiresApproval: requiresApproval as boolean,
            });
          } catch (e) {
            console.error(`Error fetching data for builder ${builder.builderAddress}:`, e);
          }
        }

        const isAdmin = address
          ? admins.some(a => a.adminAddress.toLowerCase() === address.toLowerCase()) ||
            cohort.primaryAdmin.toLowerCase() == address.toLowerCase()
          : false;

        const isBuilder = address ? activeBuilders.includes(address.toLowerCase() as `0x${string}`) : false;

        let connectedAddressRequiresApproval = false;
        let oneTimeAlreadyWithdrawn = false;

        if (address) {
          const builder = builders.find(
            b =>
              b.isActive &&
              b.cohortAddress.toLowerCase() == cohortAddress.toLowerCase() &&
              b.builderAddress.toLowerCase() == address.toLowerCase(),
          );

          connectedAddressRequiresApproval = builder?.requiresApproval ?? false;

          if (isBuilder && state?.isONETIME) {
            oneTimeAlreadyWithdrawn = Number(builder?.last) !== 2 ** 256 - 1;
          }
        }

        setData({
          name: cohort.name,
          description: cohort.description,
          isERC20: state?.isERC20 as boolean,
          isONETIME: state?.isONETIME as boolean,
          cycle: Number(state?.cycle ?? 0n) / (60 * 60 * 24),
          tokenAddress: state?.tokenAddress as string | null,
          tokenSymbol: state?.tokenSymbol ?? null,
          tokenDecimals: state?.tokenDecimals ?? 18,
          primaryAdmin: cohort.primaryAdmin,
          locked: !!state?.locked,
          requiresApproval: !!state?.requireApprovalForWithdrawals,
          allowApplications: !!state?.allowApplications,
          balance,
          activeBuilders,
          builderStreams,
          isAdmin,
          isBuilder,
          oneTimeAlreadyWithdrawn,
          chainName: cohort.chainName,
          chainId: cohort.chainId as AllowedChainIds,
          admins: admins.filter(a => a.cohortAddress == cohortAddress).map(a => a.adminAddress),
          connectedAddressRequiresApproval,
        });
      } catch (e) {
        console.error("Error fetching cohort data:", e);
        setError("Failed to fetch cohort data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCohortData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortAddress, deployedContract, address, publicClient]);

  return {
    ...data,
    isLoading,
    error,
  };
};
