import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

async function main() {
  console.log("Deploying HealthRecordRegistry...");

  // Use the first account from Hardhat (for local testing)
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Hardhat default account
  
  // Create account from private key
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  // Create wallet client for localhost
  const client = createWalletClient({
    account,
    chain: hardhat,
    transport: http("http://127.0.0.1:8545"),
  });

  console.log("Account:", account.address);

  // Get current directory for ESM compatibility
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Read the compiled contract artifact
  const artifactPath = join(__dirname, "../artifacts/contracts/health/HealthRecordRegistry.sol/HealthRecordRegistry.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  // Deploy contract using viem v2 syntax
  const hash = await client.sendTransaction({
    to: undefined, // undefined means contract creation
    data: artifact.bytecode,
    value: 0n,
  });

  console.log("Deployment transaction hash:", hash);

  // Wait for deployment
  const receipt = await client.waitForTransactionReceipt({ hash });
  console.log("Contract deployed at:", receipt.contractAddress);
  console.log("Block number:", receipt.blockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
