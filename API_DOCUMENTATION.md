# API Documentation - Private Renovation Budget Manager v3.0

## Table of Contents

1. [Admin Functions](#admin-functions)
2. [Project Management](#project-management)
3. [Contractor Bidding](#contractor-bidding)
4. [Gateway Decryption](#gateway-decryption)
5. [Timeout & Refunds](#timeout--refunds)
6. [View Functions](#view-functions)
7. [Events](#events)
8. [Types & Enums](#types--enums)

---

## Admin Functions

### `addPauser(address _pauser)`

Add a new pauser address that can pause the contract.

**Access:** Owner only

**Parameters:**
- `_pauser`: Address to grant pauser role

**Events:** `PauserAdded(address indexed pauser, uint256 timestamp)`

**Example:**
```javascript
await contract.addPauser("0x1234...");
```

---

### `removePauser(address _pauser)`

Remove pauser role from an address.

**Access:** Owner only

**Parameters:**
- `_pauser`: Address to remove pauser role

**Events:** `PauserRemoved(address indexed pauser, uint256 timestamp)`

---

### `pause()`

Pause all contract operations.

**Access:** Pauser only

**Events:** `ContractPaused(address indexed by, uint256 timestamp)`

**Example:**
```javascript
await contract.pause();
```

---

### `unpause()`

Resume contract operations.

**Access:** Owner only

**Events:** `ContractUnpaused(address indexed by, uint256 timestamp)`

---

### `updateKmsGeneration(uint256 _newGeneration)`

Update the KMS generation number for decryption requests.

**Access:** Owner only

**Parameters:**
- `_newGeneration`: New KMS generation identifier

**Events:** `KmsGenerationUpdated(uint256 oldGeneration, uint256 newGeneration)`

---

### `verifyContractor(address contractor)`

Verify a contractor to allow them to submit bids.

**Access:** Owner only

**Parameters:**
- `contractor`: Address of contractor to verify

**Events:** `ContractorVerified(address indexed contractor)`

**Example:**
```javascript
await contract.verifyContractor("0xContractor...");
```

---

## Project Management

### `createProject()`

Create a new renovation project.

**Access:** Anyone (when not paused)

**Returns:** `uint256 projectId` - ID of created project

**Events:** `ProjectCreated(uint256 indexed projectId, address indexed homeowner)`

**Example:**
```javascript
const tx = await contract.createProject();
const receipt = await tx.wait();
const projectId = receipt.events[0].args.projectId;
```

---

### `addRoomRequirement(uint256 projectId, inEuint32 area, inEuint32 materialCost, inEuint32 laborCost)`

Add encrypted room requirements to a project.

**Access:** Project owner only

**Parameters:**
- `projectId`: The project ID
- `area`: Encrypted room area in square meters
- `materialCost`: Encrypted material cost per square meter
- `laborCost`: Encrypted labor cost per square meter

**Requirements:**
- Project not yet calculated
- Room count < MAX_ROOMS_PER_PROJECT (20)
- Project not timed out

**Events:**
- `RoomAdded(uint256 indexed projectId, uint8 roomIndex)`
- `PriceObfuscationApplied(uint256 indexed projectId, uint256 noiseLevel)`

**Example:**
```javascript
// Client-side encryption
const encryptedArea = await fhevm.encrypt32(50); // 50 sqm
const encryptedMaterialCost = await fhevm.encrypt32(100); // $100/sqm
const encryptedLaborCost = await fhevm.encrypt32(50); // $50/sqm

await contract.addRoomRequirement(
    projectId,
    encryptedArea,
    encryptedMaterialCost,
    encryptedLaborCost
);
```

---

### `calculateBudget(uint256 projectId, inEuint32 contingencyPercent)`

Calculate total project budget with privacy-preserving division.

**Access:** Project owner only

**Parameters:**
- `projectId`: The project ID
- `contingencyPercent`: Encrypted contingency percentage (0-50)

**Requirements:**
- At least one room added
- Project not yet calculated
- Project not timed out

**Events:**
- `BudgetCalculated(uint256 indexed projectId, address indexed homeowner)`
- `PrivacyPreservingDivisionUsed(uint256 indexed projectId, uint256 multiplier)`

**Example:**
```javascript
const encryptedContingency = await fhevm.encrypt32(10); // 10%
await contract.calculateBudget(projectId, encryptedContingency);
```

**Important:** The final estimate is obfuscated with a random multiplier. To get the actual value:
```javascript
const { finalEstimate, randomMultiplier } = await contract.getBudgetEstimate(projectId);
const decryptedEstimate = await fhevm.decrypt(finalEstimate);
const decryptedMultiplier = await fhevm.decrypt(randomMultiplier);
const actualEstimate = decryptedEstimate / (100 * decryptedMultiplier);
```

---

### `approveProject(uint256 projectId, address selectedContractor)`

Approve project and select winning contractor.

**Access:** Project owner only

**Parameters:**
- `projectId`: The project ID
- `selectedContractor`: Address of selected contractor

**Requirements:**
- Project calculated
- Not already approved
- Contractor submitted valid bid
- Project not timed out

**Events:** `ProjectApproved(uint256 indexed projectId, address indexed selectedContractor)`

**Example:**
```javascript
await contract.approveProject(projectId, winningContractorAddress);
```

---

## Contractor Bidding

### `submitBid(uint256 projectId, inEuint64 bidAmount, inEuint32 timeEstimate)`

Submit encrypted bid for a project.

**Access:** Verified contractors only

**Parameters:**
- `projectId`: The project ID
- `bidAmount`: Encrypted bid amount
- `timeEstimate`: Encrypted completion time in days

**Requirements:**
- Project calculated
- Project not approved
- Contractor not already submitted bid
- Project not timed out

**Events:** `BidSubmitted(uint256 indexed projectId, address indexed contractor)`

**Example:**
```javascript
const encryptedBid = await fhevm.encrypt64(50000); // $50,000
const encryptedTime = await fhevm.encrypt32(30); // 30 days

await contract.submitBid(projectId, encryptedBid, encryptedTime);
```

---

## Gateway Decryption

### `requestGatewayDecryption(uint256 projectId, bytes32 encryptedValue, DecryptionType decryptionType)`

Request decryption via Gateway callback pattern.

**Access:** Project owner only

**Parameters:**
- `projectId`: The project ID
- `encryptedValue`: The encrypted value to decrypt
- `decryptionType`: Type of decryption (BUDGET_REVEAL, BID_COMPARISON, FINAL_APPROVAL)

**Returns:** `uint256 requestId` - The decryption request ID

**Events:** `DecryptionRequested(...)`

**Example:**
```javascript
const budget = await contract.projects(projectId).finalEstimate;
const encryptedBytes = FHE.toBytes32(budget);

const tx = await contract.requestGatewayDecryption(
    projectId,
    encryptedBytes,
    0 // DecryptionType.BUDGET_REVEAL
);

const receipt = await tx.wait();
const requestId = receipt.events[0].args.requestId;
```

---

### `gatewayCallback(uint256 requestId, bytes encryptedShare, bytes signature)`

Gateway callback to submit KMS decryption response.

**Access:** Gateway service (anyone when not paused)

**Parameters:**
- `requestId`: The decryption request ID
- `encryptedShare`: Encrypted share from KMS node
- `signature`: Signature from KMS node

**Events:**
- `DecryptionResponse(...)`
- `DecryptionFulfilled(...)` OR
- `RefundInitiated(...)` (if timed out)

**Example (Gateway Service):**
```javascript
// Called by off-chain Gateway service
await contract.gatewayCallback(requestId, kmsShare, kmsSignature);
```

---

### `finalizeDecryption(uint256 requestId)`

Finalize decryption after client-side aggregation of KMS responses.

**Access:** Original requester only

**Parameters:**
- `requestId`: The decryption request ID

**Requirements:**
- Request fulfilled
- Not refunded

**Example:**
```javascript
// After aggregating all KMS responses client-side
await contract.finalizeDecryption(requestId);
```

---

## Timeout & Refunds

### `triggerRefund(uint256 requestId)`

Manually trigger refund for timed-out decryption request.

**Access:** Original requester or owner

**Parameters:**
- `requestId`: The decryption request ID

**Requirements:**
- Request not fulfilled
- Request not already refunded
- Timeout period elapsed (> DECRYPTION_TIMEOUT)

**Events:** `RefundInitiated(...)`

**Example:**
```javascript
// After 1 hour timeout
await contract.triggerRefund(requestId);
```

---

### `checkTimeout(uint256 projectId)`

Check and flag timed-out project.

**Access:** Anyone

**Parameters:**
- `projectId`: The project ID

**Requirements:**
- Project inactive for > DECRYPTION_TIMEOUT

**Events:** `TimeoutTriggered(uint256 indexed projectId, uint256 inactiveTime, address indexed triggeredBy)`

**Example:**
```javascript
await contract.checkTimeout(projectId);
```

---

### `refreshActivity(uint256 projectId)`

Refresh project activity timestamp to prevent timeout.

**Access:** Project owner only

**Parameters:**
- `projectId`: The project ID

**Example:**
```javascript
// Keep project alive
await contract.refreshActivity(projectId);
```

---

## View Functions

### `getProjectInfo(uint256 projectId)`

Get basic project information (non-encrypted).

**Returns:**
- `address homeowner`
- `bool isCalculated`
- `bool isApproved`
- `uint256 timestamp`
- `uint256 lastActivityTime`
- `uint8 roomCount`
- `uint256 bidCount`

**Example:**
```javascript
const info = await contract.getProjectInfo(projectId);
console.log(`Project owner: ${info.homeowner}`);
console.log(`Rooms: ${info.roomCount}`);
console.log(`Bids received: ${info.bidCount}`);
```

---

### `getBudgetEstimate(uint256 projectId)`

Get encrypted budget estimate (project owner only).

**Returns:**
- `euint64 totalBudget`
- `euint64 finalEstimate`
- `euint32 randomMultiplier`

**Example:**
```javascript
const { totalBudget, finalEstimate, randomMultiplier } =
    await contract.getBudgetEstimate(projectId);

// Decrypt client-side
const total = await fhevm.decrypt(totalBudget);
const estimate = await fhevm.decrypt(finalEstimate);
const multiplier = await fhevm.decrypt(randomMultiplier);

const actualEstimate = estimate / (100 * multiplier);
```

---

### `getContractorBid(uint256 projectId, address contractor)`

Get contractor bid details.

**Access:** Contractor or project owner only

**Returns:**
- `euint64 bidAmount`
- `euint32 timeEstimate`
- `euint64 obfuscatedBid`
- `bool isSubmitted`
- `uint256 timestamp`

**Example:**
```javascript
const bid = await contract.getContractorBid(projectId, contractorAddress);
const decryptedBid = await fhevm.decrypt(bid.bidAmount);
```

---

### `getProjectContractors(uint256 projectId)`

Get list of all contractors who bid on project.

**Returns:** `address[]` - Array of contractor addresses

**Example:**
```javascript
const contractors = await contract.getProjectContractors(projectId);
console.log(`${contractors.length} bids received`);
```

---

### `getDecryptionRequest(uint256 requestId)`

Get decryption request details.

**Returns:**
- `address requester`
- `uint256 projectId`
- `bytes32 encryptedValue`
- `uint256 timestamp`
- `bool fulfilled`
- `bool refunded`
- `uint256 generation`
- `DecryptionType decryptionType`

**Example:**
```javascript
const req = await contract.getDecryptionRequest(requestId);
console.log(`Fulfilled: ${req.fulfilled}`);
console.log(`Refunded: ${req.refunded}`);
```

---

### `isPublicDecryptAllowed()`

Check if public decryption is currently allowed.

**Returns:** `bool` - True if allowed (contract not paused)

---

### `isPauser(address _address)`

Check if address has pauser role.

**Returns:** `bool` - True if address is pauser

---

### `getAllPausers()`

Get all pauser addresses.

**Returns:** `address[]` - Array of pauser addresses

---

### `compareBidWithBudget(uint256 projectId, address contractor)`

Compare contractor bid with project budget (encrypted).

**Access:** Project owner only

**Returns:**
- `euint64 bidAmount`
- `euint64 budgetEstimate`

**Example:**
```javascript
const { bidAmount, budgetEstimate } =
    await contract.compareBidWithBudget(projectId, contractor);

const bid = await fhevm.decrypt(bidAmount);
const budget = await fhevm.decrypt(budgetEstimate);

if (bid <= budget) {
    console.log("Bid is within budget!");
}
```

---

## Emergency Functions

### `emergencyWithdraw()`

Withdraw all contract funds during emergency.

**Access:** Owner only, when contract is paused

**Example:**
```javascript
// Only when paused
await contract.emergencyWithdraw();
```

---

## Events

### Project Events

```solidity
event ProjectCreated(uint256 indexed projectId, address indexed homeowner);
event RoomAdded(uint256 indexed projectId, uint8 roomIndex);
event BudgetCalculated(uint256 indexed projectId, address indexed homeowner);
event ProjectApproved(uint256 indexed projectId, address indexed selectedContractor);
```

### Contractor Events

```solidity
event ContractorVerified(address indexed contractor);
event BidSubmitted(uint256 indexed projectId, address indexed contractor);
```

### Gateway Events

```solidity
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
```

### Protection Events

```solidity
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
```

### Privacy Events

```solidity
event PriceObfuscationApplied(uint256 indexed projectId, uint256 noiseLevel);
event PrivacyPreservingDivisionUsed(uint256 indexed projectId, uint256 multiplier);
```

### Admin Events

```solidity
event PauserAdded(address indexed pauser, uint256 timestamp);
event PauserRemoved(address indexed pauser, uint256 timestamp);
event ContractPaused(address indexed by, uint256 timestamp);
event ContractUnpaused(address indexed by, uint256 timestamp);
event KmsGenerationUpdated(uint256 oldGeneration, uint256 newGeneration);
event SecurityViolationDetected(address indexed violator, string reason);
```

---

## Types & Enums

### DecryptionType Enum

```solidity
enum DecryptionType {
    BUDGET_REVEAL,    // 0: Reveal final budget
    BID_COMPARISON,   // 1: Compare bids
    FINAL_APPROVAL    // 2: Final project approval
}
```

### Constants

```solidity
DECRYPTION_TIMEOUT = 1 hours          // Timeout for decryption requests
MAX_CONTINGENCY_PERCENT = 50          // Maximum contingency percentage
MAX_ROOMS_PER_PROJECT = 20            // Maximum rooms per project
PRICE_OBFUSCATION_RANGE = 1000        // Random noise range for obfuscation
```

---

## Error Messages

All errors are prefixed with `PRB:` (Private Renovation Budget).

### Common Errors

- `PRB: Not authorized` - Caller lacks permission
- `PRB: Not project owner` - Caller is not the project owner
- `PRB: Not verified contractor` - Contractor not verified
- `PRB: Invalid project ID` - Project ID out of range or doesn't exist
- `PRB: Project timed out` - Project exceeded timeout period
- `PRB: Contract is paused` - Operation blocked while paused
- `PRB: Already calculated` - Budget already calculated
- `PRB: Already approved` - Project already approved
- `PRB: No rooms added` - Cannot calculate budget with zero rooms
- `PRB: Maximum rooms exceeded` - Exceeded MAX_ROOMS_PER_PROJECT
- `PRB: Invalid request` - Decryption request doesn't exist
- `PRB: Already fulfilled` - Decryption already completed
- `PRB: Already refunded` - Refund already processed
- `PRB: Timeout not reached` - Cannot trigger refund before timeout

---

## Usage Examples

### Complete Workflow Example

```javascript
// 1. Deploy contract
const contract = await PrivateRenovationBudget.deploy([pauser1, pauser2], kmsGeneration);

// 2. Verify contractor
await contract.verifyContractor(contractorAddress);

// 3. Create project
const tx1 = await contract.createProject();
const projectId = (await tx1.wait()).events[0].args.projectId;

// 4. Add rooms
const room1 = {
    area: await fhevm.encrypt32(50),      // 50 sqm
    material: await fhevm.encrypt32(100), // $100/sqm
    labor: await fhevm.encrypt32(50)      // $50/sqm
};
await contract.addRoomRequirement(projectId, room1.area, room1.material, room1.labor);

// 5. Calculate budget
const contingency = await fhevm.encrypt32(10); // 10%
await contract.calculateBudget(projectId, contingency);

// 6. Contractor submits bid
const bid = await fhevm.encrypt64(7500);  // $7,500
const time = await fhevm.encrypt32(14);   // 14 days
await contract.connect(contractor).submitBid(projectId, bid, time);

// 7. Compare bid with budget
const { bidAmount, budgetEstimate } = await contract.compareBidWithBudget(
    projectId,
    contractorAddress
);
const decryptedBid = await fhevm.decrypt(bidAmount);
const decryptedBudget = await fhevm.decrypt(budgetEstimate);

// 8. Approve project
if (decryptedBid <= decryptedBudget) {
    await contract.approveProject(projectId, contractorAddress);
}
```

### Gateway Decryption Example

```javascript
// Request decryption
const budget = await contract.projects(projectId).finalEstimate;
const encryptedBytes = FHE.toBytes32(budget);
const tx = await contract.requestGatewayDecryption(
    projectId,
    encryptedBytes,
    DecryptionType.BUDGET_REVEAL
);
const requestId = (await tx.wait()).events[0].args.requestId;

// Gateway service monitors events and calls callback
// (This happens off-chain automatically)

// Check if fulfilled
const request = await contract.getDecryptionRequest(requestId);
if (request.fulfilled) {
    await contract.finalizeDecryption(requestId);
}

// Or trigger refund if timed out
if (!request.fulfilled && Date.now() - request.timestamp > 3600000) {
    await contract.triggerRefund(requestId);
}
```

---

## Integration Guide

### Frontend Integration

```javascript
import { ethers } from 'ethers';
import { createFhevmInstance } from 'fhevm';

// Initialize FHEVM
const fhevm = await createFhevmInstance({
    chainId: 8009,
    publicKey: FHE_PUBLIC_KEY
});

// Connect to contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Create encrypted inputs
const encryptedArea = await fhevm.encrypt32(50);
await contract.addRoomRequirement(projectId, encryptedArea, ...);
```

### Event Monitoring

```javascript
// Listen for project creation
contract.on("ProjectCreated", (projectId, homeowner, event) => {
    console.log(`New project ${projectId} created by ${homeowner}`);
});

// Listen for decryption requests
contract.on("DecryptionRequested", (requestId, requester, projectId, ...args) => {
    console.log(`Decryption requested: ${requestId}`);
    // Gateway service picks this up
});
```

---

## Security Best Practices

1. **Always encrypt sensitive inputs** client-side before submission
2. **Validate decrypted outputs** client-side before display
3. **Monitor timeout events** and implement auto-refresh
4. **Use hardware wallets** for owner/pauser roles
5. **Implement rate limiting** on frontend to prevent spam
6. **Audit all transactions** before submission
7. **Test refund paths** thoroughly in staging

---

## Support & Resources

- **Contract Address:** TBD (deploy to Sepolia testnet)
- **GitHub:** [Repository Link]
- **Documentation:** See ARCHITECTURE.md
- **Zama FHEVM Docs:** https://docs.zama.ai/fhevm
