import { expect } from "chai";
import { ethers } from "hardhat";
import { PrivateRenovationBudget } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Private Renovation Budget Manager - Sepolia Testnet", function () {
  let contract: PrivateRenovationBudget;
  let contractAddress: string;
  let alice: HardhatEthersSigner;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`  ${++step}/${steps} ${message}`);
  }

  before(async function () {
    // Check if we're on Sepolia network
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 11155111n) {
      console.warn(`⚠️  This test suite can only run on Sepolia Testnet (chainId: 11155111)`);
      console.warn(`   Current network: ${network.name} (chainId: ${network.chainId})`);
      this.skip();
    }

    // Get deployed contract address (should be set in deployment or hardhat.config)
    const deployedAddress = process.env.CONTRACT_ADDRESS || "0x301258156b7D06e69A2E116fc8EC574B78D2EA38";

    if (!deployedAddress || deployedAddress === ethers.ZeroAddress) {
      console.error("❌ CONTRACT_ADDRESS not set. Please deploy the contract first:");
      console.error("   npx hardhat run scripts/deploy.js --network sepolia");
      this.skip();
    }

    contractAddress = deployedAddress;
    contract = await ethers.getContractAt("PrivateRenovationBudget", contractAddress);

    const signers = await ethers.getSigners();
    alice = signers[0];

    console.log(`\n📍 Testing on Sepolia Testnet`);
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Tester: ${alice.address}`);
  });

  beforeEach(function () {
    step = 0;
    steps = 0;
  });

  describe("Sepolia Integration Tests", function () {
    it("should connect to deployed contract", async function () {
      steps = 2;
      this.timeout(30000);

      progress("Connecting to contract...");
      const code = await ethers.provider.getCode(contractAddress);
      expect(code).to.not.equal("0x");

      progress("Verifying contract deployment");
      const owner = await contract.owner();
      expect(owner).to.be.properAddress;
    });

    it("should create project on Sepolia", async function () {
      steps = 5;
      this.timeout(120000); // 2 minutes

      progress("Getting current project ID...");
      const beforeId = await contract.nextProjectId();
      console.log(`      Current next project ID: ${beforeId}`);

      progress("Creating new project...");
      const tx = await contract.connect(alice).createProject();
      console.log(`      Transaction hash: ${tx.hash}`);

      progress("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log(`      Gas used: ${receipt?.gasUsed.toString()}`);

      progress("Verifying project creation...");
      const afterId = await contract.nextProjectId();
      expect(afterId).to.be.gt(beforeId);

      progress(`✅ Project created! ID: ${beforeId}`);
    });

    it("should verify contractor on Sepolia", async function () {
      steps = 4;
      this.timeout(120000);

      const contractorAddress = "0x1234567890123456789012345678901234567890"; // Example address

      progress("Checking current owner...");
      const owner = await contract.owner();
      console.log(`      Contract owner: ${owner}`);
      console.log(`      Current user: ${alice.address}`);

      if (owner.toLowerCase() !== alice.address.toLowerCase()) {
        console.warn(`      ⚠️  Skipping: Not contract owner`);
        this.skip();
      }

      progress("Verifying contractor...");
      const tx = await contract.connect(alice).verifyContractor(contractorAddress);
      console.log(`      Transaction hash: ${tx.hash}`);

      progress("Waiting for confirmation...");
      await tx.wait();

      progress("Checking verification status...");
      const isVerified = await contract.verifiedContractors(contractorAddress);
      expect(isVerified).to.be.true;
    });

    it("should read project information from Sepolia", async function () {
      steps = 3;
      this.timeout(60000);

      progress("Getting total project count...");
      const nextId = await contract.nextProjectId();
      console.log(`      Total projects created: ${Number(nextId) - 1}`);

      if (nextId <= 1n) {
        console.warn(`      ⚠️  No projects exist yet. Create one first.`);
        this.skip();
      }

      progress("Reading first project info...");
      const projectInfo = await contract.getProjectInfo(1);
      console.log(`      Homeowner: ${projectInfo.homeowner}`);
      console.log(`      Is Calculated: ${projectInfo.isCalculated}`);
      console.log(`      Room Count: ${projectInfo.roomCount}`);
      console.log(`      Bid Count: ${projectInfo.bidCount}`);

      progress("✅ Successfully read project data");
      expect(projectInfo.homeowner).to.be.properAddress;
    });

    it("should check pauser configuration on Sepolia", async function () {
      steps = 3;
      this.timeout(60000);

      progress("Getting pauser count...");
      const pauserCount = await contract.getPauserCount();
      console.log(`      Total pausers: ${pauserCount}`);
      expect(pauserCount).to.be.gt(0);

      progress("Checking if contract is paused...");
      const isPaused = await contract.isPaused();
      console.log(`      Contract paused: ${isPaused}`);

      progress("✅ Pauser configuration verified");
    });

    it("should measure gas costs on Sepolia", async function () {
      steps = 4;
      this.timeout(120000);

      progress("Creating project to measure gas...");
      const tx = await contract.connect(alice).createProject();

      progress("Waiting for transaction confirmation...");
      const receipt = await tx.wait();

      progress("Analyzing gas usage...");
      const gasUsed = receipt?.gasUsed || 0n;
      const gasPrice = receipt?.gasPrice || 0n;
      const totalCost = gasUsed * gasPrice;
      const costInEth = ethers.formatEther(totalCost);

      console.log(`      Gas used: ${gasUsed.toString()}`);
      console.log(`      Gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);
      console.log(`      Total cost: ${costInEth} ETH`);

      progress(`✅ Gas analysis complete`);
      expect(gasUsed).to.be.gt(0n);
    });

    it("should verify KMS generation on Sepolia", async function () {
      steps = 2;
      this.timeout(30000);

      progress("Reading KMS generation...");
      const kmsGen = await contract.kmsGeneration();
      console.log(`      KMS Generation: ${kmsGen}`);

      progress("✅ KMS configuration verified");
      expect(kmsGen).to.be.gte(1);
    });

    it("should check contract state consistency", async function () {
      steps = 4;
      this.timeout(60000);

      progress("Reading contract owner...");
      const owner = await contract.owner();
      expect(owner).to.be.properAddress;

      progress("Reading next project ID...");
      const nextId = await contract.nextProjectId();
      expect(nextId).to.be.gte(1n);

      progress("Checking pause state...");
      const isPaused = await contract.isPaused();
      console.log(`      Contract paused: ${isPaused}`);

      progress("✅ State consistency verified");
    });
  });

  describe("Sepolia Performance Tests", function () {
    it("should measure project creation latency", async function () {
      steps = 3;
      this.timeout(120000);

      progress("Recording start time...");
      const startTime = Date.now();

      progress("Creating project...");
      const tx = await contract.connect(alice).createProject();
      await tx.wait();

      const endTime = Date.now();
      const latency = endTime - startTime;

      progress(`✅ Latency: ${latency}ms`);
      console.log(`      Average block time: ~12 seconds`);

      expect(latency).to.be.gt(0);
    });

    it("should verify transaction confirmation time", async function () {
      steps = 4;
      this.timeout(120000);

      progress("Submitting transaction...");
      const startTime = Date.now();
      const tx = await contract.connect(alice).createProject();

      progress("Waiting for 1 confirmation...");
      await tx.wait(1);
      const oneConfTime = Date.now() - startTime;

      progress("Waiting for 2 confirmations...");
      await tx.wait(2);
      const twoConfTime = Date.now() - startTime;

      console.log(`      1 confirmation: ${oneConfTime}ms`);
      console.log(`      2 confirmations: ${twoConfTime}ms`);

      progress(`✅ Confirmation times measured`);
    });
  });

  describe("Sepolia Error Handling", function () {
    it("should handle reverted transactions gracefully", async function () {
      steps = 2;
      this.timeout(60000);

      progress("Attempting invalid operation...");

      await expect(
        contract.connect(alice).addRoomRequirement(999, 100, 5000, 3000)
      ).to.be.reverted;

      progress("✅ Revert handled correctly");
    });

    it("should handle network delays", async function () {
      steps = 3;
      this.timeout(180000); // 3 minutes

      progress("Submitting transaction...");
      const tx = await contract.connect(alice).createProject();

      progress("Waiting with extended timeout...");
      const receipt = await tx.wait();

      progress("✅ Transaction confirmed despite network delays");
      expect(receipt).to.not.be.null;
    });
  });
});
