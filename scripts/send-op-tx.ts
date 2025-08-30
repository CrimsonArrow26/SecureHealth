import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

async function main() {
  // Use the first account from Hardhat (for local testing)
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  // Create account from private key
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  // Create wallet client for localhost
  const senderClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http("http://127.0.0.1:8545"),
  });

  // Create public client for reading blockchain data
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http("http://127.0.0.1:8545"),
  });

  console.log("Sending transaction using Hardhat local network");

  console.log("Sending 1 wei from", senderClient.account.address, "to itself");

  // Note: L1 gas estimation is not available on Hardhat local network
  console.log("Sending transaction on local Hardhat network");

  console.log("Sending L2 transaction");
  const tx = await senderClient.sendTransaction({
    to: senderClient.account.address,
    value: 1n,
  });

  await publicClient.waitForTransactionReceipt({ hash: tx });

  console.log("Transaction sent successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
