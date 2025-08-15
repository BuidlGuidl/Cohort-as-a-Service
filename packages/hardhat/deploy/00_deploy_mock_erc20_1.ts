import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployerc20: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
      On localhost, the deployer account is the one that comes with Hardhat, which is already funded.
  
      When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
      should have sufficient balance to pay for the gas fees for contract creation.
  
      You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
      with a random private key in the .env file (then used on hardhat.config.ts)
      You can run the `yarn account` command to check your balance in every network.
    */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // await deploy("ERC20Mock1", {
  //   from: deployer,
  //   // Contract constructor arguments

  //   log: true,
  //   // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
  //   // automatically mining the contract deployment transaction. There is no effect on live networks.
  //   autoMine: true,
  // });

  // Get the deployed contract
  // const ERC20mock1 = await hre.ethers.getContract("ERC20Mock1");

  // Send 0.001 ETH to the specified address
  const recipientAddress = "0xddda28e47e2f4a3695997703378b91e5b8339aa6";
  const amountToSend = ethers.parseEther("0.0004"); // 0.001 ETH

  console.log(`Sending ${ethers.formatEther(amountToSend)} ETH to ${recipientAddress}...`);

  try {
    // Get the signer (deployer account)
    const signer = await ethers.getSigner(deployer);

    // Send the transaction
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: amountToSend,
    });

    // Wait for the transaction to be mined
    await tx.wait();

    console.log(`✅ Successfully sent ${ethers.formatEther(amountToSend)} ETH to ${recipientAddress}`);
    console.log(`Transaction hash: ${tx.hash}`);
  } catch (error) {
    console.error("❌ Error sending ETH:", error);
    throw error;
  }
};

export default deployerc20;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags erc20mock
deployerc20.tags = ["ERC20Mock1"];
