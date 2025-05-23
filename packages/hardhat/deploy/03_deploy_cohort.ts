import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "Cohort" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployCohort: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();

  const { deploy, get } = hre.deployments;

  // const ERC20Mock1 = await get("ERC20Mock1");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  const name = "Cohort";
  const description = "Cohort contract";
  const cycle = 30 * 24 * 60 * 60; // 30 days
  const requiresApproval = false;
  const allowApplications = false;

  await deploy("Cohort", {
    from: deployer,
    // Contract constructor arguments

    // First Argument: Address of primary admin
    // Second Argument: Enter zero address for eth mode or enter address of ERC20 token contract for token mode
    // args: ["0x11E91FB4793047a68dFff29158387229eA313ffE", ZERO_ADDRESS],

    args: [
      "0xa8DF02c5607100Eb108B5C39dCdD8c2aE44185Df",
      ZERO_ADDRESS,
      name,
      description,
      cycle,
      [],
      [],
      requiresApproval,
      allowApplications,
    ],

    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  // const cohort = await hre.ethers.getContract("Cohort", deployer);
};

export default deployCohort;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Cohort
deployCohort.tags = ["Cohort"];
