# Private Renovation Budget - Architecture Documentation

## Overview

The Private Renovation Budget Manager v3.0 is an advanced FHE-based (Fully Homomorphic Encryption) smart contract system that enables privacy-preserving budget management for renovation projects on Ethereum.

## Core Architecture Principles

### 1. **Privacy-First Design**
- All sensitive data (budgets, bids, costs) is encrypted using FHE
- On-chain computations preserve privacy through homomorphic operations
- Price obfuscation techniques prevent pattern analysis
- Privacy-preserving division using random multipliers

### 2. **Gateway Callback Pattern**
The contract implements an asynchronous decryption pattern:

```
User Request → Contract Records → Gateway Decrypts → Callback Completes Transaction
```

**Flow:**
1. **Request Initiation**: User calls `requestGatewayDecryption()` with encrypted data
2. **Event Emission**: Contract emits `DecryptionRequested` event
3. **Gateway Processing**: Off-chain Gateway service picks up the event
4. **KMS Decryption**: Gateway requests decryption from KMS nodes
5. **Callback**: Gateway calls `gatewayCallback()` with decrypted shares
6. **Finalization**: User aggregates responses and calls `finalizeDecryption()`

**Benefits:**
- Non-blocking operations
- Fault tolerance through timeout protection
- Automatic refund on failure
- No on-chain aggregation overhead

### 3. **Timeout Protection System**

Prevents permanent fund locks through multi-layer protection:

```solidity
DECRYPTION_TIMEOUT = 1 hour
```

**Mechanisms:**
- `lastActivityTime` tracking on all projects
- `notTimedOut` modifier on critical functions
- `checkTimeout()` allows anyone to flag expired projects
- `refreshActivity()` allows owners to extend deadlines
- Automatic refund triggers in `gatewayCallback()`

### 4. **Refund Mechanism**

Automatic protection against failed operations:

**Trigger Conditions:**
- Decryption timeout (> 1 hour)
- Gateway failure
- KMS unavailability
- Manual trigger by owner or requester

**Process:**
```solidity
function _processRefund(uint256 requestId, string memory reason)
```

- Marks request as refunded
- Releases escrowed funds
- Emits `RefundInitiated` event
- Prevents double-refunds

## Innovative Features

### 1. **Privacy-Preserving Division**

**Problem:** FHE doesn't support division directly.

**Solution:** Random multiplier obfuscation

```solidity
// Traditional: finalEstimate = totalBudget * (100 + contingency) / 100
// Privacy-preserving:
randomMultiplier = random(100-200)
obfuscatedBudget = totalBudget * (100 + contingency) * randomMultiplier
// Client-side: actualBudget = obfuscatedBudget / (100 * randomMultiplier)
```

**Benefits:**
- Hides calculation patterns
- Prevents inference attacks
- Maintains computational correctness
- Minimal HCU overhead

### 2. **Price Obfuscation**

Adds random noise to prevent price pattern analysis:

```solidity
noise = random(0-1000)
obfuscatedCost = actualCost + noise
```

**Applied to:**
- Room cost calculations
- Contractor bids
- Budget estimates

**Event Tracking:**
- `PriceObfuscationApplied(projectId, noiseLevel)`
- `PrivacyPreservingDivisionUsed(projectId, multiplier)`

### 3. **Comprehensive Security**

#### Input Validation
- All addresses checked for zero address
- Numeric bounds enforced (MAX_ROOMS_PER_PROJECT = 20)
- State validation (isCalculated, isApproved)
- Contingency limits (0-50%)

#### Access Control
- Owner-only admin functions
- Project owner restrictions
- Verified contractor requirements
- Pauser role separation

#### Overflow Protection
- Solidity 0.8.24+ automatic overflow checks
- Safe FHE operations
- Bounds checking on all inputs

#### Audit Trail
- Comprehensive event logging
- Security violation detection
- Timestamp tracking
- Request/response correlation

### 4. **Gas & HCU Optimization**

**HCU (Homomorphic Computation Units)** are the "gas" of FHE operations.

**Optimization Strategies:**

1. **Batch ACL Permissions**
```solidity
FHE.allowThis(value1);
FHE.allowThis(value2);
FHE.allow(value1, user);
```

2. **Minimize FHE Conversions**
```solidity
// Bad: Multiple conversions
euint64 a = FHE.asEuint64(FHE.asEuint32(value));

// Good: Single conversion
euint32 temp = FHE.asEuint32(value);
euint64 a = FHE.asEuint64(temp);
```

3. **Loop Optimization**
```solidity
// Accumulate in smallest viable type
euint64 total = FHE.asEuint64(0);
for (uint8 i = 0; i < count; i++) {
    total = FHE.add(total, FHE.asEuint64(roomCost));
}
```

4. **Strategic Obfuscation**
- Apply noise at final step only
- Don't obfuscate intermediate values
- Balance privacy vs. cost

## Data Flow Diagrams

### Project Creation Flow
```
Homeowner
    ↓
createProject() → ProjectCreated event
    ↓
addRoomRequirement() → RoomAdded + PriceObfuscationApplied events
    ↓ (repeat for each room)
calculateBudget() → BudgetCalculated + PrivacyPreservingDivisionUsed events
    ↓
Project Ready for Bids
```

### Bidding Flow
```
Contractor (verified)
    ↓
submitBid() → BidSubmitted event
    ↓ (multiple contractors)
Homeowner reviews bids
    ↓
compareBidWithBudget() → Returns encrypted comparison
    ↓
Client-side decryption
    ↓
approveProject(selectedContractor) → ProjectApproved event
```

### Gateway Decryption Flow
```
Homeowner
    ↓
requestGatewayDecryption() → DecryptionRequested event
    ↓
Gateway Service (off-chain)
    ↓
Multiple KMS Nodes
    ↓ (each node)
gatewayCallback() → DecryptionResponse event
    ↓
Client aggregates responses
    ↓
finalizeDecryption() → DecryptionFulfilled event
```

### Timeout & Refund Flow
```
Request Created (timestamp recorded)
    ↓
Time passes (> DECRYPTION_TIMEOUT)
    ↓
Option A: gatewayCallback() detects timeout → _processRefund()
Option B: User calls triggerRefund() → _processRefund()
    ↓
RefundInitiated event
    ↓
Escrowed funds returned
```

## Security Considerations

### Threat Model

1. **On-chain Analysis**
   - **Threat**: Transaction pattern analysis
   - **Mitigation**: Price obfuscation, random multipliers

2. **Timing Attacks**
   - **Threat**: Correlation via timestamps
   - **Mitigation**: Batch operations, randomized delays

3. **Front-running**
   - **Threat**: MEV extraction from bid submissions
   - **Mitigation**: Encrypted bids, commit-reveal optional

4. **Denial of Service**
   - **Threat**: Resource exhaustion
   - **Mitigation**: Room limits, contractor verification

5. **Permanent Locks**
   - **Threat**: Failed decryptions lock funds
   - **Mitigation**: Timeout protection, automatic refunds

### Best Practices

1. **Always validate inputs** before FHE operations
2. **Use modifiers** for consistent access control
3. **Emit events** for all state changes
4. **Track timestamps** for timeout protection
5. **Implement refunds** for all async operations
6. **Test timeout paths** thoroughly
7. **Monitor HCU usage** in production

## State Machine

### Project States
```
CREATED → ROOMS_ADDED → CALCULATED → BIDS_RECEIVED → APPROVED
   ↓          ↓              ↓              ↓            ↓
TIMEOUT    TIMEOUT        TIMEOUT        TIMEOUT     SUCCESS
```

### Decryption Request States
```
REQUESTED → FULFILLED → FINALIZED
    ↓           ↓
 TIMEOUT    TIMEOUT
    ↓           ↓
 REFUNDED    REFUNDED
```

## Event-Driven Architecture

All major operations emit events for off-chain indexing:

**Project Events:**
- `ProjectCreated`
- `RoomAdded`
- `BudgetCalculated`
- `ProjectApproved`

**Privacy Events:**
- `PriceObfuscationApplied`
- `PrivacyPreservingDivisionUsed`

**Gateway Events:**
- `DecryptionRequested`
- `DecryptionResponse`
- `DecryptionFulfilled`

**Protection Events:**
- `RefundInitiated`
- `TimeoutTriggered`

**Security Events:**
- `ContractPaused`
- `PauserAdded`
- `SecurityViolationDetected`

## Deployment Architecture

```
┌─────────────────────┐
│   Ethereum Network  │
│                     │
│  ┌───────────────┐  │
│  │  Contract     │  │
│  │  (On-chain)   │  │
│  └───────┬───────┘  │
└──────────┼──────────┘
           │
           │ Events
           ↓
┌─────────────────────┐
│  Gateway Service    │
│  (Off-chain)        │
│  ┌───────────────┐  │
│  │ Event Monitor │  │
│  │ Request Queue │  │
│  └───────┬───────┘  │
└──────────┼──────────┘
           │
           │ Decrypt Requests
           ↓
┌─────────────────────┐
│   KMS Cluster       │
│  (Distributed)      │
│  ┌───┐ ┌───┐ ┌───┐ │
│  │KMS│ │KMS│ │KMS│ │
│  │ 1 │ │ 2 │ │ 3 │ │
│  └───┘ └───┘ └───┘ │
└─────────────────────┘
```

## Upgrade Path

### Future Enhancements

1. **Multi-signature Approvals**
   - Require multiple stakeholder approvals
   - Escrow integration

2. **Advanced Privacy**
   - Zero-knowledge proofs for bid validation
   - Threshold encryption

3. **DeFi Integration**
   - Automated payment releases
   - Insurance protocols

4. **Layer 2 Scaling**
   - Optimistic rollups for reduced costs
   - State channels for frequent updates

5. **DAO Governance**
   - Community contractor verification
   - Dispute resolution

## Performance Metrics

### Typical Gas Costs (estimated)

| Operation | Gas | HCU |
|-----------|-----|-----|
| `createProject()` | ~80k | 0 |
| `addRoomRequirement()` | ~350k | 4-6 |
| `calculateBudget()` (5 rooms) | ~800k | 15-20 |
| `submitBid()` | ~280k | 3-4 |
| `requestGatewayDecryption()` | ~120k | 0 |
| `gatewayCallback()` | ~90k | 0 |
| `approveProject()` | ~75k | 0 |

### Throughput

- **Projects/block**: 2-3 (depending on room count)
- **Bids/block**: 5-8
- **Decryption requests/block**: 10-15

## Testing Strategy

### Unit Tests
- All modifiers
- All state transitions
- All edge cases
- Overflow scenarios

### Integration Tests
- Complete workflows
- Gateway interactions
- Timeout scenarios
- Refund mechanisms

### Security Tests
- Access control
- Re-entrancy protection
- Integer bounds
- Timestamp manipulation

### Performance Tests
- Gas profiling
- HCU measurements
- Batch operations
- Large datasets

## Conclusion

This architecture provides:

✅ **Privacy**: FHE-based encryption throughout
✅ **Reliability**: Timeout protection and refunds
✅ **Scalability**: Optimized HCU usage
✅ **Security**: Comprehensive validation and access control
✅ **Flexibility**: Gateway callback pattern for async operations

The system balances cutting-edge privacy technology with practical production requirements, creating a robust foundation for private budget management on blockchain.
