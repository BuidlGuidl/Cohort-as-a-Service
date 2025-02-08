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

export type CreatorFlowInfo = {
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
  activeCreators: string[];
  creatorFlows: Map<
    string,
    {
      creatorAddress: string;
      cap: number;
      last: number;
      availableAmount: number;
    }
  >;
  isAdmin: boolean;
  isCreator: boolean;
  chainName?: string;
  chainId?: AllowedChainIds;
};

export const useCohortData = (cohortAddress: string) => {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CohortData | null>(null);
  const [creators, setCreators] = useState<string[]>([]);

  const { cohorts, isLoading: isLoadingCohorts } = useCohorts({});

  // Get the contract ABI
  const { data: deployedContract } = useLocalDeployedContractInfo({
    contractName: "Cohort",
  });

  // Read the creatorAdded events
  const {
    data: creatorAdded,
    isLoading: isLoadingCreators,
    refetch,
  } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "AddBuilder",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    blockData: true,
    watch: true,
    receiptData: true,
    contractAddress: cohortAddress,
  });

  useEffect(() => {
    if (creatorAdded && creatorAdded.length > 0) {
      if (!creatorAdded[0].args) {
        refetch()
          .then(() => {
            console.log("Refreshed creatorAdded events");
          })
          .catch(() => {
            console.error("Error refreshing creatorAdded events");
          });
      }
    }
  }, [creatorAdded, refetch]);

  useEffect(() => {
    if (creatorAdded && creatorAdded.length > 0) {
      if (!creatorAdded[0].args) {
        return;
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const addedCreators = creatorAdded?.map(creator => creator?.args[0]);

    const validateCreator = async (creator: string) => {
      if (!cohortAddress) return false;

      try {
        const creatorIndex = await readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract?.abi as Abi,
          functionName: "creatorIndex",
          args: [creator],
        });

        const fetchedCreator = await readContract(wagmiConfig, {
          address: cohortAddress,
          abi: deployedContract?.abi as Abi,
          functionName: "activeCreators",
          args: [creatorIndex],
        });

        return fetchedCreator === creator;
      } catch {
        return false;
      }
    };

    const validateCreators = async () => {
      const validCreators: string[] = [];
      if (addedCreators) {
        for (let i = addedCreators.length - 1; i >= 0; i--) {
          const isValid = await validateCreator(addedCreators[i]);
          if (isValid) {
            validCreators.push(addedCreators[i]);
          }
        }
      }
      setCreators(validCreators);
    };

    validateCreators();
  }, [isLoadingCreators, deployedContract, creatorAdded, cohortAddress]);

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

      // Get creator flow data
      const creatorFlows = new Map();

      // Fetch all creators data in bulk
      const creatorsData = await readContract(wagmiConfig, {
        address: cohortAddress,
        abi: deployedContract.abi,
        functionName: "allCreatorsData",
        args: [creators],
        chainId,
      });

      // Get available amounts for each creator
      for (let i = 0; i < creators.length; i++) {
        const creator = creators[i];
        const flowInfo = creatorsData[i];

        let availableAmount = 0;
        try {
          const available = await readContract(wagmiConfig, {
            address: cohortAddress,
            abi: deployedContract.abi,
            functionName: "availableCreatorAmount",
            args: [creator],
            chainId,
          });
          availableAmount = parseFloat(formatEther(available));
        } catch (e) {
          console.error(`Error fetching available amount for ${creator}:`, e);
        }

        creatorFlows.set(creator, {
          creatorAddress: creator,
          cap: parseFloat(formatEther(flowInfo.cap)),
          last: Number(flowInfo.last),
          availableAmount,
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

      setData({
        name,
        description,
        isERC20,
        tokenAddress,
        tokenSymbol,
        primaryAdmin,
        stopped,
        balance,
        activeCreators: creators,
        creatorFlows,
        isAdmin,
        isCreator: creators.includes(address),
        chainName,
        chainId,
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
  }, [cohortAddress, address, deployedContract, creators, isLoadingCohorts]);

  return {
    ...data,
    isLoading: isLoading || isLoadingCreators,
    error,
    // refetch: fetchCohortData,
  };
};
