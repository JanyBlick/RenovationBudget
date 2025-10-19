# 🏠 Private Renovation Budget Manager

**Privacy-preserving renovation budget management with Zama FHEVM** - Homeowners create confidential budgets, contractors submit encrypted bids, all computations happen on encrypted data.

🌐 **[Live Demo](https://JanyBlick.github.io/RenovationBudget)** | 📜 **[Contract: 0x301258...](https://sepolia.etherscan.io/address/0x301258156b7D06e69A2E116fc8EC574B78D2EA38)** | 📖 **[Zama Docs](https://docs.zama.ai/fhevm)**

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Network](https://img.shields.io/badge/network-Sepolia-purple)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org/)
[![codecov](https://codecov.io/gh/JanyBlick/RenovationBudget/branch/main/graph/badge.svg)](https://codecov.io/gh/JanyBlick/RenovationBudget)

Built for the **Zama FHE Challenge** - demonstrating practical privacy-preserving applications in real estate and construction.

---

## ✨ Features

- 🔐 **Fully Encrypted Budgets** - Room costs and totals encrypted with FHE (`euint64`, `euint32`)
- 💰 **Confidential Bidding** - Contractors submit encrypted bids invisible to competitors
- 🧮 **Homomorphic Calculations** - Budget totals computed on encrypted data using `FHE.add()`, `FHE.mul()`
- 🏗️ **Project Management** - Create, update, and approve projects with encrypted parameters
- 🔒 **Access Control** - Role-based permissions (Owner, Homeowner, Contractor)
- ⏸️ **Emergency Pause** - Multi-pauser system for security incidents
- 📊 **Transaction History** - Real-time tracking with status updates
- 🎯 **Gas Optimized** - Compiler optimization (800 runs) for efficient execution

---

## 🏗️ Architecture

```
Frontend (Vanilla JS + Ethers.js)
├── Client-side FHE encryption (fhevmjs)
├── MetaMask integration
├── Real-time encrypted data display
└── Transaction history tracking

Smart Contract (Solidity 0.8.24)
├── Encrypted storage (euint64, euint32, ebool)
├── Homomorphic operations (FHE.add, FHE.mul, FHE.ge)
├── Access control (Owner, Homeowner, Contractor)
└── Emergency pause mechanism (PauserSet)

Zama FHEVM
├── Encrypted computation layer
├── Gateway for decryption requests
└── Sepolia testnet deployment (Chain ID: 11155111)
```

**Data Flow:**

```
Homeowner                    Smart Contract                  Contractor
    │                              │                              │
    │  1. Create Project           │                              │
    ├─────────────────────────────►│                              │
    │                              │                              │
    │  2. Add Room (encrypted)     │                              │
    ├─────────────────────────────►│ Stores euint64 cost         │
    │                              │                              │
    │  3. Calculate Budget         │                              │
    ├─────────────────────────────►│ FHE.add() homomorphic       │
    │                              │ computation                  │
    │                              │                              │
    │                              │  4. Submit Bid (encrypted)   │
    │                              │◄─────────────────────────────┤
    │                              │ Stores euint64 bid           │
    │                              │                              │
    │  5. Approve Project          │                              │
    ├─────────────────────────────►│                              │
    │                              │  6. Notify Selected          │
    │                              ├─────────────────────────────►│
```

---

## 🚀 Quick Start

### 1️⃣ Clone & Install

```bash
# Clone repository
git clone https://github.com/JanyBlick/RenovationBudget.git
cd RenovationBudget

# Install dependencies
npm install
```

### 2️⃣ Configure Environment

```bash
# Copy environment template
cp env.example.txt .env

# Edit .env with your settings
```

**Required settings:**

```env
# Sepolia RPC URL (get from Infura or Alchemy)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Deployer private key (MetaMask → Account Details → Export)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# PauserSet configuration (Gateway system)
NUM_PAUSERS=3
PAUSER_ADDRESS_0=0xPAUSER_ADDRESS_1
PAUSER_ADDRESS_1=0xPAUSER_ADDRESS_2
PAUSER_ADDRESS_2=0xPAUSER_ADDRESS_3

# KMS generation
KMS_GENERATION=1
```

> 📖 **Full configuration guide**: See [ENV_CONFIGURATION_GUIDE.md](ENV_CONFIGURATION_GUIDE.md)

### 3️⃣ Deploy Contract

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy
```

### 4️⃣ Run Frontend

```bash
# Start local server
npm run dev

# Open browser
# http://localhost:8080
```

---

## 🔧 Technical Implementation

### FHEVM Code Examples

**1. Encrypted Storage**

```solidity
// Encrypted room cost (euint64)
mapping(uint256 => mapping(uint256 => euint64)) private roomCosts;

// Encrypted budget total (euint64)
mapping(uint256 => euint64) private totalBudgets;

// Encrypted contractor bid (euint64)
mapping(uint256 => mapping(address => euint64)) private contractorBids;
```

**2. Homomorphic Operations**

```solidity
// Add encrypted room costs
euint64 total = roomCosts[projectId][0];
for (uint256 i = 1; i < roomCount; i++) {
    total = FHE.add(total, roomCosts[projectId][i]);
}

// Apply contingency percentage (encrypted multiplication)
euint64 contingencyAmount = FHE.mul(total, contingency);
euint64 finalBudget = FHE.add(total, contingencyAmount);
```

**3. Encrypted Comparison**

```solidity
// Compare bid to budget (returns ebool)
ebool isAffordable = FHE.le(bid, budget);

// Select value based on encrypted condition
euint64 adjustedPrice = FHE.select(
    isAffordable,
    bid,           // If affordable, use bid
    maxPrice       // Otherwise, use max price
);
```

**4. Access Control with Decryption**

```solidity
// Allow homeowner to decrypt their own budget
function getBudget(uint256 projectId) public view returns (euint64) {
    require(msg.sender == projects[projectId].homeowner, "Not authorized");
    return FHE.asEuint64(totalBudgets[projectId]);
}
```

### Smart Contract Architecture

```solidity
contract PrivateRenovationBudget {
    // Encrypted data types
    struct Project {
        address homeowner;
        euint64 totalBudget;     // Encrypted total
        uint32 roomCount;        // Public count
        bool approved;           // Public state
    }

    struct Room {
        euint64 area;           // Encrypted area
        euint64 costPerUnit;    // Encrypted cost
        euint64 totalCost;      // Encrypted total
    }

    // Core functions
    function createProject() external returns (uint256);
    function addRoomRequirement(uint256 projectId, inEuint64 area, inEuint64 cost) external;
    function calculateBudget(uint256 projectId, uint32 contingency) external;
    function submitBid(uint256 projectId, inEuint64 bidAmount) external;
    function approveProject(uint256 projectId, address contractor) external;
}
```

### Frontend Integration

```javascript
// Initialize fhevmjs
import { createInstance } from 'fhevmjs';

const instance = await createInstance({
  chainId: 11155111, // Sepolia
  publicKey: contractPublicKey,
  gatewayUrl: 'https://gateway.sepolia.zama.ai'
});

// Encrypt data client-side
const area = await instance.encrypt64(1000); // 1000 sq ft
const cost = await instance.encrypt64(50); // $50 per sq ft

// Submit to contract
await contract.addRoomRequirement(projectId, area, cost);
```

---

## 🧪 Testing

**Comprehensive test suite with 75+ tests:**

```bash
# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Run Sepolia integration tests
npm run test:sepolia

# Generate coverage report
npm run coverage
```

**Test Categories:**

| Category | Tests | Description |
|----------|-------|-------------|
| Deployment & Initialization | 5 | Contract setup and configuration |
| Pauser Management | 8 | Emergency pause system |
| Contractor Verification | 6 | Contractor authorization |
| Project Creation | 7 | Project initialization |
| Room Requirements | 8 | Encrypted room specifications |
| Budget Calculation | 6 | FHE budget computation |
| Contractor Bidding | 7 | Encrypted bid submission |
| Project Approval | 6 | Contractor selection |
| Edge Cases | 6 | Boundary conditions |
| Gas Optimization | 3 | Gas cost analysis |

**Coverage Target:** >85% (Statements, Branches, Functions, Lines)

> 📖 **Full testing guide**: See [TESTING.md](TESTING.md)

---

## 🌐 Live Demo

### Deployed Contract

**Network**: Sepolia Testnet (Chain ID: 11155111)
**Contract**: `0x301258156b7D06e69A2E116fc8EC574B78D2EA38`
**Explorer**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x301258156b7D06e69A2E116fc8EC574B78D2EA38)

### Frontend Demo

**Live App**: [https://JanyBlick.github.io/RenovationBudget](https://JanyBlick.github.io/RenovationBudget)

**Test it yourself:**

1. Connect MetaMask to Sepolia
2. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com)
3. Create a renovation project
4. Add encrypted room requirements
5. Calculate encrypted budget
6. Submit contractor bids

---

## 🔐 Privacy Model

### What's Private

✅ **Room Area & Costs** - Encrypted with `euint64`, invisible on-chain
✅ **Budget Totals** - Computed homomorphically, never decrypted
✅ **Contractor Bids** - Encrypted `euint64`, competitors can't see
✅ **Comparisons** - FHE comparison results (ebool) remain encrypted

### What's Public

📊 **Project Existence** - Project IDs and creation transactions
📊 **Participant Addresses** - Homeowners and contractors (blockchain requirement)
📊 **Room Count** - Number of rooms (not their details)
📊 **Approval Status** - Whether project is approved (not bid amounts)

### Decryption Permissions

| Role | Can Decrypt |
|------|------------|
| **Homeowner** | Own project budget, own room costs |
| **Contractor** | Own submitted bids |
| **Gateway Oracle** | Aggregate totals when authorized |
| **Contract Owner** | Administrative access to encrypted data |

### Security Guarantees

- 🔒 **Computational Privacy**: Homomorphic operations never expose plaintext
- 🔒 **Access Control**: Solidity-enforced role-based permissions
- 🔒 **Gateway Security**: Zama Gateway for secure decryption requests
- 🔒 **Re-randomization**: Automatic input re-randomization for sIND-CPAD security

---

## 📋 Usage Guide

### For Homeowners

**1. Create Project**

```javascript
// Connect wallet
await connectWallet();

// Create new project
const tx = await contract.createProject();
await tx.wait();
```

**2. Add Rooms**

```javascript
// Encrypt room data
const area = await instance.encrypt64(1200); // sq ft
const cost = await instance.encrypt64(75);   // $ per sq ft

// Add to contract
await contract.addRoomRequirement(projectId, area, cost);
```

**3. Calculate Budget**

```javascript
// Calculate with 10% contingency
await contract.calculateBudget(projectId, 10);

// Request decryption (via Gateway)
const encryptedBudget = await contract.getBudget(projectId);
const budget = await instance.decrypt(encryptedBudget);
```

**4. Review Bids & Approve**

```javascript
// Get contractor list
const contractors = await contract.getProjectContractors(projectId);

// Approve selected contractor
await contract.approveProject(projectId, contractorAddress);
```

### For Contractors

**1. Get Verified**

```javascript
// Request contract owner to verify you
// Owner runs: await contract.verifyContractor(contractorAddress);
```

**2. Submit Bid**

```javascript
// Encrypt bid amount
const bidAmount = await instance.encrypt64(95000); // $95,000

// Submit to project
await contract.submitBid(projectId, bidAmount);
```

**3. Check Status**

```javascript
// View own bid
const bid = await contract.getContractorBid(projectId);

// Check if selected
const project = await contract.getProjectInfo(projectId);
if (project.selectedContractor === myAddress) {
  console.log("🎉 You won the project!");
}
```

---

## 💻 Tech Stack

### Smart Contracts

- **Solidity**: 0.8.24
- **FHE Library**: [@fhevm/solidity](https://github.com/zama-ai/fhevm) v0.8.0
- **Gateway**: [@zama-fhe/oracle-solidity](https://github.com/zama-ai/fhevm-oracle-solidity) v0.2.0
- **Build Tool**: Hardhat 2.19.0
- **Testing**: Mocha + Chai + Hardhat Toolbox
- **Type Safety**: TypeChain v8.3.2

### Frontend

- **Core**: Vanilla JavaScript + HTML5 + CSS3
- **Web3**: Ethers.js v6.9.0
- **FHE Client**: fhevmjs v0.6.2
- **Wallet**: MetaMask integration
- **Deployment**: GitHub Pages
- **Server**: http-server (development)

### Development Tools

- **Linting**: Solhint 4.1.0 + ESLint 8.56.0
- **Formatting**: Prettier 3.1.0
- **Security**: eslint-plugin-security, detect-secrets-launcher
- **Pre-commit**: Husky 8.0.3
- **Gas Analysis**: hardhat-gas-reporter 2.3.0
- **Coverage**: solidity-coverage 0.8.16

### Infrastructure

- **Network**: Ethereum Sepolia Testnet
- **RPC**: Infura / Alchemy
- **Explorer**: Etherscan
- **CI/CD**: GitHub Actions
- **Coverage**: Codecov

---

## 🔧 Development

### Project Structure

```
RenovationBudget/
├── contracts/
│   ├── PrivateRenovationBudget.sol    # Main contract
│   └── interfaces/                     # Interface definitions
├── scripts/
│   ├── deploy.js                       # Deployment script
│   └── test-pause.js                   # Pause testing
├── test/
│   ├── PrivateRenovationBudget.test.ts        # Unit tests (62 tests)
│   └── PrivateRenovationBudget.sepolia.test.ts # Integration tests (13 tests)
├── public/
│   ├── index.html                      # Frontend UI
│   ├── app.js                          # Application logic
│   └── styles.css                      # Glassmorphism UI
├── hardhat.config.js                   # Hardhat configuration
├── env.example.txt                        # Environment template
└── package.json                        # Dependencies
```

### Local Development

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Start local node
npx hardhat node

# Deploy locally
npm run deploy:local

# Run frontend
npm run dev
```

### Code Quality

```bash
# Lint Solidity
npm run lint:sol

# Lint JavaScript/TypeScript
npm run lint:js

# Format code
npm run format

# Check formatting
npm run format:check

# Full CI suite
npm run ci
```

---

## 🔒 Security & Performance

### Security Features

- ✅ **Pre-commit Hooks**: 5 automated security checks (Husky)
- ✅ **ESLint Security**: Detects unsafe patterns and secrets
- ✅ **Daily Audits**: Automated dependency and secret scanning
- ✅ **Gas Monitoring**: DoS protection with gas limits
- ✅ **Contract Sizer**: EIP-170 compliance (<24KB)
- ✅ **Multi-pauser**: Emergency circuit breaker system

### Performance Optimization

- ⚡ **Compiler**: Optimizer enabled (800 runs)
- ⚡ **Gas Efficient**: Advanced Yul optimization
- ⚡ **Type Safety**: Full TypeScript + TypeChain
- ⚡ **Code Splitting**: Reduced attack surface
- ⚡ **Caching**: Optimized dependency caching

> 📖 **Full security guide**: See [SECURITY_PERFORMANCE.md](SECURITY_PERFORMANCE.md)

---

## 📊 Gas Costs

**Estimated gas costs on Sepolia:**

| Operation | Gas Used | USD Cost* |
|-----------|----------|-----------|
| Deploy Contract | ~4.2M | $5.25 |
| Create Project | ~120K | $0.15 |
| Add Room | ~180K | $0.22 |
| Calculate Budget | ~250K | $0.31 |
| Submit Bid | ~160K | $0.20 |
| Approve Project | ~90K | $0.11 |

*Based on 50 gwei gas price, $2,500 ETH

> 💡 Run `npm run test:gas` for detailed gas analysis

---

## 🚀 Deployment

### Deploy to Sepolia

```bash
# 1. Configure environment
cp env.example.txt .env
# Edit .env with your settings

# 2. Get Sepolia ETH
# Visit https://sepoliafaucet.com

# 3. Deploy contract
npm run deploy

# 4. Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Deploy Frontend

**GitHub Pages (Automatic):**

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy application"
git push origin main

# 2. Enable GitHub Pages
# Settings → Pages → Source: GitHub Actions

# 3. Site will be live at:
# https://JanyBlick.github.io/RenovationBudget
```

**Vercel:**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Set environment variables in Vercel dashboard
```

---

## 🐛 Troubleshooting

### Common Issues

**❌ "Insufficient funds"**

```bash
# Get Sepolia ETH from faucets
# - https://sepoliafaucet.com
# - https://faucet.quicknode.com/ethereum/sepolia

# Check balance
npx hardhat run scripts/check-balance.js --network sepolia
```

**❌ "Invalid RPC URL"**

```bash
# Test RPC connectivity
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $SEPOLIA_RPC_URL
```

**❌ "Transaction reverted"**

```typescript
// Enable verbose logging
VERBOSE=true npm test

// Check contract state
const project = await contract.getProjectInfo(projectId);
console.log("Project state:", project);
```

**❌ "MetaMask connection failed"**

```javascript
// Ensure MetaMask is on Sepolia network
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
});
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm test`
5. **Run linting**: `npm run lint`
6. **Commit**: `git commit -m 'Add amazing feature'`
7. **Push**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Code Standards

- ✅ Write tests for new features
- ✅ Maintain >85% coverage
- ✅ Follow existing code style
- ✅ Add comments for complex logic
- ✅ Update documentation

### Pre-commit Checks

All commits automatically run:
- Solidity linting (Solhint)
- JS/TS linting (ESLint)
- Code formatting (Prettier)
- Secret detection
- Contract size check

---

## 🛣️ Roadmap

### ✅ Completed

- [x] Core FHE budget calculation
- [x] Encrypted bidding system
- [x] Sepolia deployment
- [x] Comprehensive testing (75+ tests)
- [x] Security auditing tools
- [x] CI/CD pipeline
- [x] Transaction history

### 🚧 In Progress

- [ ] Slither security analysis
- [ ] Certora formal verification
- [ ] Mobile-responsive improvements

### 📅 Planned

- [ ] Multi-signature project approval
- [ ] Milestone-based payments
- [ ] Contractor rating system
- [ ] IPFS document storage
- [ ] Mainnet deployment
- [ ] L2 deployment (Optimism, Arbitrum)

---

## 📚 Documentation

- 📖 **[TESTING.md](TESTING.md)** - Complete testing guide (75+ tests)
- 📖 **[CI_CD.md](CI_CD.md)** - CI/CD pipeline documentation
- 📖 **[SECURITY_PERFORMANCE.md](SECURITY_PERFORMANCE.md)** - Security & performance guide
- 📖 **[ENV_CONFIGURATION_GUIDE.md](ENV_CONFIGURATION_GUIDE.md)** - Environment configuration
- 📖 **[QUICK_START_CI_CD.md](QUICK_START_CI_CD.md)** - 5-minute CI/CD setup

---

## 🔗 Links

### Project Links

- **Live Demo**: [https://JanyBlick.github.io/RenovationBudget](https://JanyBlick.github.io/RenovationBudget)
- **GitHub**: [https://github.com/JanyBlick/RenovationBudget](https://github.com/JanyBlick/RenovationBudget)
- **Contract**: [0x301258...](https://sepolia.etherscan.io/address/0x301258156b7D06e69A2E116fc8EC574B78D2EA38)

### Zama Resources

- **Zama Documentation**: [https://docs.zama.ai](https://docs.zama.ai)
- **FHEVM Docs**: [https://docs.fhevm.zama.ai](https://docs.fhevm.zama.ai)
- **fhevmjs SDK**: [https://github.com/zama-ai/fhevmjs](https://github.com/zama-ai/fhevmjs)
- **Zama Discord**: [https://discord.com/invite/zama](https://discord.com/invite/zama)

### Ethereum Resources

- **Sepolia Testnet**: [https://sepolia.etherscan.io](https://sepolia.etherscan.io)
- **Sepolia Faucet**: [https://sepoliafaucet.com](https://sepoliafaucet.com)
- **Hardhat Docs**: [https://hardhat.org/docs](https://hardhat.org/docs)
- **Ethers.js Docs**: [https://docs.ethers.org](https://docs.ethers.org)

---

## 🏆 Acknowledgments

Built for the **Zama FHE Challenge** - showcasing practical applications of Fully Homomorphic Encryption in real estate and construction industries.

**Special thanks to:**

- **[Zama](https://www.zama.ai/)** - For pioneering FHE technology and fhEVM
- **[Ethereum](https://ethereum.org/)** - For the blockchain platform
- **[Hardhat](https://hardhat.org/)** - For the development framework
- **The FHE Community** - For guidance and support

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Private Renovation Budget Manager Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support

Need help? Here's how to get support:

- 💬 **GitHub Issues**: [Open an issue](https://github.com/JanyBlick/RenovationBudget/issues)
- 📧 **Email**: support@example.com
- 💭 **Zama Discord**: [Join #fhevm channel](https://discord.com/invite/zama)
- 📖 **Documentation**: Check our [docs folder](./docs)

---

<div align="center">

**Built with ❤️ using Zama's fhEVM technology**

[⭐ Star us on GitHub](https://github.com/JanyBlick/RenovationBudget) | [🐛 Report Bug](https://github.com/JanyBlick/RenovationBudget/issues) | [✨ Request Feature](https://github.com/JanyBlick/RenovationBudget/issues)

</div>
