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
      if (!cohortAddress || !deployedContract?.abi || !publicClient) return;

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

        const [isERC20, isONETIME, cycle, tokenAddress, locked, requiresApproval, allowApplications] =
          await Promise.all([
            publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "isERC20",
            }),
            publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "isONETIME",
            }),
            publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "cycle",
            }),
            publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "tokenAddress",
            }),
            publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "locked",
            }),
            publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "requireApprovalForWithdrawals",
            }),
            publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "allowApplications",
            }),
          ]);

        // Get token info if ERC20
        let tokenSymbol = null;
        let tokenDecimals = 18;
        if (isERC20 && tokenAddress) {
          tokenSymbol = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "symbol",
          });
          tokenDecimals = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "decimals",
          });
        }

        // Get balance
        let balance = 0;
        if (isERC20 && tokenAddress) {
          const tokenBalance = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [cohortAddress as `0x${string}`],
          });
          balance = parseFloat(formatUnits(tokenBalance as bigint, tokenDecimals));
        } else {
          const ethBalance = await publicClient.getBalance({
            address: cohortAddress as `0x${string}`,
          });
          balance = parseFloat(formatEther(ethBalance || BigInt(0)));
        }

        const activeBuilders = builders.filter(b => b.isActive).map(b => b.builderAddress);

        const builderStreams = new Map();

        for (const builder of builders.filter(b => b.isActive && b.cohortAddress == cohort.address)) {
          try {
            const unlockedAmount = await publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "unlockedBuilderAmount",
              args: [builder.builderAddress],
            });

            const requiresApproval = await publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "requiresApproval",
              args: [builder.builderAddress],
            });

            builderStreams.set(builder.builderAddress, {
              builderAddress: builder.builderAddress,
              cap: parseFloat(
                isERC20 ? formatUnits(BigInt(builder.cap), tokenDecimals) : formatEther(BigInt(builder.cap)),
              ),
              last: Number(builder.last),
              unlockedAmount: parseFloat(
                isERC20 ? formatUnits(unlockedAmount as bigint, tokenDecimals) : formatEther(unlockedAmount as bigint),
              ),
              requiresApproval: requiresApproval as boolean,
            });
          } catch (e) {
            console.error(`Error fetching data for builder ${builder.builderAddress}:`, e);
          }
        }

        // Check user status
        const isAdmin = address ? admins.some(a => a.adminAddress.toLowerCase() === address.toLowerCase()) : false;
        const isBuilder = address ? activeBuilders.includes(address.toLowerCase()) : false;

        let connectedAddressRequiresApproval = false;
        let oneTimeAlreadyWithdrawn = false;

        if (address) {
          connectedAddressRequiresApproval = (await publicClient.readContract({
            address: cohortAddress as `0x${string}`,
            abi: deployedContract.abi,
            functionName: "requiresApproval",
            args: [address],
          })) as boolean;

          if (isBuilder && isONETIME) {
            const builderStreamInfo = (await publicClient.readContract({
              address: cohortAddress as `0x${string}`,
              abi: deployedContract.abi,
              functionName: "streamingBuilders",
              args: [address],
            })) as [bigint, bigint];
            oneTimeAlreadyWithdrawn = Number(builderStreamInfo[1]) !== 2 ** 256 - 1;
          }
        }

        setData({
          name: cohort.name,
          description: cohort.description,
          isERC20: isERC20 as boolean,
          isONETIME: isONETIME as boolean,
          cycle: Number(cycle as bigint) / (60 * 60 * 24),
          tokenAddress: tokenAddress as string | null,
          tokenSymbol,
          tokenDecimals,
          primaryAdmin: cohort.primaryAdmin,
          locked: state?.locked || (locked as boolean),
          requiresApproval: state?.requireApprovalForWithdrawals || (requiresApproval as boolean),
          allowApplications: state?.allowApplications || (allowApplications as boolean),
          balance,
          activeBuilders,
          builderStreams,
          isAdmin,
          isBuilder,
          oneTimeAlreadyWithdrawn,
          chainName: cohort.chainName,
          chainId: cohort.chainId as AllowedChainIds,
          admins: admins.map(a => a.adminAddress),
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
  }, [cohortAddress, address, deployedContract, publicClient]);

  return {
    ...data,
    isLoading,
    error,
  };
};
