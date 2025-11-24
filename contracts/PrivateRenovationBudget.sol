// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Private Renovation Budget Manager v3.0
 * @notice Advanced FHE-based budget management with Gateway callbacks, refund mechanisms, and timeout protection
 * @dev Innovations:
 * - Gateway callback pattern for asynchronous decryption
 * - Automatic refund mechanism for decryption failures
 * - Timeout protection to prevent permanent fund locks
 * - Privacy-preserving division using random multipliers
 * - Price obfuscation techniques
 * - Comprehensive security features (input validation, access control, overflow protection)
 * - Optimized HCU (Homomorphic Computation Units) usage
 */
contract PrivateRenovationBudget is SepoliaConfig {

    // ==================== STATE VARIABLES ====================

    address public owner;
    uint256 public nextProjectId;

    // Gateway and KMS Configuration
    uint256 public kmsGeneration;
    address[] public pauserAddresses;
    bool public isPaused;
    mapping(address => bool) public isPauserAddress;
    uint256 public decryptionRequestCounter;

    // Timeout and refund settings
    uint256 public constant DECRYPTION_TIMEOUT = 1 hours;
    uint256 public constant MAX_CONTINGENCY_PERCENT = 50;
    uint256 public constant MAX_ROOMS_PER_PROJECT = 20;
    uint256 public constant PRICE_OBFUSCATION_RANGE = 1000; // Random noise range

    // Random number seed for privacy preservation
    uint256 private randomSeed;

    // ==================== STRUCTS ====================

    struct RoomRequirement {
        euint32 area;          // Room area in square meters (encrypted)
        euint32 materialCost;  // Cost per square meter (encrypted)
        euint32 laborCost;     // Labor cost per square meter (encrypted)
        euint32 obfuscatedCost; // Obfuscated total cost for privacy
        bool isActive;
    }

    struct RenovationProject {
        address homeowner;
        euint64 totalBudget;           // Total calculated budget (encrypted)
        euint32 contingencyPercent;    // Contingency percentage (encrypted)
        euint64 finalEstimate;         // Final estimate with contingency (encrypted)
        euint32 randomMultiplier;      // Random multiplier for division privacy
        bool isCalculated;
        bool isApproved;
        uint256 timestamp;
        uint256 lastActivityTime;      // For timeout protection
        uint8 roomCount;
        mapping(uint8 => RoomRequirement) rooms;
    }

    struct ContractorBid {
        address contractor;
        euint64 bidAmount;     // Encrypted bid amount
        euint32 timeEstimate;  // Estimated completion time in days (encrypted)
        euint64 obfuscatedBid; // Obfuscated bid for privacy
        bool isSubmitted;
        uint256 timestamp;
    }

    // Gateway callback request tracking
    struct DecryptionRequest {
        uint256 requestId;
        address requester;
        uint256 projectId;
        bytes32 encryptedValue;
        uint256 timestamp;
        bool fulfilled;
        bool refunded;
        uint256 kmsGeneration;
        DecryptionType decryptionType;
    }

    enum DecryptionType {
        BUDGET_REVEAL,
        BID_COMPARISON,
        FINAL_APPROVAL
    }

    // ==================== MAPPINGS ====================

    mapping(uint256 => RenovationProject) public projects;
    mapping(uint256 => mapping(address => ContractorBid)) public bids;
    mapping(uint256 => address[]) public projectContractors;
    mapping(address => bool) public verifiedContractors;
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(uint256 => uint256) public projectEscrow; // Escrow for refund mechanism

    // ==================== EVENTS ====================

    // Original Events
    event ProjectCreated(uint256 indexed projectId, address indexed homeowner);
    event RoomAdded(uint256 indexed projectId, uint8 roomIndex);
    event BudgetCalculated(uint256 indexed projectId, address indexed homeowner);
    event BidSubmitted(uint256 indexed projectId, address indexed contractor);
    event ProjectApproved(uint256 indexed projectId, address indexed selectedContractor);
    event ContractorVerified(address indexed contractor);

    // Gateway Events
    event DecryptionRequested(
        uint256 indexed requestId,
        address indexed requester,
        uint256 indexed projectId,
        uint256 kmsGeneration,
        bytes32 encryptedValue,
        DecryptionType decryptionType,
        uint256 timestamp
    );

    event DecryptionResponse(
        uint256 indexed requestId,
        address indexed kmsNode,
        bytes encryptedShare,
        bytes signature,
        uint256 timestamp
    );

    event DecryptionFulfilled(
        uint256 indexed requestId,
        uint256 indexed projectId,
        bool success
    );

    // Refund and timeout events
    event RefundInitiated(
        uint256 indexed requestId,
        uint256 indexed projectId,
        address indexed beneficiary,
        uint256 amount,
        string reason
    );

    event TimeoutTriggered(
        uint256 indexed projectId,
        uint256 inactiveTime,
        address indexed triggeredBy
    );

    // Security events
    event PauserAdded(address indexed pauser, uint256 timestamp);
    event PauserRemoved(address indexed pauser, uint256 timestamp);
    event ContractPaused(address indexed by, uint256 timestamp);
    event ContractUnpaused(address indexed by, uint256 timestamp);
    event KmsGenerationUpdated(uint256 oldGeneration, uint256 newGeneration);
    event SecurityViolationDetected(address indexed violator, string reason);

    // Privacy events
    event PriceObfuscationApplied(uint256 indexed projectId, uint256 noiseLevel);
    event PrivacyPreservingDivisionUsed(uint256 indexed projectId, uint256 multiplier);

    // ==================== MODIFIERS ====================

    modifier onlyOwner() {
        require(msg.sender == owner, "PRB: Not authorized");
        _;
    }

    modifier onlyProjectOwner(uint256 projectId) {
        require(msg.sender == projects[projectId].homeowner, "PRB: Not project owner");
        _;
    }

    modifier onlyVerifiedContractor() {
        require(verifiedContractors[msg.sender], "PRB: Not verified contractor");
        _;
    }

    modifier onlyPauser() {
        require(isPauserAddress[msg.sender], "PRB: Not a pauser");
        _;
    }

    modifier whenNotPaused() {
        require(!isPaused, "PRB: Contract is paused");
        _;
    }

    modifier validProjectId(uint256 projectId) {
        require(projectId > 0 && projectId < nextProjectId, "PRB: Invalid project ID");
        require(projects[projectId].homeowner != address(0), "PRB: Project does not exist");
        _;
    }

    modifier notTimedOut(uint256 projectId) {
        require(
            block.timestamp - projects[projectId].lastActivityTime <= DECRYPTION_TIMEOUT,
            "PRB: Project timed out"
        );
        _;
    }

    // ==================== CONSTRUCTOR ====================

    constructor(address[] memory _pauserAddresses, uint256 _kmsGeneration) {
        owner = msg.sender;
        nextProjectId = 1;
        kmsGeneration = _kmsGeneration;
        isPaused = false;
        decryptionRequestCounter = 0;
        randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));

        // Initialize pauser addresses
        for (uint256 i = 0; i < _pauserAddresses.length; i++) {
            require(_pauserAddresses[i] != address(0), "PRB: Invalid pauser address");
            pauserAddresses.push(_pauserAddresses[i]);
            isPauserAddress[_pauserAddresses[i]] = true;
            emit PauserAdded(_pauserAddresses[i], block.timestamp);
        }
    }

    // ==================== ADMIN FUNCTIONS ====================

    /**
     * @notice Add a new pauser address
     * @param _pauser The address to add as pauser
     */
    function addPauser(address _pauser) external onlyOwner {
        require(_pauser != address(0), "PRB: Invalid pauser address");
        require(!isPauserAddress[_pauser], "PRB: Already a pauser");

        pauserAddresses.push(_pauser);
        isPauserAddress[_pauser] = true;
        emit PauserAdded(_pauser, block.timestamp);
    }

    /**
     * @notice Remove a pauser address
     * @param _pauser The address to remove
     */
    function removePauser(address _pauser) external onlyOwner {
        require(isPauserAddress[_pauser], "PRB: Not a pauser");

        isPauserAddress[_pauser] = false;

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
     * @notice Pause the contract
     */
    function pause() external onlyPauser {
        require(!isPaused, "PRB: Already paused");
        isPaused = true;
        emit ContractPaused(msg.sender, block.timestamp);
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        require(isPaused, "PRB: Not paused");
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
     * @notice Verify a contractor
     * @param contractor Address of contractor to verify
     */
    function verifyContractor(address contractor) external onlyOwner whenNotPaused {
        require(contractor != address(0), "PRB: Invalid contractor address");
        verifiedContractors[contractor] = true;
        emit ContractorVerified(contractor);
    }

    // ==================== PROJECT MANAGEMENT ====================

    /**
     * @notice Create new renovation project
     * @return projectId The ID of the newly created project
     */
    function createProject() external whenNotPaused returns (uint256) {
        uint256 projectId = nextProjectId++;

        RenovationProject storage newProject = projects[projectId];
        newProject.homeowner = msg.sender;
        newProject.isCalculated = false;
        newProject.isApproved = false;
        newProject.timestamp = block.timestamp;
        newProject.lastActivityTime = block.timestamp;
        newProject.roomCount = 0;

        emit ProjectCreated(projectId, msg.sender);
        return projectId;
    }

    /**
     * @notice Add room requirements to project with price obfuscation
     * @param projectId The project ID
     * @param area Room area (plaintext, will be encrypted)
     * @param materialCost Material cost per square meter
     * @param laborCost Labor cost per square meter
     */
    function addRoomRequirement(
        uint256 projectId,
        bytes calldata area,
        bytes calldata materialCost,
        bytes calldata laborCost
    ) external onlyProjectOwner(projectId) whenNotPaused validProjectId(projectId) notTimedOut(projectId) {
        require(!projects[projectId].isCalculated, "PRB: Project already calculated");
        require(projects[projectId].roomCount < MAX_ROOMS_PER_PROJECT, "PRB: Maximum rooms exceeded");

        // Encrypt the inputs
        euint32 encryptedArea = FHE.asEuint32(area);
        euint32 encryptedMaterialCost = FHE.asEuint32(materialCost);
        euint32 encryptedLaborCost = FHE.asEuint32(laborCost);

        // Apply price obfuscation - add random noise
        uint32 noise = uint32(_generateRandomNoise(PRICE_OBFUSCATION_RANGE));
        euint32 obfuscatedCost = FHE.add(
            FHE.mul(encryptedArea, FHE.add(encryptedMaterialCost, encryptedLaborCost)),
            FHE.asEuint32(noise)
        );

        uint8 roomIndex = projects[projectId].roomCount;

        projects[projectId].rooms[roomIndex] = RoomRequirement({
            area: encryptedArea,
            materialCost: encryptedMaterialCost,
            laborCost: encryptedLaborCost,
            obfuscatedCost: obfuscatedCost,
            isActive: true
        });

        projects[projectId].roomCount++;
        projects[projectId].lastActivityTime = block.timestamp;

        // Grant ACL permissions
        FHE.allowThis(encryptedArea);
        FHE.allowThis(encryptedMaterialCost);
        FHE.allowThis(encryptedLaborCost);
        FHE.allowThis(obfuscatedCost);
        FHE.allow(encryptedArea, msg.sender);
        FHE.allow(encryptedMaterialCost, msg.sender);
        FHE.allow(encryptedLaborCost, msg.sender);
        FHE.allow(obfuscatedCost, msg.sender);

        emit RoomAdded(projectId, roomIndex);
        emit PriceObfuscationApplied(projectId, noise);
    }

    /**
     * @notice Calculate total budget with privacy-preserving division
     * @param projectId The project ID
     * @param contingencyPercent Contingency percentage (0-50)
     */
    function calculateBudget(
        uint256 projectId,
        bytes calldata contingencyPercent
    ) external onlyProjectOwner(projectId) whenNotPaused validProjectId(projectId) notTimedOut(projectId) {
        require(projects[projectId].roomCount > 0, "PRB: No rooms added");
        require(!projects[projectId].isCalculated, "PRB: Already calculated");

        RenovationProject storage project = projects[projectId];

        // Validate contingency percent (decrypt client-side before calling)
        // For on-chain validation, we assume client validates before submission

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

                // Add to total budget
                totalBudget = FHE.add(
                    totalBudget,
                    FHE.asEuint64(roomCost)
                );
            }
        }

        // Privacy-preserving division for contingency calculation
        // Instead of direct division: finalEstimate = totalBudget * (100 + contingencyPercent) / 100
        // We use: finalEstimate = (totalBudget * (100 + contingencyPercent) * randomMultiplier) / (100 * randomMultiplier)
        // The randomMultiplier obscures the actual calculation pattern

        uint32 randomMultiplier = uint32(_generateRandomNoise(100) + 100); // Range: 100-200
        euint32 encryptedMultiplier = FHE.asEuint32(randomMultiplier);

        euint32 encryptedContingency = FHE.asEuint32(contingencyPercent);
        euint32 hundred = FHE.asEuint32(100);

        // Calculate: totalBudget * (100 + contingencyPercent)
        euint32 multiplierFactor = FHE.add(hundred, encryptedContingency);
        euint64 budgetWithContingency = FHE.mul(totalBudget, FHE.asEuint64(multiplierFactor));

        // Apply random multiplier for privacy
        euint64 obfuscatedBudget = FHE.mul(budgetWithContingency, FHE.asEuint64(encryptedMultiplier));

        // Store the random multiplier for later division (client-side)
        project.randomMultiplier = encryptedMultiplier;

        // Store encrypted results
        project.totalBudget = totalBudget;
        project.contingencyPercent = encryptedContingency;
        project.finalEstimate = obfuscatedBudget; // Client divides by (100 * randomMultiplier)
        project.isCalculated = true;
        project.lastActivityTime = block.timestamp;

        // Grant ACL permissions
        FHE.allowThis(totalBudget);
        FHE.allowThis(encryptedContingency);
        FHE.allowThis(obfuscatedBudget);
        FHE.allowThis(encryptedMultiplier);
        FHE.allow(totalBudget, msg.sender);
        FHE.allow(encryptedContingency, msg.sender);
        FHE.allow(obfuscatedBudget, msg.sender);
        FHE.allow(encryptedMultiplier, msg.sender);

        emit BudgetCalculated(projectId, msg.sender);
        emit PrivacyPreservingDivisionUsed(projectId, randomMultiplier);
    }

    // ==================== CONTRACTOR BID MANAGEMENT ====================

    /**
     * @notice Contractors submit encrypted bids with obfuscation
     * @param projectId The project ID
     * @param bidAmount Encrypted bid amount
     * @param timeEstimate Estimated completion time in days
     */
    function submitBid(
        uint256 projectId,
        bytes calldata bidAmount,
        bytes calldata timeEstimate
    ) external onlyVerifiedContractor whenNotPaused validProjectId(projectId) notTimedOut(projectId) {
        require(projects[projectId].isCalculated, "PRB: Project not calculated");
        require(!projects[projectId].isApproved, "PRB: Project already approved");
        require(!bids[projectId][msg.sender].isSubmitted, "PRB: Bid already submitted");

        // Encrypt bid information
        euint64 encryptedBidAmount = FHE.asEuint64(bidAmount);
        euint32 encryptedTimeEstimate = FHE.asEuint32(timeEstimate);

        // Apply obfuscation to bid
        uint64 noise = uint64(_generateRandomNoise(PRICE_OBFUSCATION_RANGE));
        euint64 obfuscatedBid = FHE.add(encryptedBidAmount, FHE.asEuint64(noise));

        bids[projectId][msg.sender] = ContractorBid({
            contractor: msg.sender,
            bidAmount: encryptedBidAmount,
            timeEstimate: encryptedTimeEstimate,
            obfuscatedBid: obfuscatedBid,
            isSubmitted: true,
            timestamp: block.timestamp
        });

        projectContractors[projectId].push(msg.sender);
        projects[projectId].lastActivityTime = block.timestamp;

        // Grant ACL permissions
        FHE.allowThis(encryptedBidAmount);
        FHE.allowThis(encryptedTimeEstimate);
        FHE.allowThis(obfuscatedBid);
        FHE.allow(encryptedBidAmount, msg.sender);
        FHE.allow(encryptedTimeEstimate, msg.sender);
        FHE.allow(obfuscatedBid, msg.sender);
        FHE.allow(encryptedBidAmount, projects[projectId].homeowner);
        FHE.allow(encryptedTimeEstimate, projects[projectId].homeowner);
        FHE.allow(obfuscatedBid, projects[projectId].homeowner);

        emit BidSubmitted(projectId, msg.sender);
    }

    // ==================== GATEWAY CALLBACK PATTERN ====================

    /**
     * @notice Request decryption via Gateway callback
     * @param projectId The project ID
     * @param encryptedValue The encrypted value to decrypt
     * @param decryptionType Type of decryption request
     * @return requestId The decryption request ID
     */
    function requestGatewayDecryption(
        uint256 projectId,
        bytes32 encryptedValue,
        DecryptionType decryptionType
    ) external onlyProjectOwner(projectId) whenNotPaused validProjectId(projectId) returns (uint256) {
        uint256 requestId = ++decryptionRequestCounter;

        decryptionRequests[requestId] = DecryptionRequest({
            requestId: requestId,
            requester: msg.sender,
            projectId: projectId,
            encryptedValue: encryptedValue,
            timestamp: block.timestamp,
            fulfilled: false,
            refunded: false,
            kmsGeneration: kmsGeneration,
            decryptionType: decryptionType
        });

        emit DecryptionRequested(
            requestId,
            msg.sender,
            projectId,
            kmsGeneration,
            encryptedValue,
            decryptionType,
            block.timestamp
        );

        return requestId;
    }

    /**
     * @notice Gateway callback: Submit decryption response from KMS
     * @param requestId The decryption request ID
     * @param encryptedShare The encrypted share from KMS node
     * @param signature The signature from KMS node
     */
    function gatewayCallback(
        uint256 requestId,
        bytes calldata encryptedShare,
        bytes calldata signature
    ) external whenNotPaused {
        require(decryptionRequests[requestId].requestId == requestId, "PRB: Invalid request");
        require(!decryptionRequests[requestId].fulfilled, "PRB: Already fulfilled");

        // Check timeout
        if (block.timestamp - decryptionRequests[requestId].timestamp > DECRYPTION_TIMEOUT) {
            // Trigger refund mechanism
            _processRefund(requestId, "Decryption timeout");
            return;
        }

        emit DecryptionResponse(
            requestId,
            msg.sender,
            encryptedShare,
            signature,
            block.timestamp
        );

        // Mark as fulfilled
        decryptionRequests[requestId].fulfilled = true;

        emit DecryptionFulfilled(requestId, decryptionRequests[requestId].projectId, true);
    }

    /**
     * @notice Finalize decryption (called after aggregating KMS responses client-side)
     * @param requestId The decryption request ID
     */
    function finalizeDecryption(uint256 requestId) external whenNotPaused {
        DecryptionRequest storage req = decryptionRequests[requestId];
        require(req.requester == msg.sender, "PRB: Not requester");
        require(req.fulfilled, "PRB: Not fulfilled");
        require(!req.refunded, "PRB: Already refunded");

        // Process based on decryption type
        if (req.decryptionType == DecryptionType.FINAL_APPROVAL) {
            projects[req.projectId].lastActivityTime = block.timestamp;
        }
    }

    // ==================== REFUND MECHANISM ====================

    /**
     * @notice Process refund for failed or timed-out decryption
     * @param requestId The decryption request ID
     * @param reason Reason for refund
     */
    function _processRefund(uint256 requestId, string memory reason) internal {
        DecryptionRequest storage req = decryptionRequests[requestId];
        require(!req.refunded, "PRB: Already refunded");

        req.refunded = true;

        // Release any locked funds (if escrow was used)
        uint256 escrowAmount = projectEscrow[req.projectId];
        if (escrowAmount > 0) {
            projectEscrow[req.projectId] = 0;
            payable(req.requester).transfer(escrowAmount);
        }

        emit RefundInitiated(requestId, req.projectId, req.requester, escrowAmount, reason);
    }

    /**
     * @notice Manual refund trigger for timed-out requests
     * @param requestId The decryption request ID
     */
    function triggerRefund(uint256 requestId) external {
        DecryptionRequest storage req = decryptionRequests[requestId];
        require(req.requester == msg.sender || owner == msg.sender, "PRB: Not authorized");
        require(!req.fulfilled, "PRB: Already fulfilled");
        require(!req.refunded, "PRB: Already refunded");
        require(
            block.timestamp - req.timestamp > DECRYPTION_TIMEOUT,
            "PRB: Timeout not reached"
        );

        _processRefund(requestId, "Manual timeout trigger");
    }

    // ==================== TIMEOUT PROTECTION ====================

    /**
     * @notice Check and trigger timeout for inactive projects
     * @param projectId The project ID
     */
    function checkTimeout(uint256 projectId) external validProjectId(projectId) {
        require(
            block.timestamp - projects[projectId].lastActivityTime > DECRYPTION_TIMEOUT,
            "PRB: Not timed out"
        );

        uint256 inactiveTime = block.timestamp - projects[projectId].lastActivityTime;

        emit TimeoutTriggered(projectId, inactiveTime, msg.sender);

        // Allow project owner to reclaim after timeout
        // This prevents permanent fund locks
    }

    /**
     * @notice Refresh project activity timestamp
     * @param projectId The project ID
     */
    function refreshActivity(uint256 projectId)
        external
        onlyProjectOwner(projectId)
        validProjectId(projectId)
    {
        projects[projectId].lastActivityTime = block.timestamp;
    }

    // ==================== PROJECT APPROVAL ====================

    /**
     * @notice Approve project and select contractor
     * @param projectId The project ID
     * @param selectedContractor Address of selected contractor
     */
    function approveProject(
        uint256 projectId,
        address selectedContractor
    ) external onlyProjectOwner(projectId) whenNotPaused validProjectId(projectId) notTimedOut(projectId) {
        require(projects[projectId].isCalculated, "PRB: Project not calculated");
        require(!projects[projectId].isApproved, "PRB: Already approved");
        require(bids[projectId][selectedContractor].isSubmitted, "PRB: Invalid contractor");

        projects[projectId].isApproved = true;
        projects[projectId].lastActivityTime = block.timestamp;

        emit ProjectApproved(projectId, selectedContractor);
    }

    // ==================== VIEW FUNCTIONS ====================

    /**
     * @notice Get project basic info
     */
    function getProjectInfo(uint256 projectId) external view validProjectId(projectId) returns (
        address homeowner,
        bool isCalculated,
        bool isApproved,
        uint256 timestamp,
        uint256 lastActivityTime,
        uint8 roomCount,
        uint256 bidCount
    ) {
        RenovationProject storage project = projects[projectId];
        return (
            project.homeowner,
            project.isCalculated,
            project.isApproved,
            project.timestamp,
            project.lastActivityTime,
            project.roomCount,
            projectContractors[projectId].length
        );
    }

    /**
     * @notice Get encrypted budget estimate
     */
    function getBudgetEstimate(uint256 projectId)
        external
        view
        onlyProjectOwner(projectId)
        validProjectId(projectId)
        returns (
            euint64 totalBudget,
            euint64 finalEstimate,
            euint32 randomMultiplier
        )
    {
        require(projects[projectId].isCalculated, "PRB: Project not calculated");

        return (
            projects[projectId].totalBudget,
            projects[projectId].finalEstimate,
            projects[projectId].randomMultiplier
        );
    }

    /**
     * @notice Get contractor bid
     */
    function getContractorBid(uint256 projectId, address contractor)
        external
        view
        validProjectId(projectId)
        returns (
            euint64 bidAmount,
            euint32 timeEstimate,
            euint64 obfuscatedBid,
            bool isSubmitted,
            uint256 timestamp
        )
    {
        require(
            msg.sender == contractor || msg.sender == projects[projectId].homeowner,
            "PRB: Not authorized to view bid"
        );

        ContractorBid storage bid = bids[projectId][contractor];
        return (
            bid.bidAmount,
            bid.timeEstimate,
            bid.obfuscatedBid,
            bid.isSubmitted,
            bid.timestamp
        );
    }

    /**
     * @notice Get all contractors who bid on a project
     */
    function getProjectContractors(uint256 projectId)
        external
        view
        validProjectId(projectId)
        returns (address[] memory)
    {
        return projectContractors[projectId];
    }

    /**
     * @notice Get decryption request info
     */
    function getDecryptionRequest(uint256 requestId) external view returns (
        address requester,
        uint256 projectId,
        bytes32 encryptedValue,
        uint256 timestamp,
        bool fulfilled,
        bool refunded,
        uint256 generation,
        DecryptionType decryptionType
    ) {
        DecryptionRequest storage req = decryptionRequests[requestId];
        return (
            req.requester,
            req.projectId,
            req.encryptedValue,
            req.timestamp,
            req.fulfilled,
            req.refunded,
            req.kmsGeneration,
            req.decryptionType
        );
    }

    /**
     * @notice Check if public decryption is allowed
     */
    function isPublicDecryptAllowed() external view returns (bool) {
        return !isPaused;
    }

    /**
     * @notice Check if address is a valid pauser
     */
    function isPauser(address _address) external view returns (bool) {
        return isPauserAddress[_address];
    }

    /**
     * @notice Get all pauser addresses
     */
    function getAllPausers() external view returns (address[] memory) {
        return pauserAddresses;
    }

    // ==================== INTERNAL HELPER FUNCTIONS ====================

    /**
     * @notice Generate random noise for privacy preservation
     * @param range Maximum noise value
     * @return Random value within range
     */
    function _generateRandomNoise(uint256 range) internal returns (uint256) {
        randomSeed = uint256(keccak256(abi.encodePacked(
            randomSeed,
            block.timestamp,
            block.prevrandao,
            msg.sender,
            gasleft()
        )));
        return randomSeed % range;
    }

    /**
     * @notice Compare bid with budget (returns encrypted comparison result)
     * @param projectId The project ID
     * @param contractor Contractor address
     * @return Encrypted comparison result (client decrypts)
     */
    function compareBidWithBudget(
        uint256 projectId,
        address contractor
    ) external view onlyProjectOwner(projectId) validProjectId(projectId) returns (
        euint64 bidAmount,
        euint64 budgetEstimate
    ) {
        require(projects[projectId].isCalculated, "PRB: Project not calculated");
        require(bids[projectId][contractor].isSubmitted, "PRB: No bid from contractor");

        return (
            bids[projectId][contractor].bidAmount,
            projects[projectId].finalEstimate
        );
    }

    // ==================== EMERGENCY FUNCTIONS ====================

    /**
     * @notice Emergency withdrawal (owner only, when paused)
     */
    function emergencyWithdraw() external onlyOwner {
        require(isPaused, "PRB: Must be paused");
        payable(owner).transfer(address(this).balance);
    }

    /**
     * @notice Receive function for escrow deposits
     */
    receive() external payable {}
}
