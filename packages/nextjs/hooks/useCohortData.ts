import { useEffect, useState } from "react";
import { useCohortEventHistory } from "./useCohortEventHistory";
import { useCohorts } from "./useCohorts";
import { useLocalDeployedContractInfo } from "./useLocalDeployedContractInfo";
import { readContract } from "@wagmi/core";
import { Abi, formatEther } from "viem";
import { erc20Abi } from "viem";
import { useAccount } from "wagmi";
import { usePublicClient } from "wagmi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { notification } from "~~/utils/scaffold-eth";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

export type BuilderFlowInfo = {
  cap: bigint;
  last: bigint;
};

export type CohortData = {
  name: string;
  description: string;
  isERC20: boolean;
  tokenAddress: string | null;
  tokenSymbol: string | null;
  primaryAdmin: string;
  stopped: boolean;
  balance: number;
  activeBuilders: string[];
  builderFlows: Map<
    string,
    {
      builderAddress: string;
      cap: number;
      last: number;
      availableAmount: number;
      requiresApproval: boolean;
    }
  >;
  isAdmin: boolean;
  isBuilder: boolean;
  chainName?: string;
  chainId?: AllowedChainIds;
  admins: string[];
  connectedAddressRequiresApproval: boolean;
};

export const useCohortData = (cohortAddress: string) => {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CohortData | null>(null);
  const [builders, setBuilders] = useState<string[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);

  const { cohorts, isLoading: isLoadingCohorts } = useCohorts({});

  const { data: deployedContract } = useLocalDeployedContractInfo({
    contractName: "Cohort",
  });

  const { data: ApprovalRequirementChanged } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "ApprovalRequirementChanged",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    watch: true,
    contractAddress: cohortAddress,
  });

  const { data: UpdatedBuilderEvents } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "UpdateBuilder",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    watch: true,
    contractAddress: cohortAddress,
  });

  const { data: withdrawn } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "Withdraw",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    watch: true,
    contractAddress: cohortAddress,
  });

  const { data: adminRemoved } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "AdminRemoved",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    watch: true,
    contractAddress: cohortAddress,
  });

  const {
    data: builderAdded,
    isLoading: isLoadingBuilders,
    refetch: buildersRefetch,
  } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "AddBuilder",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    blockData: true,
    watch: true,
    receiptData: true,
    contractAddress: cohortAddress,
  });

  const {
    data: adminAdded,
    isLoading: isLoadingAdmins,
    refetch: adminsRefetch,
  } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "AdminAdded",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    blockData: true,
    watch: true,
    receiptData: true,
    contractAddress: cohortAddress,
  });

  useEffect(() => {
    if (builderAdded && builderAdded.length > 0) {
      for (let i = 0; i < builderAdded.length; i++) {
        if (!builderAdded[i].args) {
          buildersRefetch()
            .then(() => {})
            .catch(() => {
              console.error("Error refreshing builderAdded events");
            });
        }
      }
    }
  }, [builderAdded, buildersRefetch]);

  useEffect(() => {
    if (adminAdded && adminAdded.length > 0) {
      for (let i = 0; i < adminAdded.length; i++) {
        if (!adminAdded[i].args) {
          adminsRefetch()
            .then(() => {})
            .catch(() => {
              console.error("Error refreshing adminAdded events");
            });
        }
      }
    }
  }, [adminAdded, adminsRefetch]);

  useEffect(() => {
    if (builderAdded && builderAdded.length > 0) {
      for (let i = 0; i < builderAdded.length; i++) {
        if (!builderAdded[i].args) {
          return;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const addedBuilders = builderAdded?.map(builder => builder?.args[0]);

    const validateBuilder = async (builder: string) => {
      if (!cohortAddress) return false;

      try {
        const builderIndex = await readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract?.abi as Abi,
          functionName: "builderIndex",
          args: [builder],
        });

        const fetchedBuilder = await readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract?.abi as Abi,
          functionName: "activeBuilders",
          args: [builderIndex],
        });

        return fetchedBuilder === builder;
      } catch {
        return false;
      }
    };

    const validateBuilders = async () => {
      const validBuilders: string[] = [];
      if (addedBuilders) {
        for (let i = addedBuilders.length - 1; i >= 0; i--) {
          const isValid = await validateBuilder(addedBuilders[i]);
          if (isValid) {
            validBuilders.push(addedBuilders[i]);
          }
        }
      }
      setBuilders(validBuilders);
    };

    validateBuilders();
  }, [isLoadingBuilders, deployedContract, builderAdded, buildersRefetch, cohortAddress]);

  useEffect(() => {
    if (adminAdded && adminAdded.length > 0) {
      for (let i = 0; i < adminAdded.length; i++) {
        if (!adminAdded[i].args) {
          return;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const addedAdmins = Array.from(new Set(adminAdded?.map(admin => admin?.args[0])));
    const validateAdmin = async (admin: string) => {
      if (!cohortAddress) return false;

      try {
        const isAdmin = await readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract?.abi as Abi,
          functionName: "isAdmin",
          args: [admin],
        });
        return isAdmin;
      } catch {
        return false;
      }
    };

    const validateAdmins = async () => {
      const validAdmins: string[] = [];
      if (addedAdmins) {
        for (let i = addedAdmins.length - 1; i >= 0; i--) {
          const isValid = await validateAdmin(addedAdmins[i]);
          if (isValid) {
            validAdmins.push(addedAdmins[i]);
          }
        }
      }
      setAdmins(validAdmins);
    };

    validateAdmins();
  }, [isLoadingAdmins, deployedContract, adminAdded, cohortAddress, adminRemoved]);

  const fetchCohortData = async () => {
    if (!cohortAddress || !deployedContract?.abi || !address) return;

    const chainName = cohorts.find(
      cohort => cohort.cohortAddress?.toLowerCase() === cohortAddress.toLowerCase(),
    )?.chainName;
    const chainId = cohorts.find(
      cohort => cohort.cohortAddress?.toLowerCase() === cohortAddress.toLowerCase(),
    )?.chainId;

    if (!chainId || !chainName) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [name, description, isERC20, tokenAddress, primaryAdmin, stopped] = await Promise.all([
        readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "name",
          chainId,
        }),
        readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "description",
          chainId,
        }),
        readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "isERC20",
          chainId,
        }),
        readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "tokenAddress",
          chainId,
        }),
        readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "primaryAdmin",
          chainId,
        }),
        readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "stopped",
          chainId,
        }),
      ]);

      let tokenSymbol = null;
      if (isERC20 && tokenAddress) {
        tokenSymbol = await readContract(wagmiConfig, {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "symbol",
          chainId,
        });
      }

      // Get balance (ETH or ERC20)
      let balance = 0;
      if (isERC20 && tokenAddress) {
        const tokenBalance = await readContract(wagmiConfig, {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [cohortAddress],
          chainId,
        });
        balance = parseFloat(formatEther(tokenBalance));
      } else {
        const ethBalance = await publicClient?.getBalance({
          address: cohortAddress,
        });
        balance = parseFloat(formatEther(ethBalance || BigInt(0)));
      }

      // Get builder flow data
      const builderFlows = new Map();

      // Fetch all builders data in bulk
      const buildersData = await readContract(wagmiConfig, {
        address: cohortAddress,
        abi: deployedContract.abi,
        functionName: "allBuildersData",
        args: [builders],
        chainId,
      });

      // Get available amounts for each builder
      for (let i = 0; i < builders.length; i++) {
        const builder = builders[i];
        const flowInfo = buildersData[i];

        let availableAmount = 0;
        let requiresApproval = false;
        try {
          const available = await readContract(wagmiConfig, {
            address: cohortAddress,
            abi: deployedContract.abi,
            functionName: "availableBuilderAmount",
            args: [builder],
            chainId,
          });
          availableAmount = parseFloat(formatEther(available));

          requiresApproval = await readContract(wagmiConfig, {
            address: cohortAddress,
            abi: deployedContract.abi,
            functionName: "requiresApproval",
            args: [builder],
            chainId,
          });
        } catch (e) {
          console.error(`Error fetching available amount for ${builder}:`, e);
        }

        builderFlows.set(builder, {
          builderAddress: builder,
          cap: parseFloat(formatEther(flowInfo.cap)),
          last: Number(flowInfo.last),
          availableAmount,
          requiresApproval,
        });
      }

      // Check if current user is admin
      const isAdmin = await readContract(wagmiConfig, {
        address: cohortAddress,
        abi: deployedContract.abi,
        functionName: "isAdmin",
        args: [address],
        chainId,
      });

      const connectedAddressRequiresApproval = await readContract(wagmiConfig, {
        address: cohortAddress,
        abi: deployedContract.abi,
        functionName: "requiresApproval",
        args: [address],
        chainId,
      });

      setData({
        name,
        description,
        isERC20,
        tokenAddress,
        tokenSymbol,
        primaryAdmin,
        stopped,
        balance,
        activeBuilders: builders,
        builderFlows,
        isAdmin,
        isBuilder: builders.includes(address),
        chainName,
        chainId,
        admins,
        connectedAddressRequiresApproval,
      });
    } catch (e) {
      console.error("Error fetching cohort data:", e);

      setError("Failed to fetch cohort data");
      notification.error("Failed to fetch cohort data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCohortData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cohortAddress,
    address,
    deployedContract,
    builders,
    isLoadingCohorts,
    admins,
    isLoadingAdmins,
    isLoadingBuilders,
    UpdatedBuilderEvents,
    ApprovalRequirementChanged,
    withdrawn,
  ]);

  return {
    ...data,
    isLoading: isLoading || isLoadingBuilders || isLoadingAdmins || isLoadingCohorts,
    isLoadingAdmins: isLoadingAdmins || isLoadingCohorts,
    isLoadingBuilders: isLoadingBuilders || isLoadingCohorts,
    error,
    // refetch: fetchCohortData,
  };
};
