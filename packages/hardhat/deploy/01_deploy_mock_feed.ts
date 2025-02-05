import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { developmentChain, DECIMALS, INITIAL_ANSWER } from "../helper-hardhat-config";

const deployerPriceFeed: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const network = hre.network;

  if (developmentChain.includes(network.name)) {
    console.log("Local network detetcted: Deploying mocks");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    console.log("Mock Price feed Deployed");
    console.log("=================================================");
  }
};

export default deployerPriceFeed;

module.exports.tags = ["mockPriceFeed"];
