import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChain } from "../helper-hardhat-config";
import { getPriceFeedInfo } from "../data/price-feed";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();

  const { deploy } = hre.deployments;

  const network = hre.network;
  const chainId = await hre.getChainId();

  let ethUsdPriceFeedAddress;
  if (developmentChain.includes(network.name)) {
    const ethUsdAggregator = await hre.ethers.getContract("MockV3Aggregator", deployer);
    ethUsdPriceFeedAddress = await ethUsdAggregator.getAddress();
  } else {
    ethUsdPriceFeedAddress = getPriceFeedInfo(parseInt(chainId) || 1)?.priceFeedAddress;
  }

  await deploy("CohortFactory", {
    from: deployer,
    // Contract constructor arguments

    // First Argument: Address of primary admin
    // Second Argument: Enter zero address for eth mode or enter address of ERC20 token contract for token mode
    args: [ethUsdPriceFeedAddress],

    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  // const yourContract = await hre.ethers.getContract("YourContract", deployer);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["CohortFactory"];
