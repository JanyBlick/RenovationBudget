// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateRenovationBudget is SepoliaConfig {

    address public owner;
    uint256 public nextProjectId;

    struct RoomRequirement {
        euint32 area;          // Room area in square meters (encrypted)
        euint32 materialCost;  // Cost per square meter (encrypted)
        euint32 laborCost;     // Labor cost per square meter (encrypted)
        bool isActive;
    }

    struct RenovationProject {
        address homeowner;
        euint64 totalBudget;           // Total calculated budget (encrypted)
        euint32 contingencyPercent;    // Contingency percentage (encrypted)
        euint64 finalEstimate;         // Final estimate with contingency (encrypted)
        bool isCalculated;
        bool isApproved;
        uint256 timestamp;
        uint8 roomCount;
        mapping(uint8 => RoomRequirement) rooms;
    }

    struct ContractorBid {
        address contractor;
        euint64 bidAmount;     // Encrypted bid amount
        euint32 timeEstimate;  // Estimated completion time in days (encrypted)
        bool isSubmitted;
        uint256 timestamp;
    }

    mapping(uint256 => RenovationProject) public projects;
    mapping(uint256 => mapping(address => ContractorBid)) public bids;
    mapping(uint256 => address[]) public projectContractors;
    mapping(address => bool) public verifiedContractors;

    event ProjectCreated(uint256 indexed projectId, address indexed homeowner);
    event RoomAdded(uint256 indexed projectId, uint8 roomIndex);
    event BudgetCalculated(uint256 indexed projectId, address indexed homeowner);
    event BidSubmitted(uint256 indexed projectId, address indexed contractor);
    event ProjectApproved(uint256 indexed projectId, address indexed selectedContractor);
    event ContractorVerified(address indexed contractor);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyProjectOwner(uint256 projectId) {
        require(msg.sender == projects[projectId].homeowner, "Not project owner");
        _;
    }

    modifier onlyVerifiedContractor() {
        require(verifiedContractors[msg.sender], "Not verified contractor");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextProjectId = 1;
    }

    // Verify a contractor
    function verifyContractor(address contractor) external onlyOwner {
        verifiedContractors[contractor] = true;
        emit ContractorVerified(contractor);
    }

    // Create new renovation project
    function createProject() external returns (uint256) {
        uint256 projectId = nextProjectId++;

        RenovationProject storage newProject = projects[projectId];
        newProject.homeowner = msg.sender;
        newProject.isCalculated = false;
        newProject.isApproved = false;
        newProject.timestamp = block.timestamp;
        newProject.roomCount = 0;

        emit ProjectCreated(projectId, msg.sender);
        return projectId;
    }

    // Add room requirements to project (encrypted inputs)
    function addRoomRequirement(
        uint256 projectId,
        uint32 area,
        uint32 materialCost,
        uint32 laborCost
    ) external onlyProjectOwner(projectId) {
        require(!projects[projectId].isCalculated, "Project already calculated");
        require(projects[projectId].roomCount < 20, "Maximum 20 rooms allowed");

        // Encrypt the inputs
        euint32 encryptedArea = FHE.asEuint32(area);
        euint32 encryptedMaterialCost = FHE.asEuint32(materialCost);
        euint32 encryptedLaborCost = FHE.asEuint32(laborCost);

        uint8 roomIndex = projects[projectId].roomCount;

        projects[projectId].rooms[roomIndex] = RoomRequirement({
            area: encryptedArea,
            materialCost: encryptedMaterialCost,
            laborCost: encryptedLaborCost,
            isActive: true
        });

        projects[projectId].roomCount++;

        // Grant ACL permissions
        FHE.allowThis(encryptedArea);
        FHE.allowThis(encryptedMaterialCost);
        FHE.allowThis(encryptedLaborCost);
        FHE.allow(encryptedArea, msg.sender);
        FHE.allow(encryptedMaterialCost, msg.sender);
        FHE.allow(encryptedLaborCost, msg.sender);

        emit RoomAdded(projectId, roomIndex);
    }

    // Calculate total budget (FHE computation)
    function calculateBudget(
        uint256 projectId,
        uint32 contingencyPercent
    ) external onlyProjectOwner(projectId) {
        require(projects[projectId].roomCount > 0, "No rooms added");
        require(!projects[projectId].isCalculated, "Already calculated");
        require(contingencyPercent <= 50, "Contingency too high");

        RenovationProject storage project = projects[projectId];

        // Initialize total budget
        euint64 totalBudget = FHE.asEuint64(0);

        // Calculate total cost for all rooms using FHE operations
        for (uint8 i = 0; i < project.roomCount; i++) {
            if (project.rooms[i].isActive) {
                // Room cost = area * (materialCost + laborCost)
                euint32 costPerSqm = FHE.add(
                    project.rooms[i].materialCost,
                    project.rooms[i].laborCost
                );

                euint32 roomCost = FHE.mul(
                    project.rooms[i].area,
                    costPerSqm
                );

                // Add to total budget (convert to euint64)
                totalBudget = FHE.add(
                    totalBudget,
                    FHE.asEuint64(roomCost)
                );
            }
        }

        // Store contingency percentage - final calculation done client-side
        // Since FHE.div is not supported, we store the base budget and percentage separately
        euint32 encryptedContingency = FHE.asEuint32(contingencyPercent);

        // For this version, finalEstimate equals totalBudget
        // Client-side application will calculate: finalEstimate = totalBudget * (100 + contingencyPercent) / 100
        euint64 finalEstimate = totalBudget;

        // Store encrypted results
        project.totalBudget = totalBudget;
        project.contingencyPercent = encryptedContingency;
        project.finalEstimate = finalEstimate;
        project.isCalculated = true;

        // Grant ACL permissions
        FHE.allowThis(totalBudget);
        FHE.allowThis(encryptedContingency);
        FHE.allowThis(finalEstimate);
        FHE.allow(totalBudget, msg.sender);
        FHE.allow(encryptedContingency, msg.sender);
        FHE.allow(finalEstimate, msg.sender);

        emit BudgetCalculated(projectId, msg.sender);
    }

    // Contractors submit encrypted bids
    function submitBid(
        uint256 projectId,
        uint64 bidAmount,
        uint32 timeEstimate
    ) external onlyVerifiedContractor {
        require(projects[projectId].isCalculated, "Project not calculated");
        require(!projects[projectId].isApproved, "Project already approved");
        require(!bids[projectId][msg.sender].isSubmitted, "Bid already submitted");

        // Encrypt bid information
        euint64 encryptedBidAmount = FHE.asEuint64(bidAmount);
        euint32 encryptedTimeEstimate = FHE.asEuint32(timeEstimate);

        bids[projectId][msg.sender] = ContractorBid({
            contractor: msg.sender,
            bidAmount: encryptedBidAmount,
            timeEstimate: encryptedTimeEstimate,
            isSubmitted: true,
            timestamp: block.timestamp
        });

        projectContractors[projectId].push(msg.sender);

        // Grant ACL permissions
        FHE.allowThis(encryptedBidAmount);
        FHE.allowThis(encryptedTimeEstimate);
        FHE.allow(encryptedBidAmount, msg.sender);
        FHE.allow(encryptedTimeEstimate, msg.sender);
        FHE.allow(encryptedBidAmount, projects[projectId].homeowner);
        FHE.allow(encryptedTimeEstimate, projects[projectId].homeowner);

        emit BidSubmitted(projectId, msg.sender);
    }

    // Compare bid with budget (returns encrypted values for client-side comparison)
    function compareBidWithBudget(
        uint256 projectId,
        address contractor
    ) external view onlyProjectOwner(projectId) returns (
        euint64 bidAmount,
        euint64 budgetEstimate
    ) {
        require(projects[projectId].isCalculated, "Project not calculated");
        require(bids[projectId][contractor].isSubmitted, "No bid from contractor");

        // Return encrypted values for client-side comparison
        // Client can decrypt both values and compare them
        return (
            bids[projectId][contractor].bidAmount,
            projects[projectId].finalEstimate
        );
    }

    // Approve project and select contractor
    function approveProject(
        uint256 projectId,
        address selectedContractor
    ) external onlyProjectOwner(projectId) {
        require(projects[projectId].isCalculated, "Project not calculated");
        require(!projects[projectId].isApproved, "Already approved");
        require(bids[projectId][selectedContractor].isSubmitted, "Invalid contractor");

        projects[projectId].isApproved = true;

        emit ProjectApproved(projectId, selectedContractor);
    }

    // Get project basic info (non-encrypted data)
    function getProjectInfo(uint256 projectId) external view returns (
        address homeowner,
        bool isCalculated,
        bool isApproved,
        uint256 timestamp,
        uint8 roomCount,
        uint256 bidCount
    ) {
        RenovationProject storage project = projects[projectId];
        return (
            project.homeowner,
            project.isCalculated,
            project.isApproved,
            project.timestamp,
            project.roomCount,
            projectContractors[projectId].length
        );
    }

    // Get encrypted budget for authorized users (returns handle to encrypted values)
    function getBudgetEstimate(uint256 projectId) external view onlyProjectOwner(projectId) returns (
        euint64 totalBudget,
        euint64 finalEstimate
    ) {
        require(projects[projectId].isCalculated, "Project not calculated");

        return (
            projects[projectId].totalBudget,
            projects[projectId].finalEstimate
        );
    }

    // Get contractor bid (only viewable by contractor and homeowner)
    function getContractorBid(uint256 projectId, address contractor) external returns (
        euint64 bidAmount,
        euint32 timeEstimate,
        bool isSubmitted,
        uint256 timestamp
    ) {
        require(
            msg.sender == contractor || msg.sender == projects[projectId].homeowner,
            "Not authorized to view bid"
        );

        ContractorBid storage bid = bids[projectId][contractor];

        if (bid.isSubmitted) {
            return (
                bid.bidAmount,
                bid.timeEstimate,
                bid.isSubmitted,
                bid.timestamp
            );
        } else {
            // Return zero encrypted values for non-existent bids
            return (
                FHE.asEuint64(0),
                FHE.asEuint32(0),
                false,
                0
            );
        }
    }

    // Get all contractors who bid on a project
    function getProjectContractors(uint256 projectId) external view returns (address[] memory) {
        return projectContractors[projectId];
    }

    // Request decryption for final budget reveal (async)
    function requestBudgetDecryption(uint256 projectId) external onlyProjectOwner(projectId) {
        require(projects[projectId].isCalculated, "Project not calculated");

        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(projects[projectId].finalEstimate);
        FHE.requestDecryption(cts, this.processBudgetReveal.selector);
    }

    // Process budget decryption callback
    function processBudgetReveal(
        uint256 requestId,
        uint64 decryptedBudget,
        bytes[] memory signatures
    ) external {
        // Note: Signature verification skipped for this demo version
        // In production, implement proper signature verification
        // FHE.checkSignatures(requestId, signatures, additionalData);

        // Budget is now revealed - emit event or store if needed
        // Implementation depends on specific requirements
    }

}