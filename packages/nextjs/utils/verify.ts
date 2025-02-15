"use server";

import { getExplorerApiKey, getExplorerApiUrl } from "./explorerConfig";
import { AbiParameter, encodeAbiParameters } from "viem";

export async function verifyContract({
  address,
  constructorArguments,
  contract,
  chainId,
}: {
  address: `0x${string}`;
  constructorArguments: any[];
  contract: any;
  chainId: number;
}) {
  try {
    console.log(`🔍 Starting contract verification for: ${address} on chain ${chainId}...`);

    const contractBytecode = contract.bytecode;
    const apiUrl = getExplorerApiUrl(chainId);
    const apiKey = getExplorerApiKey(chainId);

    console.log(`✅ API URL: ${apiUrl}`);
    console.log(`✅ API Key: ${apiKey ? "Loaded" : "Missing"}`);

    // Extract constructor parameters from ABI
    const constructorAbi = contract.abi.find((item: any) => item.type === "constructor");
    const constructorInputs = constructorAbi ? constructorAbi.inputs : [];

    console.log(`🔧 Constructor inputs:`, constructorInputs);

    const encodedArgs =
      constructorInputs.length > 0
        ? encodeAbiParameters(constructorInputs as readonly AbiParameter[], constructorArguments).slice(2)
        : "";

    console.log(`🔑 Encoded constructor arguments: ${encodedArgs || "None"}`);

    const verificationRequest = {
      apikey: apiKey,
      module: "contract",
      action: "verifysourcecode",
      contractaddress: address,
      sourceCode: contract.source,
      codeformat: "solidity-single-file",
      contractname: "Cohort",
      compilerversion: "v0.8.20+commit.a1b79de6",
      optimizationUsed: "1",
      runs: "200",
      constructorArguements: encodedArgs,
      evmversion: "london",
    };

    console.log("📡 Sending verification request...");
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(verificationRequest),
    });

    const data = await response.json();
    console.log(`📩 Verification response:`, data);

    if (data.status === "1") {
      const guid = data.result;
      console.log(`✅ Verification request accepted. GUID: ${guid}`);

      const verificationStatus = await checkVerificationStatus(guid, chainId);

      if (verificationStatus.status === "1" && verificationStatus.result === "Pass - Verified") {
        console.log(`🎉 Contract successfully verified on ${apiUrl}`);
      } else {
        console.log(`⚠️ Contract verification pending or failed:`, verificationStatus.result);
      }

      return verificationStatus;
    } else {
      console.error(`❌ Verification failed: ${data.result}`);
      throw new Error(`Verification failed: ${data.result}`);
    }
  } catch (error) {
    console.error("🚨 Error verifying contract:", error);
    throw error;
  }
}

async function checkVerificationStatus(guid: string, chainId: number, retries = 5, delay = 5000) {
  const apiUrl = getExplorerApiUrl(chainId);
  const apiKey = getExplorerApiKey(chainId);

  console.log(`🔄 Checking verification status for GUID: ${guid}...`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`⏳ Attempt ${attempt}...`);

    const checkStatusRequest = {
      apikey: apiKey,
      module: "contract",
      action: "checkverifystatus",
      guid: guid,
    };

    const response = await fetch(`${apiUrl}?${new URLSearchParams(checkStatusRequest)}`);
    const data = await response.json();

    console.log(`📊 Status response:`, data);

    if (data.status === "1" && data.result === "Pass - Verified") {
      console.log(`✅ Contract successfully verified!`);
      return data;
    }

    if (attempt < retries) {
      console.log(`🔁 Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } else {
      console.log(`🚫 Verification check retries exceeded. Final result: ${data.result}`);
    }
  }

  return { status: "0", result: "Verification process did not complete in time." };
}
