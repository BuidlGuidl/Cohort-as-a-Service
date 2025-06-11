import { createConfig, factory } from "ponder";
import { parseAbiItem } from "abitype";
import { CohortFactoryAbi } from "./abis/CohortFactory";
import { CohortAbi } from "./abis/Cohort";
import { http } from "viem";

import { chainConfigs } from "./src/config/chains";

const CohortCreated = parseAbiItem(
  "event CohortCreated(address indexed cohortAddress, address indexed primaryAdmin, string name, string description)"
);

const providerKey =
  process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

const chainsWithApiKey = Object.fromEntries(
  Object.entries(chainConfigs.chains).map(([chainName, chainConfig]) => {
    const updatedRpc = chainConfig.transport.includes("g.alchemy.com")
      ? chainConfig.transport + providerKey
      : chainConfig.transport;

    return [
      chainName,
      {
        ...chainConfig,
        transport: http(updatedRpc),
      },
    ];
  })
);

export default createConfig({
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
  },
  networks: chainsWithApiKey,
  contracts: {
    CohortFactory: {
      abi: CohortFactoryAbi,
      network: chainConfigs.cohortFactoryContracts,
    },
    Cohort: {
      abi: CohortAbi,
      address: factory({
        address: Object.values(chainConfigs.cohortFactoryContracts).map(
          (config) => config.address
        ),
        event: CohortCreated,
        parameter: "cohortAddress",
      }),
      network: Object.keys(chainConfigs.cohortFactoryContracts).reduce(
        (acc, chainName) => {
          const { startBlock } =
            chainConfigs.cohortFactoryContracts[
              chainName as keyof typeof chainConfigs.cohortFactoryContracts
            ];
          acc[chainName] = { startBlock };
          return acc;
        },
        {} as Record<string, { startBlock: number }>
      ),
    },
  },
});
