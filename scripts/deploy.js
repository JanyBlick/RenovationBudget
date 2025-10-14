const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("=".repeat(60));
  console.log("Deploying Private Renovation Budget v2.0 (Gateway Migrated)");
  console.log("=".repeat(60));

  // ==================== STEP 1: Prepare Pauser Addresses ====================
  console.log("\n[1/5] Preparing pauser addresses...");

  const numPausers = parseInt(process.env.NUM_PAUSERS || "0");

  if (numPausers === 0) {
    throw new Error(
      "NUM_PAUSERS not set. Please set NUM_PAUSERS and PAUSER_ADDRESS_[0-N] in .env file"
    );
  }

  const pauserAddresses = [];
  for (let i = 0; i < numPausers; i++) {
    const pauserKey = `PAUSER_ADDRESS_${i}`;
    const pauserAddress = process.env[pauserKey];

    if (!pauserAddress) {
      throw new Error(`${pauserKey} not found in .env file`);
    }

    if (!ethers.isAddress(pauserAddress)) {
      throw new Error(`Invalid address for ${pauserKey}: ${pauserAddress}`);
    }

    pauserAddresses.push(pauserAddress);
    console.log(`   Pauser ${i}: ${pauserAddress}`);
  }

  console.log(`✅ Configured ${pauserAddresses.length} pauser addresses`);

  // ==================== STEP 2: Set KMS Generation ====================
  console.log("\n[2/5] Setting KMS generation...");

  const kmsGeneration = parseInt(process.env.KMS_GENERATION || "1");
  console.log(`   KMS Generation: ${kmsGeneration}`);
  console.log(`✅ KMS generation configured`);

  // ==================== STEP 3: Deploy Contract ====================
  console.log("\n[3/5] Deploying contract...");

  const PrivateRenovationBudget = await ethers.getContractFactory("PrivateRenovationBudget");

  console.log("   Sending deployment transaction...");
  const contract = await PrivateRenovationBudget.deploy(pauserAddresses, kmsGeneration);

  console.log("   Waiting for deployment confirmation...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTxHash = contract.deploymentTransaction().hash;

  console.log(`✅ Contract deployed successfully!`);
  console.log(`   Address: ${contractAddress}`);
  console.log(`   Tx Hash: ${deployTxHash}`);

  // ==================== STEP 4: Verify Deployment ====================
  console.log("\n[4/5] Verifying deployment...");

  const owner = await contract.owner();
  const isPaused = await contract.isPaused();
  const pauserCount = await contract.getPauserCount();
  const actualKmsGen = await contract.kmsGeneration();

  console.log(`   Owner: ${owner}`);
  console.log(`   Is Paused: ${isPaused}`);
  console.log(`   Pauser Count: ${pauserCount}`);
  console.log(`   KMS Generation: ${actualKmsGen}`);

  // Verify each pauser
  console.log("\n   Verifying pausers...");
  for (let i = 0; i < pauserAddresses.length; i++) {
    const isPauserValid = await contract.isPauser(pauserAddresses[i]);
    const status = isPauserValid ? "✅" : "❌";
    console.log(`   ${status} Pauser ${i}: ${pauserAddresses[i]}`);
  }

  console.log(`✅ Deployment verified successfully!`);

  // ==================== STEP 5: Summary ====================
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Contract Address:   ${contractAddress}`);
  console.log(`Network:            ${(await ethers.provider.getNetwork()).name}`);
  console.log(`Chain ID:           ${(await ethers.provider.getNetwork()).chainId}`);
  console.log(`Owner:              ${owner}`);
  console.log(`Pausers:            ${pauserCount}`);
  console.log(`KMS Generation:     ${actualKmsGen}`);
  console.log(`Is Paused:          ${isPaused}`);
  console.log(`Tx Hash:            ${deployTxHash}`);
  console.log("=".repeat(60));

  console.log("\n📝 SAVE THESE VALUES TO YOUR .env FILE:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("⚠️  Remember to:");
  console.log("   1. Save the contract address");
  console.log("   2. Verify the contract on block explorer");
  console.log("   3. Test pause/unpause functionality");
  console.log("   4. Update frontend with new contract ABI");
  console.log("   5. Configure KMS nodes with contract address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });