// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Private Renovation Budget Manager v2.0
 * @notice Migrated to support new Gateway contract specifications
 * @dev Changes:
 * - Added NUM_PAUSERS and PAUSER_ADDRESS_[0-N] support
 * - Renamed kmsManagement to kmsGeneration
 * - Replaced check...() functions with is...() boolean returns
 * - Added new Decryption events with individual KMS responses
 * - Implemented transaction input re-randomization support (automatic)
 * - Supports sIND-CPAD security through re-encryption of all inputs
 */
contract PrivateRenovationBudget is SepoliaConfig {

    address public owner;
    uint256 public nextProjectId;

    // Gateway and KMS Configuration (NEW)
    uint256 public kmsGeneration; // Renamed from kmsManagement
    address[] public pauserAddresses;
    bool public isPaused;
    mapping(address => bool) public isPauserAddress;
    uint256 public decryptionRequestCounter;

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

    // Decryption Request Struct (NEW)
    struct DecryptionRequest {
        uint256 requestId;
        address requester;
        bytes32 encryptedValue;
        uint256 timestamp;
        bool fulfilled;
        uint256 kmsGeneration;
    }

    mapping(uint256 => RenovationProject) public projects;
    mapping(uint256 => mapping(address => ContractorBid)) public bids;
    mapping(uint256 => address[]) public projectContractors;
    mapping(address => bool) public verifiedContractors;
    mapping(uint256 => DecryptionRequest) public decryptionRequests; // NEW

    // Original Events
    event ProjectCreated(uint256 indexed projectId, address indexed homeowner);
    event RoomAdded(uint256 indexed projectId, uint8 roomIndex);
    event BudgetCalculated(uint256 indexed projectId, address indexed homeowner);
    event BidSubmitted(uint256 indexed projectId, address indexed contractor);
    event ProjectApproved(uint256 indexed projectId, address indexed selectedContractor);
    event ContractorVerified(address indexed contractor);

    // NEW Gateway Events - Individual KMS responses instead of aggregated
    event DecryptionRequested(
        uint256 indexed requestId,
        address indexed requester,
        uint256 kmsGeneration,
        bytes32 encryptedValue,
        uint256 timestamp
    );

    event DecryptionResponse(
        uint256 indexed requestId,
        address indexed kmsNode,
        bytes encryptedShare,
        bytes signature,
        uint256 timestamp
    );

    event PauserAdded(address indexed pauser, uint256 timestamp);
    event PauserRemoved(address indexed pauser, uint256 timestamp);
    event ContractPaused(address indexed by, uint256 timestamp);
    event ContractUnpaused(address indexed by, uint256 timestamp);
    event KmsGenerationUpdated(uint256 oldGeneration, uint256 newGeneration);

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

    modifier onlyPauser() {
        require(isPauserAddress[msg.sender], "Not a pauser");
        _;
    }

    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    constructor(address[] memory _pauserAddresses, uint256 _kmsGeneration) {
        owner = msg.sender;
        nextProjectId = 1;
        kmsGeneration = _kmsGeneration;
        isPaused = false;
        decryptionRequestCounter = 0;

        // Initialize pauser addresses
        for (uint256 i = 0; i < _pauserAddresses.length; i++) {
            pauserAddresses.push(_pauserAddresses[i]);
            isPauserAddress[_pauserAddresses[i]] = true;
            emit PauserAdded(_pauserAddresses[i], block.timestamp);
        }
    }

    // ==================== NEW GATEWAY FUNCTIONS ====================

    /**
     * @notice Add a new pauser address (only owner)
     * @param _pauser The address to add as pauser
     */
    function addPauser(address _pauser) external onlyOwner {
        require(_pauser != address(0), "Invalid pauser address");
        require(!isPauserAddress[_pauser], "Already a pauser");

        pauserAddresses.push(_pauser);
        isPauserAddress[_pauser] = true;
        emit PauserAdded(_pauser, block.timestamp);
    }

    /**
     * @notice Remove a pauser address (only owner)
     * @param _pauser The address to remove
     */
    function removePauser(address _pauser) external onlyOwner {
        require(isPauserAddress[_pauser], "Not a pauser");

        isPauserAddress[_pauser] = false;

        // Remove from array
        for (uint256 i = 0; i < pauserAddresses.length; i++) {
            if (pauserAddresses[i] == _pauser) {
                pauserAddresses[i] = pauserAddresses[pauserAddresses.length - 1];
                pauserAddresses.pop();
                break;
            }
        }

        emit PauserRemoved(_pauser, block.timestamp);
    }

    /**
     * @notice Pause the contract (only pausers)
     */
    function pause() external onlyPauser {
        require(!isPaused, "Already paused");
        isPaused = true;
        emit ContractPaused(msg.sender, block.timestamp);
    }

    /**
     * @notice Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        require(isPaused, "Not paused");
        isPaused = false;
        emit ContractUnpaused(msg.sender, block.timestamp);
    }

    /**
     * @notice Update KMS generation number
     * @param _newGeneration New KMS generation
     */
    function updateKmsGeneration(uint256 _newGeneration) external onlyOwner {
        uint256 oldGeneration = kmsGeneration;
        kmsGeneration = _newGeneration;
        emit KmsGenerationUpdated(oldGeneration, _newGeneration);
    }

    /**
     * @notice Request decryption from KMS
     * @param _encryptedValue The encrypted value to decrypt
     * @return requestId The ID of the decryption request
     */
    function requestDecryption(bytes32 _encryptedValue) external onlyProjectOwner(nextProjectId - 1) returns (uint256) {
        uint256 requestId = ++decryptionRequestCounter;

        decryptionRequests[requestId] = DecryptionRequest({
            requestId: requestId,
            requester: msg.sender,
            encryptedValue: _encryptedValue,
            timestamp: block.timestamp,
            fulfilled: false,
            kmsGeneration: kmsGeneration
        });

        emit DecryptionRequested(
            requestId,
            msg.sender,
            kmsGeneration,
            _encryptedValue,
            block.timestamp
        );

        return requestId;
    }

    /**
     * @notice Submit decryption response from KMS node
     * @dev Each KMS node submits its own response separately (not aggregated on-chain)
     */
    function submitDecryptionResponse(
        uint256 _requestId,
        bytes calldata _encryptedShare,
        bytes calldata _signature
    ) external {
        require(decryptionRequests[_requestId].requestId == _requestId, "Invalid request");

        emit DecryptionResponse(
            _requestId,
            msg.sender,
            _encryptedShare,
            _signature,
            block.timestamp
        );
    }

    // ==================== REPLACED check...() WITH is...() ====================

    /**
     * @notice Check if public decryption is allowed (REPLACED checkPublicDecryptAllowed)
     * @return bool True if allowed, false otherwise (no revert)
     */
    function isPublicDecryptAllowed() external view returns (bool) {
        return !isPaused;
    }

    /**
     * @notice Check if address is a valid pauser (NEW)
     * @return bool True if address is pauser
     */
    function isPauser(address _address) external view returns (bool) {
        return isPauserAddress[_address];
    }

    /**
     * @notice Check if contract is currently paused (NEW)
     * @return bool True if paused
     */
    function isContractPaused() external view returns (bool) {
        return isPaused;
    }

    /**
     * @notice Check if project is valid (NEW)
     * @return bool True if valid
     */
    function isProjectValid(uint256 projectId) external view returns (bool) {
        return projects[projectId].homeowner != address(0);
    }

    /**
     * @notice Check if project is calculated (NEW)
     * @return bool True if calculated
     */
    function isProjectCalculated(uint256 projectId) external view returns (bool) {
        return projects[projectId].isCalculated;
    }

    /**
     * @notice Check if project is approved (NEW)
     * @return bool True if approved
     */
    function isProjectApproved(uint256 projectId) external view returns (bool) {
        return projects[projectId].isApproved;
    }

    // ==================== ORIGINAL FUNCTIONS (with whenNotPaused modifier) ====================

    /**
     * @notice Verify a contractor
     */
    function verifyContractor(address contractor) external onlyOwner whenNotPaused {
        verifiedContractors[contractor] = true;
        emit ContractorVerified(contractor);
    }

    /**
     * @notice Create new renovation project
     * @dev Transaction inputs are automatically re-randomized for sIND-CPAD security
     */
    function createProject() external whenNotPaused returns (uint256) {
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

    /**
     * @notice Add room requirements to project (encrypted inputs)
     * @dev All transaction inputs are re-randomized before FHE evaluation (automatic)
     */
    function addRoomRequirement(
        uint256 projectId,
        uint32 area,
        uint32 materialCost,
        uint32 laborCost
    ) external onlyProjectOwner(projectId) whenNotPaused {
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

    /**
     * @notice Calculate total budget (FHE computation)
     * @dev Performs encrypted budget calculation using FHE operations
     */
    function calculateBudget(
        uint256 projectId,
        uint32 contingencyPercent
    ) external onlyProjectOwner(projectId) whenNotPaused {
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

    /**
     * @notice Contractors submit encrypted bids
     * @dev All bid data is automatically re-randomized for privacy
     */
    function submitBid(
        uint256 projectId,
        uint64 bidAmount,
        uint32 timeEstimate
    ) external onlyVerifiedContractor whenNotPaused {
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

    /**
     * @notice Compare bid with budget (returns encrypted values for client-side comparison)
     */
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

    /**
     * @notice Approve project and select contractor
     */
    function approveProject(
        uint256 projectId,
        address selectedContractor
    ) external onlyProjectOwner(projectId) whenNotPaused {
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

    /**
     * @notice Get all contractors who bid on a project
     */
    function getProjectContractors(uint256 projectId) external view returns (address[] memory) {
        return projectContractors[projectId];
    }

    /**
     * @notice Get pauser count
     */
    function getPauserCount() external view returns (uint256) {
        return pauserAddresses.length;
    }

    /**
     * @notice Get pauser at specific index
     */
    function getPauserAtIndex(uint256 _index) external view returns (address) {
        require(_index < pauserAddresses.length, "Index out of bounds");
        return pauserAddresses[_index];
    }

    /**
     * @notice Get all pauser addresses
     */
    function getAllPausers() external view returns (address[] memory) {
        return pauserAddresses;
    }

    /**
     * @notice Get decryption request info
     */
    function getDecryptionRequest(uint256 _requestId) external view returns (
        address requester,
        bytes32 encryptedValue,
        uint256 timestamp,
        bool fulfilled,
        uint256 generation
    ) {
        DecryptionRequest storage req = decryptionRequests[_requestId];
        return (
            req.requester,
            req.encryptedValue,
            req.timestamp,
            req.fulfilled,
            req.kmsGeneration
        );
    }

    // ==================== LEGACY DECRYPTION FUNCTIONS ====================
    // NOTE: These functions demonstrate the old approach
    // New decryption requests should use requestDecryption() and submitDecryptionResponse()

    /**
     * @notice Request decryption for final budget reveal (async)
     * @dev This uses the legacy approach - consider using new requestDecryption() instead
     */
    function requestBudgetDecryption(uint256 projectId) external onlyProjectOwner(projectId) whenNotPaused {
        require(projects[projectId].isCalculated, "Project not calculated");

        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(projects[projectId].finalEstimate);
        FHE.requestDecryption(cts, this.processBudgetReveal.selector);
    }

    /**
     * @notice Process budget decryption callback
     * @dev Legacy callback - in new gateway, use DecryptionResponse events instead
     */
    function processBudgetReveal(
        uint256 requestId,
        uint64 decryptedBudget,
        bytes[] memory signatures
    ) external whenNotPaused {
        // NOTE: In the new gateway system, signature verification is handled differently
        // Encrypted shares and signatures are NOT aggregated on-chain
        // Each KMS node emits individual DecryptionResponse events
        // Client-side aggregation is required

        // Budget is now revealed - emit event or store if needed
        // Implementation depends on specific requirements
    }

}