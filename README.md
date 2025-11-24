# 🏠 Private Renovation Budget Manager v3.0

**Next-generation privacy-preserving renovation budget management with advanced FHE** - A modern application featuring **Gateway callback patterns**, **timeout protection**, **automatic refunds**, and **privacy-preserving division** for secure budget management on blockchain.

🌐 **[Documentation](#documentation)** | 📖 **[Architecture Guide](ARCHITECTURE.md)** | 📚 **[API Reference](API_DOCUMENTATION.md)**

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Network](https://img.shields.io/badge/network-Sepolia-purple)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org/)
[![FHEVM](https://img.shields.io/badge/FHEVM-0.8.0-orange.svg)](https://docs.zama.ai/fhevm)

Built with **Zama FHEVM** - demonstrating cutting-edge privacy-preserving applications in construction and real estate.

---

## ✨ What's New in v3.0

### 🚀 **Major Innovations**

#### 1. **Gateway Callback Pattern**
Revolutionary asynchronous decryption system:
```
User Request → Contract Records → Gateway Decrypts → Callback Completes Transaction
```
- Non-blocking operations
- Fault-tolerant design
- Client-side response aggregation
- Zero on-chain aggregation overhead

#### 2. **Automatic Refund Mechanism**
Smart failure recovery:
- Automatic refund on decryption timeout
- Escrow fund protection
- Manual refund triggers
- Comprehensive event tracking

#### 3. **Timeout Protection System**
Prevents permanent fund locks:
- 1-hour timeout window
- Activity timestamp tracking
- Auto-refresh capability
- Timeout event notifications

#### 4. **Privacy-Preserving Division**
Innovative solution to FHE division limitations:
```solidity
// Uses random multipliers to hide calculation patterns
randomMultiplier = random(100-200)
obfuscatedBudget = totalBudget * (100 + contingency) * randomMultiplier
// Client-side: actualBudget = obfuscatedBudget / (100 * randomMultiplier)
```

#### 5. **Price Obfuscation Techniques**
Advanced privacy protection:
- Random noise injection (0-1000 range)
- Pattern analysis prevention
- Inference attack mitigation
- Privacy event tracking

#### 6. **Comprehensive Security**
Enterprise-grade protection:
- **Input Validation**: Zero address checks, bounds enforcement
- **Access Control**: Role-based permissions with custom modifiers
- **Overflow Protection**: Solidity 0.8.24+ automatic checks
- **Audit Trail**: Complete event logging system
- **Security Events**: Violation detection and reporting

#### 7. **Gas & HCU Optimization**
Optimized for cost efficiency:
- Batch ACL permissions
- Minimized FHE conversions
- Strategic obfuscation placement
- Loop optimization strategies

---

## 🏗️ Core Features

### Smart Contract Capabilities

- 🔐 **Fully Encrypted Budgets** - All costs encrypted with FHE (`euint64`, `euint32`)
- 💰 **Confidential Bidding** - Encrypted bids invisible to competitors
- 🧮 **Homomorphic Calculations** - Budget computation on encrypted data
- 🔄 **Gateway Integration** - Asynchronous decryption via callback
- ⏱️ **Timeout Protection** - Automatic timeout detection and handling
- 💸 **Refund System** - Automated refund on failures
- 🎯 **Privacy-Preserving Math** - Division without revealing patterns
- 🛡️ **Security Features** - Comprehensive validation and access control
- ⏸️ **Emergency Controls** - Multi-pauser system
- 📊 **Event Tracking** - Complete audit trail

---

## 📋 Architecture Overview

### System Components

```
┌─────────────────────┐
│   Frontend          │
│   (User Interface)  │
│                     │
│   - Wallet Connect  │
│   - FHE Encryption  │
│   - Event Monitor   │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Smart Contract     │
│  (On-chain)         │
│                     │
│  - Encrypted State  │
│  - FHE Operations   │
│  - Access Control   │
│  - Timeout Tracking │
│  - Refund Logic     │
└──────────┬──────────┘
           │
           │ DecryptionRequested Events
           ↓
┌─────────────────────┐
│  Gateway Service    │
│  (Off-chain)        │
│                     │
│  - Event Monitor    │
│  - Request Queue    │
│  - Callback Handler │
└──────────┬──────────┘
           │
           │ Decrypt Requests
           ↓
┌─────────────────────┐
│   KMS Cluster       │
│  (Distributed)      │
│                     │
│  - Threshold Crypto │
│  - Key Management   │
│  - Signature Gen    │
└─────────────────────┘
```

### Data Flow

```
1. PROJECT CREATION
Homeowner → createProject() → ProjectCreated event
         → addRoomRequirement() → RoomAdded + PriceObfuscationApplied
         → calculateBudget() → BudgetCalculated + PrivacyPreservingDivisionUsed

2. GATEWAY DECRYPTION
Homeowner → requestGatewayDecryption() → DecryptionRequested event
         → Gateway monitors events
         → KMS nodes decrypt
         → gatewayCallback() → DecryptionResponse events
         → Client aggregates → finalizeDecryption()

3. TIMEOUT & REFUND
Request created (timestamp recorded)
         → Time passes > DECRYPTION_TIMEOUT
         → Option A: gatewayCallback() auto-detects → _processRefund()
         → Option B: User calls triggerRefund() → _processRefund()
         → RefundInitiated event → Funds returned

4. BIDDING & APPROVAL
Contractor → submitBid() → BidSubmitted event
Homeowner → compareBidWithBudget() → Returns encrypted comparison
         → Client-side decrypt → approveProject() → ProjectApproved event
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ and npm
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH (from faucet)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd PrivateRenovationBudget-main

# Install dependencies
npm install

# Configure environment
cp env.example.txt .env
# Edit .env with your settings:
# - SEPOLIA_RPC_URL
# - PRIVATE_KEY
# - NUM_PAUSERS
# - PAUSER_ADDRESS_0, PAUSER_ADDRESS_1, ...
# - KMS_GENERATION
```

### Compile & Deploy

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npm run deploy

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> \
  '["0xPauser1", "0xPauser2"]' 1
```

---

## 💻 Usage Examples

### Complete Workflow

```javascript
// 1. Create project
const tx1 = await contract.createProject();
const receipt1 = await tx1.wait();
const projectId = receipt1.events[0].args.projectId;

// 2. Add rooms with encryption
const room = {
    area: await fhevm.encrypt32(50),      // 50 sqm
    material: await fhevm.encrypt32(100), // $100/sqm
    labor: await fhevm.encrypt32(50)      // $50/sqm
};
await contract.addRoomRequirement(
    projectId,
    room.area,
    room.material,
    room.labor
);

// 3. Calculate budget
const contingency = await fhevm.encrypt32(10); // 10%
await contract.calculateBudget(projectId, contingency);

// 4. Request Gateway decryption
const { finalEstimate } = await contract.getBudgetEstimate(projectId);
const encryptedBytes = FHE.toBytes32(finalEstimate);
const txDecrypt = await contract.requestGatewayDecryption(
    projectId,
    encryptedBytes,
    0 // DecryptionType.BUDGET_REVEAL
);
const receiptDecrypt = await txDecrypt.wait();
const requestId = receiptDecrypt.events[0].args.requestId;

// 5. Monitor Gateway callback
contract.on("DecryptionFulfilled", (reqId, projId, success) => {
    if (reqId.toString() === requestId.toString()) {
        console.log("Decryption completed!");
    }
});

// 6. Handle timeout (if needed)
setTimeout(async () => {
    const req = await contract.getDecryptionRequest(requestId);
    if (!req.fulfilled) {
        await contract.triggerRefund(requestId);
        console.log("Timeout triggered, refund processed");
    }
}, 3600000); // 1 hour

// 7. Contractor submits bid
const bid = await fhevm.encrypt64(7500);  // $7,500
const time = await fhevm.encrypt32(14);   // 14 days
await contract.connect(contractor).submitBid(projectId, bid, time);

// 8. Compare and approve
const { bidAmount, budgetEstimate } =
    await contract.compareBidWithBudget(projectId, contractorAddress);

// Decrypt client-side
const decryptedBid = await fhevm.decrypt(bidAmount);
const decryptedBudget = await fhevm.decrypt(budgetEstimate);

if (decryptedBid <= decryptedBudget) {
    await contract.approveProject(projectId, contractorAddress);
}
```

### Refreshing Activity to Prevent Timeout

```javascript
// Keep project active
setInterval(async () => {
    await contract.refreshActivity(projectId);
    console.log("Activity refreshed");
}, 1800000); // Every 30 minutes
```

---

## 🔐 Privacy & Security

### Privacy Guarantees

| Feature | Privacy Level | Method |
|---------|---------------|--------|
| Room Costs | **Fully Private** | FHE encryption (euint32/euint64) |
| Budget Totals | **Fully Private** | Homomorphic computation |
| Contractor Bids | **Fully Private** | FHE encryption + obfuscation |
| Price Patterns | **Protected** | Random noise injection |
| Calculation Flow | **Obfuscated** | Random multipliers |
| Comparisons | **Encrypted** | FHE boolean operations |

### Security Features

✅ **Input Validation**
- Zero address checks
- Numeric bounds enforcement
- State validation
- Parameter range checks

✅ **Access Control**
- Owner-only admin functions
- Project owner restrictions
- Verified contractor requirements
- Role-based permissions

✅ **Overflow Protection**
- Solidity 0.8.24+ automatic checks
- Safe FHE operations
- Bounds validation

✅ **Timeout Protection**
- 1-hour maximum wait
- Activity tracking
- Auto-refresh capability
- Manual timeout triggers

✅ **Refund Mechanism**
- Automatic on timeout
- Escrow fund safety
- Double-refund prevention
- Event-based tracking

### Threat Mitigation

| Threat | Mitigation |
|--------|-----------|
| On-chain Analysis | Price obfuscation, random multipliers |
| Timing Attacks | Batch operations, randomized delays |
| Front-running | Encrypted bids, commit-reveal optional |
| Denial of Service | Room limits, contractor verification |
| Permanent Locks | Timeout protection, automatic refunds |

---

## 📊 Performance Metrics

### Gas Costs (Estimated on Sepolia)

| Operation | Gas | HCU | USD Cost* |
|-----------|-----|-----|-----------|
| Deploy Contract | ~4.5M | 0 | $5.62 |
| Create Project | ~80k | 0 | $0.10 |
| Add Room (with obfuscation) | ~350k | 4-6 | $0.44 |
| Calculate Budget (5 rooms) | ~800k | 15-20 | $1.00 |
| Submit Bid | ~280k | 3-4 | $0.35 |
| Request Gateway Decryption | ~120k | 0 | $0.15 |
| Gateway Callback | ~90k | 0 | $0.11 |
| Trigger Refund | ~110k | 0 | $0.14 |
| Approve Project | ~75k | 0 | $0.09 |

*Based on 50 gwei gas price, $2,500 ETH

### Throughput

- **Projects/block**: 2-3 (room count dependent)
- **Bids/block**: 5-8
- **Decryption requests/block**: 10-15

---

## 🧪 Testing

### Test Suite

```bash
# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Generate coverage
npm run coverage

# Run integration tests
npm run test:sepolia
```

### Test Coverage

| Category | Tests | Description |
|----------|-------|-------------|
| Deployment | 5 | Contract initialization |
| Admin Functions | 10 | Pauser management, KMS updates |
| Project Management | 12 | Creation, rooms, budgets |
| Gateway Callbacks | 8 | Decryption requests & responses |
| Timeout Protection | 6 | Timeout detection & handling |
| Refund Mechanism | 7 | Automatic & manual refunds |
| Privacy Features | 5 | Obfuscation & division |
| Security | 8 | Access control, validation |
| Bidding | 7 | Contractor bids |
| Edge Cases | 7 | Boundary conditions |

**Total**: 75+ comprehensive tests

---

## 📚 Documentation

### Complete Documentation Suite

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture, design patterns, data flows
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference with examples
- **[TESTING.md](TESTING.md)** - Testing guide and strategies
- **[SECURITY_PERFORMANCE.md](SECURITY_PERFORMANCE.md)** - Security audit and optimization
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions

### Key Documentation Highlights

#### Architecture Guide
- Gateway callback pattern explained
- Timeout protection system
- Refund mechanism details
- Privacy-preserving division
- Security architecture
- Performance optimization

#### API Reference
- All contract functions documented
- Parameter descriptions
- Return values
- Events reference
- Usage examples
- Error messages
- Integration guide

---

## 💡 Innovation Highlights

### 1. Gateway Callback Pattern

**Problem**: Synchronous decryption blocks transactions
**Solution**: Asynchronous Gateway callbacks with event-driven architecture

```solidity
// Request decryption
function requestGatewayDecryption(
    uint256 projectId,
    bytes32 encryptedValue,
    DecryptionType decryptionType
) external returns (uint256 requestId)

// Gateway responds
function gatewayCallback(
    uint256 requestId,
    bytes calldata encryptedShare,
    bytes calldata signature
) external

// User finalizes
function finalizeDecryption(uint256 requestId) external
```

### 2. Privacy-Preserving Division

**Problem**: FHE doesn't support division
**Solution**: Random multiplier technique

```solidity
uint32 randomMultiplier = random(100-200);
euint64 obfuscatedBudget = totalBudget * (100 + contingency) * randomMultiplier;
// Client divides: actualBudget = obfuscatedBudget / (100 * randomMultiplier)
```

**Benefits:**
- Hides calculation patterns
- Prevents inference attacks
- Maintains correctness
- Minimal HCU overhead

### 3. Timeout Protection

**Problem**: Failed decryptions can lock funds permanently
**Solution**: Multi-layer timeout system

```solidity
uint256 public constant DECRYPTION_TIMEOUT = 1 hours;
uint256 public lastActivityTime;

modifier notTimedOut(uint256 projectId) {
    require(
        block.timestamp - projects[projectId].lastActivityTime <= DECRYPTION_TIMEOUT,
        "Project timed out"
    );
    _;
}
```

### 4. Automatic Refund Mechanism

**Problem**: Users lose funds on Gateway failures
**Solution**: Automatic refund detection and processing

```solidity
function gatewayCallback(...) external {
    // Check timeout
    if (block.timestamp - request.timestamp > DECRYPTION_TIMEOUT) {
        _processRefund(requestId, "Decryption timeout");
        return;
    }
    // ... normal processing
}
```

---

## 🔧 Development

### Project Structure

```
PrivateRenovationBudget-main/
├── contracts/
│   └── PrivateRenovationBudget.sol  # Main contract (v3.0)
├── scripts/
│   ├── deploy.js                    # Deployment script
│   └── test-gateway.js              # Gateway testing
├── test/
│   ├── PrivateRenovationBudget.test.ts      # Unit tests
│   └── Gateway.test.ts                       # Gateway tests
├── ARCHITECTURE.md                  # Architecture documentation
├── API_DOCUMENTATION.md             # API reference
├── README.md                        # This file
├── hardhat.config.js               # Hardhat configuration
└── package.json                    # Dependencies
```

### Development Commands

```bash
# Compile contracts
npm run compile

# Run linters
npm run lint
npm run lint:sol
npm run lint:js

# Format code
npm run format

# Run tests
npm test
npm run test:gas
npm run coverage

# Clean artifacts
npm run clean
```

---

## 🚀 Deployment

### Deploy to Sepolia

```bash
# 1. Configure .env
cp env.example.txt .env
# Add your configuration

# 2. Deploy
npm run deploy

# 3. Verify
npx hardhat verify --network sepolia <ADDRESS> \
  '["0xPauser1", "0xPauser2", "0xPauser3"]' 1
```

### Configuration Example

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
NUM_PAUSERS=3
PAUSER_ADDRESS_0=0xAddress1
PAUSER_ADDRESS_1=0xAddress2
PAUSER_ADDRESS_2=0xAddress3
KMS_GENERATION=1
```

---

## 🛣️ Roadmap

### ✅ Completed (v3.0)

- [x] Gateway callback pattern
- [x] Timeout protection system
- [x] Automatic refund mechanism
- [x] Privacy-preserving division
- [x] Price obfuscation
- [x] Comprehensive security
- [x] Gas/HCU optimization
- [x] Complete documentation

### 🚧 In Progress

- [ ] Multi-signature approvals
- [ ] Milestone-based payments
- [ ] Enhanced Gateway integration

### 📅 Planned (v4.0)

- [ ] Zero-knowledge bid validation
- [ ] Layer 2 deployment
- [ ] Advanced dispute resolution
- [ ] DAO governance
- [ ] Insurance integration

---

## 💻 Tech Stack

### Smart Contracts

- **Solidity**: 0.8.24
- **FHE Library**: @fhevm/solidity v0.8.0
- **Gateway**: @zama-fhe/oracle-solidity v0.2.0
- **Development**: Hardhat 2.19.0
- **Testing**: Mocha + Chai
- **Type Safety**: TypeChain 8.3.2

### Development Tools

- **Linting**: Solhint, ESLint
- **Formatting**: Prettier
- **Coverage**: solidity-coverage
- **Gas Analysis**: hardhat-gas-reporter

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Run linting and tests
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 📞 Support

- 📖 **Documentation**: See [docs](#documentation)
- 💬 **Issues**: [GitHub Issues](https://github.com/yourusername/repo/issues)
- 💭 **Discord**: [Zama Community](https://discord.com/invite/zama)

---

## 🏆 Acknowledgments

Built with **Zama FHEVM** technology, demonstrating the future of privacy-preserving smart contracts.

**Special thanks to:**
- **Zama** - For pioneering FHE technology
- **Ethereum** - For the blockchain platform
- **FHE Community** - For guidance and support

---

<div align="center">

**Built with ❤️ using Zama's fhEVM technology**

Privacy-first | Security-focused | Production-ready

[⭐ Star this project](#) | [🐛 Report Bug](#) | [✨ Request Feature](#)

</div>
