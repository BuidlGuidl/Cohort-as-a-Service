import { createConfig, factory } from "ponder";
import { parseAbiItem } from "abitype";
import { CohortFactoryAbi } from "./abis/CohortFactory";
import { CohortAbi } from "./abis/Cohort";

// Import generated chain configs
import { chainConfigs } from "./src/config/chains";

const CohortCreated = parseAbiItem(
  "event CohortCreated(address indexed cohortAddress, address indexed primaryAdmin, string name, string description)"
);

export default createConfig({
  ordering: "multichain",
  chains: chainConfigs.chains,
  contracts: {
    CohortFactory: {
      abi: CohortFactoryAbi,
      startBlock: "latest",
      chain: chainConfigs.cohortFactoryContracts,
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
      chain: Object.keys(chainConfigs.cohortFactoryContracts).reduce(
        (acc, chainName) => {
          acc[chainName] = {};
          return acc;
        },
        {} as any
      ),
    },
  },
});
