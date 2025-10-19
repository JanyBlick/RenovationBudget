import { expect } from "chai";
import { ethers } from "hardhat";
import { PrivateRenovationBudget } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Private Renovation Budget Manager", function () {
  let contract: PrivateRenovationBudget;
  let contractAddress: string;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let contractor1: HardhatEthersSigner;
  let contractor2: HardhatEthersSigner;
  let pauser1: HardhatEthersSigner;
  let pauser2: HardhatEthersSigner;
  let pauser3: HardhatEthersSigner;

  const KMS_GENERATION = 1;

  async function deployFixture() {
    const signers = await ethers.getSigners();
    [owner, alice, bob, contractor1, contractor2, pauser1, pauser2, pauser3] = signers;

    const pauserAddresses = [
      pauser1.address,
      pauser2.address,
      pauser3.address
    ];

    const PrivateRenovationBudget = await ethers.getContractFactory("PrivateRenovationBudget");
    const instance = await PrivateRenovationBudget.deploy(pauserAddresses, KMS_GENERATION);
    await instance.waitForDeployment();

    const address = await instance.getAddress();

    return { contract: instance, contractAddress: address };
  }

  beforeEach(async function () {
    const deployment = await deployFixture();
    contract = deployment.contract;
    contractAddress = deployment.contractAddress;
  });

  describe("1. Deployment and Initialization (5 tests)", function () {
    it("should deploy successfully with valid address", async function () {
      expect(contractAddress).to.be.properAddress;
      expect(contractAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should set the correct owner", async function () {
      const contractOwner = await contract.owner();
      expect(contractOwner).to.equal(owner.address);
    });

    it("should initialize with correct KMS generation", async function () {
      const kmsGen = await contract.kmsGeneration();
      expect(kmsGen).to.equal(BigInt(KMS_GENERATION));
    });

    it("should start with nextProjectId as 1", async function () {
      const nextId = await contract.nextProjectId();
      expect(nextId).to.equal(1n);
    });

    it("should not be paused after deployment", async function () {
      const paused = await contract.isPaused();
      expect(paused).to.equal(false);
    });
  });

  describe("2. Pauser Management (8 tests)", function () {
    it("should correctly register initial pausers", async function () {
      const isPauser1 = await contract.isPauser(pauser1.address);
      const isPauser2 = await contract.isPauser(pauser2.address);
      const isPauser3 = await contract.isPauser(pauser3.address);

      expect(isPauser1).to.be.true;
      expect(isPauser2).to.be.true;
      expect(isPauser3).to.be.true;
    });

    it("should return correct pauser count", async function () {
      const count = await contract.getPauserCount();
      expect(count).to.equal(3);
    });

    it("should allow owner to add new pauser", async function () {
      await contract.connect(owner).addPauser(alice.address);
      const isAlicePauser = await contract.isPauser(alice.address);
      expect(isAlicePauser).to.be.true;

      const count = await contract.getPauserCount();
      expect(count).to.equal(4);
    });

    it("should prevent non-owner from adding pauser", async function () {
      await expect(
        contract.connect(alice).addPauser(bob.address)
      ).to.be.reverted;
    });

    it("should prevent adding duplicate pauser", async function () {
      await expect(
        contract.connect(owner).addPauser(pauser1.address)
      ).to.be.revertedWith("Already a pauser");
    });

    it("should prevent adding zero address as pauser", async function () {
      await expect(
        contract.connect(owner).addPauser(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("should allow owner to remove pauser", async function () {
      await contract.connect(owner).removePauser(pauser1.address);
      const isPauser = await contract.isPauser(pauser1.address);
      expect(isPauser).to.be.false;

      const count = await contract.getPauserCount();
      expect(count).to.equal(2);
    });

    it("should prevent removing non-existent pauser", async function () {
      await expect(
        contract.connect(owner).removePauser(alice.address)
      ).to.be.revertedWith("Not a pauser");
    });
  });

  describe("3. Pause/Unpause Functionality (6 tests)", function () {
    it("should allow pauser to pause contract", async function () {
      await contract.connect(pauser1).pause();
      const paused = await contract.isPaused();
      expect(paused).to.be.true;
    });

    it("should allow pauser to unpause contract", async function () {
      await contract.connect(pauser1).pause();
      await contract.connect(pauser1).unpause();
      const paused = await contract.isPaused();
      expect(paused).to.be.false;
    });

    it("should prevent non-pauser from pausing", async function () {
      await expect(
        contract.connect(alice).pause()
      ).to.be.revertedWith("Not authorized to pause");
    });

    it("should prevent non-pauser from unpausing", async function () {
      await contract.connect(pauser1).pause();
      await expect(
        contract.connect(alice).unpause()
      ).to.be.revertedWith("Not authorized to pause");
    });

    it("should prevent operations when paused", async function () {
      await contract.connect(pauser1).pause();

      await expect(
        contract.connect(alice).createProject()
      ).to.be.revertedWith("Contract is paused");
    });

    it("should allow operations after unpausing", async function () {
      await contract.connect(pauser1).pause();
      await contract.connect(pauser1).unpause();

      await expect(
        contract.connect(alice).createProject()
      ).to.not.be.reverted;
    });
  });

  describe("4. Contractor Verification (6 tests)", function () {
    it("should allow owner to verify contractor", async function () {
      await contract.connect(owner).verifyContractor(contractor1.address);
      const isVerified = await contract.verifiedContractors(contractor1.address);
      expect(isVerified).to.be.true;
    });

    it("should prevent non-owner from verifying contractor", async function () {
      await expect(
        contract.connect(alice).verifyContractor(contractor1.address)
      ).to.be.reverted;
    });

    it("should prevent verifying zero address", async function () {
      await expect(
        contract.connect(owner).verifyContractor(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid contractor address");
    });

    it("should emit ContractorVerified event", async function () {
      await expect(
        contract.connect(owner).verifyContractor(contractor1.address)
      ).to.emit(contract, "ContractorVerified")
        .withArgs(contractor1.address);
    });

    it("should prevent duplicate verification", async function () {
      await contract.connect(owner).verifyContractor(contractor1.address);
      await expect(
        contract.connect(owner).verifyContractor(contractor1.address)
      ).to.be.revertedWith("Contractor already verified");
    });

    it("should maintain verification state across operations", async function () {
      await contract.connect(owner).verifyContractor(contractor1.address);
      await contract.connect(owner).verifyContractor(contractor2.address);

      expect(await contract.verifiedContractors(contractor1.address)).to.be.true;
      expect(await contract.verifiedContractors(contractor2.address)).to.be.true;
      expect(await contract.verifiedContractors(alice.address)).to.be.false;
    });
  });

  describe("5. Project Creation (7 tests)", function () {
    it("should allow user to create project", async function () {
      const tx = await contract.connect(alice).createProject();
      await tx.wait();

      const nextId = await contract.nextProjectId();
      expect(nextId).to.equal(2n);
    });

    it("should emit ProjectCreated event", async function () {
      await expect(
        contract.connect(alice).createProject()
      ).to.emit(contract, "ProjectCreated")
        .withArgs(1n, alice.address);
    });

    it("should increment project ID correctly", async function () {
      await contract.connect(alice).createProject();
      await contract.connect(bob).createProject();
      await contract.connect(alice).createProject();

      const nextId = await contract.nextProjectId();
      expect(nextId).to.equal(4n);
    });

    it("should initialize project with correct owner", async function () {
      await contract.connect(alice).createProject();
      const projectInfo = await contract.getProjectInfo(1);

      expect(projectInfo.homeowner).to.equal(alice.address);
    });

    it("should initialize project as not calculated", async function () {
      await contract.connect(alice).createProject();
      const projectInfo = await contract.getProjectInfo(1);

      expect(projectInfo.isCalculated).to.be.false;
    });

    it("should initialize project as not approved", async function () {
      await contract.connect(alice).createProject();
      const projectInfo = await contract.getProjectInfo(1);

      expect(projectInfo.isApproved).to.be.false;
    });

    it("should set project timestamp", async function () {
      await contract.connect(alice).createProject();
      const projectInfo = await contract.getProjectInfo(1);

      expect(projectInfo.timestamp).to.be.gt(0);
    });
  });

  describe("6. Room Requirements (8 tests)", function () {
    beforeEach(async function () {
      await contract.connect(alice).createProject();
    });

    it("should allow homeowner to add room", async function () {
      const tx = await contract.connect(alice).addRoomRequirement(
        1, // projectId
        100, // area
        5000, // materialCost
        3000  // laborCost
      );
      await tx.wait();

      const projectInfo = await contract.getProjectInfo(1);
      expect(projectInfo.roomCount).to.equal(1);
    });

    it("should emit RoomAdded event", async function () {
      await expect(
        contract.connect(alice).addRoomRequirement(1, 100, 5000, 3000)
      ).to.emit(contract, "RoomAdded")
        .withArgs(1n, 0);
    });

    it("should prevent non-homeowner from adding room", async function () {
      await expect(
        contract.connect(bob).addRoomRequirement(1, 100, 5000, 3000)
      ).to.be.revertedWith("Not the homeowner");
    });

    it("should allow adding multiple rooms", async function () {
      await contract.connect(alice).addRoomRequirement(1, 100, 5000, 3000);
      await contract.connect(alice).addRoomRequirement(1, 150, 7000, 4000);
      await contract.connect(alice).addRoomRequirement(1, 80, 3000, 2000);

      const projectInfo = await contract.getProjectInfo(1);
      expect(projectInfo.roomCount).to.equal(3);
    });

    it("should handle zero area input", async function () {
      await expect(
        contract.connect(alice).addRoomRequirement(1, 0, 5000, 3000)
      ).to.not.be.reverted;
    });

    it("should handle zero material cost", async function () {
      await expect(
        contract.connect(alice).addRoomRequirement(1, 100, 0, 3000)
      ).to.not.be.reverted;
    });

    it("should handle zero labor cost", async function () {
      await expect(
        contract.connect(alice).addRoomRequirement(1, 100, 5000, 0)
      ).to.not.be.reverted;
    });

    it("should prevent adding room to non-existent project", async function () {
      await expect(
        contract.connect(alice).addRoomRequirement(999, 100, 5000, 3000)
      ).to.be.reverted;
    });
  });

  describe("7. Budget Calculation (6 tests)", function () {
    beforeEach(async function () {
      await contract.connect(alice).createProject();
      await contract.connect(alice).addRoomRequirement(1, 100, 5000, 3000);
    });

    it("should allow homeowner to calculate budget", async function () {
      const tx = await contract.connect(alice).calculateBudget(1, 10); // 10% contingency
      await tx.wait();

      const projectInfo = await contract.getProjectInfo(1);
      expect(projectInfo.isCalculated).to.be.true;
    });

    it("should emit BudgetCalculated event", async function () {
      await expect(
        contract.connect(alice).calculateBudget(1, 10)
      ).to.emit(contract, "BudgetCalculated")
        .withArgs(1n, alice.address);
    });

    it("should prevent non-homeowner from calculating budget", async function () {
      await expect(
        contract.connect(bob).calculateBudget(1, 10)
      ).to.be.revertedWith("Not the homeowner");
    });

    it("should prevent calculating already calculated budget", async function () {
      await contract.connect(alice).calculateBudget(1, 10);

      await expect(
        contract.connect(alice).calculateBudget(1, 10)
      ).to.be.revertedWith("Budget already calculated");
    });

    it("should handle zero contingency percentage", async function () {
      await expect(
        contract.connect(alice).calculateBudget(1, 0)
      ).to.not.be.reverted;
    });

    it("should prevent excessive contingency percentage", async function () {
      await expect(
        contract.connect(alice).calculateBudget(1, 51)
      ).to.be.revertedWith("Contingency too high");
    });
  });

  describe("8. Contractor Bidding (7 tests)", function () {
    beforeEach(async function () {
      await contract.connect(owner).verifyContractor(contractor1.address);
      await contract.connect(owner).verifyContractor(contractor2.address);
      await contract.connect(alice).createProject();
      await contract.connect(alice).addRoomRequirement(1, 100, 5000, 3000);
    });

    it("should allow verified contractor to submit bid", async function () {
      const tx = await contract.connect(contractor1).submitBid(
        1, // projectId
        10000, // bidAmount
        30 // timeEstimate in days
      );
      await tx.wait();

      const projectInfo = await contract.getProjectInfo(1);
      expect(projectInfo.bidCount).to.equal(1);
    });

    it("should emit BidSubmitted event", async function () {
      await expect(
        contract.connect(contractor1).submitBid(1, 10000, 30)
      ).to.emit(contract, "BidSubmitted")
        .withArgs(1n, contractor1.address);
    });

    it("should prevent unverified contractor from bidding", async function () {
      await expect(
        contract.connect(alice).submitBid(1, 10000, 30)
      ).to.be.revertedWith("Contractor not verified");
    });

    it("should allow multiple contractors to bid", async function () {
      await contract.connect(contractor1).submitBid(1, 10000, 30);
      await contract.connect(contractor2).submitBid(1, 12000, 25);

      const projectInfo = await contract.getProjectInfo(1);
      expect(projectInfo.bidCount).to.equal(2);
    });

    it("should track contractors who submitted bids", async function () {
      await contract.connect(contractor1).submitBid(1, 10000, 30);
      await contract.connect(contractor2).submitBid(1, 12000, 25);

      const contractors = await contract.getProjectContractors(1);
      expect(contractors).to.include(contractor1.address);
      expect(contractors).to.include(contractor2.address);
      expect(contractors.length).to.equal(2);
    });

    it("should handle zero bid amount", async function () {
      await expect(
        contract.connect(contractor1).submitBid(1, 0, 30)
      ).to.not.be.reverted;
    });

    it("should handle zero time estimate", async function () {
      await expect(
        contract.connect(contractor1).submitBid(1, 10000, 0)
      ).to.not.be.reverted;
    });
  });

  describe("9. Project Approval (6 tests)", function () {
    beforeEach(async function () {
      await contract.connect(owner).verifyContractor(contractor1.address);
      await contract.connect(owner).verifyContractor(contractor2.address);
      await contract.connect(alice).createProject();
      await contract.connect(alice).addRoomRequirement(1, 100, 5000, 3000);
      await contract.connect(alice).calculateBudget(1, 10);
      await contract.connect(contractor1).submitBid(1, 10000, 30);
      await contract.connect(contractor2).submitBid(1, 12000, 25);
    });

    it("should allow homeowner to approve project", async function () {
      const tx = await contract.connect(alice).approveProject(1, contractor1.address);
      await tx.wait();

      const projectInfo = await contract.getProjectInfo(1);
      expect(projectInfo.isApproved).to.be.true;
    });

    it("should emit ProjectApproved event", async function () {
      await expect(
        contract.connect(alice).approveProject(1, contractor1.address)
      ).to.emit(contract, "ProjectApproved")
        .withArgs(1n, contractor1.address);
    });

    it("should prevent non-homeowner from approving", async function () {
      await expect(
        contract.connect(bob).approveProject(1, contractor1.address)
      ).to.be.revertedWith("Not the homeowner");
    });

    it("should prevent approving without budget calculation", async function () {
      await contract.connect(bob).createProject();

      await expect(
        contract.connect(bob).approveProject(2, contractor1.address)
      ).to.be.revertedWith("Budget not calculated");
    });

    it("should prevent approving already approved project", async function () {
      await contract.connect(alice).approveProject(1, contractor1.address);

      await expect(
        contract.connect(alice).approveProject(1, contractor2.address)
      ).to.be.revertedWith("Project already approved");
    });

    it("should prevent approving with non-bidding contractor", async function () {
      await expect(
        contract.connect(alice).approveProject(1, alice.address)
      ).to.be.revertedWith("Contractor has not bid");
    });
  });

  describe("10. View Functions (5 tests)", function () {
    beforeEach(async function () {
      await contract.connect(alice).createProject();
      await contract.connect(alice).addRoomRequirement(1, 100, 5000, 3000);
    });

    it("should return correct project info", async function () {
      const info = await contract.getProjectInfo(1);

      expect(info.homeowner).to.equal(alice.address);
      expect(info.isCalculated).to.be.false;
      expect(info.isApproved).to.be.false;
      expect(info.roomCount).to.equal(1);
      expect(info.bidCount).to.equal(0);
    });

    it("should return empty contractors array for new project", async function () {
      const contractors = await contract.getProjectContractors(1);
      expect(contractors.length).to.equal(0);
    });

    it("should return project info for non-existent project", async function () {
      await expect(
        contract.getProjectInfo(999)
      ).to.not.be.reverted;
    });

    it("should return budget estimate after calculation", async function () {
      await contract.connect(alice).calculateBudget(1, 10);

      const budget = await contract.getBudgetEstimate(1);
      expect(budget.totalBudget).to.not.equal(0);
      expect(budget.finalEstimate).to.not.equal(0);
    });

    it("should return zero budget before calculation", async function () {
      const budget = await contract.getBudgetEstimate(1);
      expect(budget.totalBudget).to.equal(0);
      expect(budget.finalEstimate).to.equal(0);
    });
  });

  describe("11. Edge Cases and Boundary Conditions (6 tests)", function () {
    it("should handle maximum uint32 values in room requirements", async function () {
      await contract.connect(alice).createProject();
      const maxUint32 = 2n ** 32n - 1n;

      await expect(
        contract.connect(alice).addRoomRequirement(
          1,
          Number(maxUint32),
          Number(maxUint32),
          Number(maxUint32)
        )
      ).to.not.be.reverted;
    });

    it("should handle maximum uint64 values in bidding", async function () {
      await contract.connect(owner).verifyContractor(contractor1.address);
      await contract.connect(alice).createProject();
      await contract.connect(alice).addRoomRequirement(1, 100, 5000, 3000);

      const maxUint64 = 2n ** 64n - 1n;

      await expect(
        contract.connect(contractor1).submitBid(1, maxUint64, 1)
      ).to.not.be.reverted;
    });

    it("should handle rapid project creation", async function () {
      for (let i = 0; i < 10; i++) {
        await contract.connect(alice).createProject();
      }

      const nextId = await contract.nextProjectId();
      expect(nextId).to.equal(11n);
    });

    it("should maintain state consistency across pause/unpause cycles", async function () {
      await contract.connect(alice).createProject();
      const infoBefore = await contract.getProjectInfo(1);

      await contract.connect(pauser1).pause();
      await contract.connect(pauser1).unpause();

      const infoAfter = await contract.getProjectInfo(1);
      expect(infoBefore.homeowner).to.equal(infoAfter.homeowner);
      expect(infoBefore.timestamp).to.equal(infoAfter.timestamp);
    });

    it("should handle multiple pausers pausing simultaneously", async function () {
      await contract.connect(pauser1).pause();
      const paused = await contract.isPaused();
      expect(paused).to.be.true;

      // Should not revert even if already paused
      await expect(
        contract.connect(pauser2).pause()
      ).to.not.be.reverted;
    });

    it("should prevent project operations on invalid project IDs", async function () {
      await expect(
        contract.connect(alice).addRoomRequirement(0, 100, 5000, 3000)
      ).to.be.reverted;

      await expect(
        contract.connect(alice).calculateBudget(0, 10)
      ).to.be.reverted;
    });
  });

  describe("12. Gas Optimization Tests (3 tests)", function () {
    it("should create project with reasonable gas cost", async function () {
      const tx = await contract.connect(alice).createProject();
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lt(500000n);
    });

    it("should add room with reasonable gas cost", async function () {
      await contract.connect(alice).createProject();

      const tx = await contract.connect(alice).addRoomRequirement(1, 100, 5000, 3000);
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lt(500000n);
    });

    it("should submit bid with reasonable gas cost", async function () {
      await contract.connect(owner).verifyContractor(contractor1.address);
      await contract.connect(alice).createProject();
      await contract.connect(alice).addRoomRequirement(1, 100, 5000, 3000);

      const tx = await contract.connect(contractor1).submitBid(1, 10000, 30);
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lt(600000n);
    });
  });
});
