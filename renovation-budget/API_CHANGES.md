# API Changes - v1.0 to v2.0

## Breaking Changes

### 1. Constructor Signature Change

#### ❌ Old (v1.0):
```solidity
constructor()
```

#### ✅ New (v2.0):
```solidity
constructor(address[] memory _pauserAddresses, uint256 _kmsGeneration)
```

**Migration**: Update deployment scripts to include pauser addresses and KMS generation.

---

### 2. Check Functions Replaced

All `check*()` functions that reverted on failure have been replaced with `is*()` functions that return boolean values.

#### ❌ Removed Functions:
```solidity
// These functions NO LONGER EXIST
checkPublicDecryptAllowed() // reverted on failure
```

#### ✅ New Functions:
```solidity
function isPublicDecryptAllowed() external view returns (bool);
function isPauser(address _address) external view returns (bool);
function isContractPaused() external view returns (bool);
function isProjectValid(uint256 projectId) external view returns (bool);
function isProjectCalculated(uint256 projectId) external view returns (bool);
function isProjectApproved(uint256 projectId) external view returns (bool);
```

**Migration**: Replace all check function calls with is functions and handle boolean returns:

```javascript
// OLD
try {
  await contract.checkPublicDecryptAllowed();
  // proceed
} catch {
  // handle error
}

// NEW
const isAllowed = await contract.isPublicDecryptAllowed();
if (isAllowed) {
  // proceed
} else {
  // handle error
}
```

---

### 3. Decryption Events Changed

#### ❌ Old Events:
Encrypted shares and signatures were aggregated on-chain before being returned.

#### ✅ New Events:
```solidity
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
```

**Key Difference**: Each KMS node now emits INDIVIDUAL responses. Client must aggregate shares.

**Migration**: Update frontend to:
1. Listen for `DecryptionRequested` event
2. Collect multiple `DecryptionResponse` events (one per KMS node)
3. Aggregate encrypted shares client-side
4. Reconstruct plaintext from aggregated shares

```javascript
// NEW approach
const requestTx = await contract.requestDecryption(encryptedValue);
const receipt = await requestTx.wait();
const requestId = receipt.events.find(e => e.event === 'DecryptionRequested').args.requestId;

// Listen for individual KMS responses
const responses = [];
contract.on('DecryptionResponse', (reqId, kmsNode, share, signature) => {
  if (reqId === requestId) {
    responses.push({ kmsNode, share, signature });

    // When enough responses collected, aggregate client-side
    if (responses.length >= threshold) {
      const plaintext = aggregateShares(responses);
    }
  }
});
```

---

## New Features

### 1. Pause Functionality

#### New State:
```solidity
bool public isPaused;
```

#### New Modifiers:
```solidity
modifier whenNotPaused()
modifier onlyPauser()
```

#### New Functions:
```solidity
function pause() external onlyPauser;
function unpause() external onlyOwner;
```

#### New Events:
```solidity
event ContractPaused(address indexed by, uint256 timestamp);
event ContractUnpaused(address indexed by, uint256 timestamp);
```

**Usage**:
```javascript
// Pause contract (only pausers)
await contract.connect(pauserSigner).pause();

// Check if paused
const isPaused = await contract.isContractPaused();

// Unpause (only owner)
await contract.connect(ownerSigner).unpause();
```

---

### 2. Pauser Management

#### New Functions:
```solidity
function addPauser(address _pauser) external onlyOwner;
function removePauser(address _pauser) external onlyOwner;
function getPauserCount() external view returns (uint256);
function getPauserAtIndex(uint256 _index) external view returns (address);
function getAllPausers() external view returns (address[] memory);
```

#### New Events:
```solidity
event PauserAdded(address indexed pauser, uint256 timestamp);
event PauserRemoved(address indexed pauser, uint256 timestamp);
```

**Usage**:
```javascript
// Get all pausers
const pausers = await contract.getAllPausers();

// Add new pauser
await contract.connect(ownerSigner).addPauser(newPauserAddress);

// Remove pauser
await contract.connect(ownerSigner).removePauser(pauserAddress);
```

---

### 3. KMS Generation Management

#### New State:
```solidity
uint256 public kmsGeneration;
```

#### New Function:
```solidity
function updateKmsGeneration(uint256 _newGeneration) external onlyOwner;
```

#### New Event:
```solidity
event KmsGenerationUpdated(uint256 oldGeneration, uint256 newGeneration);
```

**Usage**:
```javascript
// Get current KMS generation
const currentGen = await contract.kmsGeneration();

// Update KMS generation (only owner)
await contract.connect(ownerSigner).updateKmsGeneration(2);
```

---

### 4. New Decryption Request System

#### New Struct:
```solidity
struct DecryptionRequest {
    uint256 requestId;
    address requester;
    bytes32 encryptedValue;
    uint256 timestamp;
    bool fulfilled;
    uint256 kmsGeneration;
}
```

#### New Functions:
```solidity
function requestDecryption(bytes32 _encryptedValue) external returns (uint256);
function submitDecryptionResponse(uint256 _requestId, bytes calldata _encryptedShare, bytes calldata _signature) external;
function getDecryptionRequest(uint256 _requestId) external view returns (...);
```

**Usage**:
```javascript
// Request decryption
const tx = await contract.requestDecryption(encryptedValueBytes32);
const receipt = await tx.wait();

// Get request details
const request = await contract.getDecryptionRequest(requestId);
console.log(request.timestamp, request.fulfilled, request.kmsGeneration);
```

---

## Modified Functions

All public state-changing functions now include `whenNotPaused` modifier:

```solidity
function verifyContractor(address contractor) external onlyOwner whenNotPaused;
function createProject() external whenNotPaused returns (uint256);
function addRoomRequirement(...) external onlyProjectOwner(projectId) whenNotPaused;
function calculateBudget(...) external onlyProjectOwner(projectId) whenNotPaused;
function submitBid(...) external onlyVerifiedContractor whenNotPaused;
function approveProject(...) external onlyProjectOwner(projectId) whenNotPaused;
function requestBudgetDecryption(uint256 projectId) external onlyProjectOwner(projectId) whenNotPaused;
function processBudgetReveal(...) external whenNotPaused;
```

**Impact**: All these functions will revert if contract is paused.

---

## Unchanged Functions

These functions remain unchanged and backward compatible:

```solidity
// View functions
function getProjectInfo(uint256 projectId) external view returns (...);
function getBudgetEstimate(uint256 projectId) external view returns (...);
function getContractorBid(uint256 projectId, address contractor) external returns (...);
function getProjectContractors(uint256 projectId) external view returns (address[] memory);
function compareBidWithBudget(uint256 projectId, address contractor) external view returns (...);

// Verification
verifiedContractors(address) public view returns (bool);
```

---

## Security Improvements (Automatic)

### Transaction Input Re-randomization

All transaction inputs are now **automatically re-randomized** before FHE evaluation. This provides **sIND-CPAD security** without any code changes required.

**What this means**:
- Enhanced privacy for all encrypted inputs
- No replay attacks on encrypted values
- Semantic indistinguishability under chosen-plaintext attack with decryption
- **Zero changes required in your code** - it's automatic!

---

## Migration Checklist

- [ ] Update deployment scripts with new constructor parameters
- [ ] Replace all `check*()` calls with `is*()` calls
- [ ] Update event listeners for new decryption event structure
- [ ] Implement client-side share aggregation
- [ ] Add pause/unpause UI controls
- [ ] Test with new `.env` configuration format
- [ ] Update contract ABI in frontend
- [ ] Test all functions work when paused/unpaused
- [ ] Verify pauser management functions
- [ ] Test KMS generation updates
- [ ] Update documentation with new API

---

## Support & Documentation

- Migration Guide: `MIGRATION_SUMMARY.md`
- Environment Config: `env.example.txt`
- Deployment Script: `scripts/deploy.js`
- Contract: `contracts/PrivateRenovationBudget.sol`

**Questions?** Check the inline comments in the migrated contract for detailed explanations.
