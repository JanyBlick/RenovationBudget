const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PrivateRenovationBudget contract...");

  // Get the ContractFactory
  const PrivateRenovationBudget = await ethers.getContractFactory("PrivateRenovationBudget");

  // Deploy the contract
  const contract = await PrivateRenovationBudget.deploy();

  // Wait for deployment to finish
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("PrivateRenovationBudget deployed to:", contractAddress);
  console.log("Transaction hash:", contract.deploymentTransaction().hash);

  // Verify deployment
  console.log("Verifying deployment...");
  const owner = await contract.owner();
  console.log("Contract owner:", owner);

  console.log("\nDeployment completed successfully!");
  console.log("Save this contract address to your .env file:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });