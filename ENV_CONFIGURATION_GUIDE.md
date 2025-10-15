# 🔧 Environment Configuration Guide

Complete guide for configuring the `env.example.txt` file with PauserSet and all settings.

## 📋 Table of Contents

- [Quick Setup](#quick-setup)
- [Configuration Sections](#configuration-sections)
- [PauserSet Configuration](#pauserset-configuration)
- [Complete Example](#complete-example)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Setup

### 1. Copy Template

```bash
cp env.example.txt .env
```

### 2. Essential Configuration

**Minimum required settings:**

```env
# Network
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Wallet
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# PauserSet (Gateway System)
NUM_PAUSERS=3
PAUSER_ADDRESS_0=0xPAUSER_ADDRESS_1
PAUSER_ADDRESS_1=0xPAUSER_ADDRESS_2
PAUSER_ADDRESS_2=0xPAUSER_ADDRESS_3

# KMS
KMS_GENERATION=1
```

### 3. Verify Configuration

```bash
# Test that environment loads correctly
node -e "require('dotenv').config(); console.log('✅ Environment loaded');"

# Verify required variables
npm run compile
```

## 📦 Configuration Sections

### 1. Network Configuration

**Purpose**: Connect to Ethereum networks

```env
# Sepolia Testnet (Primary)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Alternative Providers
# Alchemy
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Public RPC (not recommended - rate limited)
# SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Mainnet (production - use with caution)
# MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

**How to get RPC URL:**

1. **Infura** (Recommended):
   - Visit [infura.io](https://infura.io)
   - Sign up for free account
   - Create new project
   - Copy Sepolia endpoint: `https://sepolia.infura.io/v3/PROJECT_ID`

2. **Alchemy** (Alternative):
   - Visit [alchemy.com](https://alchemy.com)
   - Create account
   - Create new app (Sepolia network)
   - Copy HTTPS endpoint

### 2. Wallet Configuration

**Purpose**: Deploy contracts and sign transactions

```env
# Private Key (Choose ONE method)
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# OR Mnemonic (Alternative)
# MNEMONIC=word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
```

**⚠️ CRITICAL SECURITY WARNINGS:**
- NEVER commit `.env` file to git
- NEVER share private key with anyone
- NEVER use mainnet private key on testnet
- NEVER screenshot private key
- Use hardware wallet for mainnet

**How to export private key from MetaMask:**

```
1. Open MetaMask extension
2. Click three dots (⋮) next to account
3. Select "Account Details"
4. Click "Export Private Key"
5. Enter MetaMask password
6. Copy private key (starts with 0x)
7. Paste in .env file
8. DELETE from clipboard immediately
```

### 3. PauserSet Configuration (Gateway System)

**Purpose**: Emergency pause mechanism for contract security

```env
# Number of pausers
NUM_PAUSERS=3

# Required: First 3 pausers
PAUSER_ADDRESS_0=0x0000000000000000000000000000000000000000
PAUSER_ADDRESS_1=0x0000000000000000000000000000000000000000
PAUSER_ADDRESS_2=0x0000000000000000000000000000000000000000

# Optional: Additional pausers (if NUM_PAUSERS > 3)
# PAUSER_ADDRESS_3=0x0000000000000000000000000000000000000000
# PAUSER_ADDRESS_4=0x0000000000000000000000000000000000000000
# PAUSER_ADDRESS_5=0x0000000000000000000000000000000000000000
# PAUSER_ADDRESS_6=0x0000000000000000000000000000000000000000
# PAUSER_ADDRESS_7=0x0000000000000000000000000000000000000000
```

**What are Pausers?**

Pausers are trusted addresses that can emergency-pause the contract if:
- Security vulnerability discovered
- Unexpected behavior detected
- Network congestion causing issues
- Planned maintenance required

**How to configure:**

1. **Create Pauser Addresses** (3-5 recommended):
   ```
   Option A: Create new MetaMask accounts
   Option B: Use existing trusted addresses
   Option C: Use hardware wallet addresses
   ```

2. **Set NUM_PAUSERS**:
   ```env
   NUM_PAUSERS=3  # For 3 pausers
   NUM_PAUSERS=5  # For 5 pausers
   ```

3. **Add Addresses**:
   ```env
   PAUSER_ADDRESS_0=0xA1b2C3d4E5F6789012345678901234567890ABCD
   PAUSER_ADDRESS_1=0xB2c3D4e5F6A7890123456789012345678901BCDE
   PAUSER_ADDRESS_2=0xC3d4E5f6A7B8901234567890123456789012CDEF
   ```

**Best Practices:**

✅ **DO:**
- Use DIFFERENT addresses from deployer
- Distribute pauser keys to trusted team members
- Store pauser private keys securely (hardware wallet recommended)
- Test pause functionality on testnet before mainnet
- Keep odd number of pausers (3, 5, 7) for majority voting
- Document who controls each pauser address

❌ **DON'T:**
- Use same address as deployer
- Give all pauser keys to one person
- Store pauser keys in plaintext
- Deploy without testing pause mechanism
- Use exchange addresses as pausers
- Forget to backup pauser keys

**Testing Pausers:**

```bash
# After deployment, test pause functionality
npx hardhat run scripts/test-pause.js --network sepolia
```

### 4. KMS Configuration

**Purpose**: FHE key management and Gateway integration

```env
# KMS Generation
KMS_GENERATION=1
```

**What is KMS?**

KMS (Key Management Service) manages cryptographic keys for FHE operations.

**When to change:**
- Initial deployment: `KMS_GENERATION=1`
- Major KMS update: Increment (e.g., `KMS_GENERATION=2`)
- Never change unless instructed by Zama

### 5. Contract Deployment

**Purpose**: Track deployed contract and enable verification

```env
# Contract Address (auto-filled after deployment)
CONTRACT_ADDRESS=

# Etherscan API Key (for verification)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

**Workflow:**

1. **Before deployment**: Leave `CONTRACT_ADDRESS` empty
2. **Deploy contract**:
   ```bash
   npm run deploy
   ```
3. **Copy address from output**:
   ```
   ✅ Contract deployed to: 0x301258156b7D06e69A2E116fc8EC574B78D2EA38
   ```
4. **Update `.env`**:
   ```env
   CONTRACT_ADDRESS=0x301258156b7D06e69A2E116fc8EC574B78D2EA38
   ```
5. **Get Etherscan API key**:
   - Visit [etherscan.io/myapikey](https://etherscan.io/myapikey)
   - Create free account
   - Generate API key
   - Add to `.env`

6. **Verify contract**:
   ```bash
   npx hardhat verify --network sepolia $CONTRACT_ADDRESS
   ```

### 6. Testing Configuration

**Purpose**: Configure test behavior and gas reporting

```env
# Enable gas reporting
REPORT_GAS=true

# Gas price for estimates (gwei)
GAS_PRICE=50

# CoinMarketCap API for USD conversion
COINMARKETCAP_API_KEY=

# Test timeout (milliseconds)
TEST_TIMEOUT=120000
```

**Gas Reporting:**

```bash
# Run tests with gas report
npm run test:gas

# Output includes:
# - Gas used per function
# - USD cost estimates (if CMC key provided)
# - Average, min, max gas usage
```

**Get CoinMarketCap API Key:**
1. Visit [coinmarketcap.com/api](https://coinmarketcap.com/api/)
2. Sign up for free tier
3. Generate API key
4. Add to `.env`

### 7. Frontend Configuration

**Purpose**: Connect frontend to deployed contract

```env
# Public contract address
VITE_CONTRACT_ADDRESS=

# Network settings
VITE_CHAIN_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
VITE_EXPLORER_URL=https://sepolia.etherscan.io
```

**Setup:**

1. After deploying contract, copy address to both:
   ```env
   CONTRACT_ADDRESS=0x123...
   VITE_CONTRACT_ADDRESS=0x123...
   ```

2. Network IDs:
   - Sepolia: `11155111`
   - Mainnet: `1`
   - Hardhat: `31337`

### 8. Development Tools

**Purpose**: Enable advanced development features

```env
# Hardhat network forking
FORK_ENABLED=false
FORK_BLOCK_NUMBER=

# Debug logging
DEBUG=false
VERBOSE=false
```

**Forking:**

```env
# Enable forking from Sepolia
FORK_ENABLED=true
FORK_BLOCK_NUMBER=5000000

# Now hardhat runs with Sepolia state
npm test
```

### 9. CI/CD Configuration

**Purpose**: Automated testing and deployment

```env
# CI mode
CI=true

# GitHub token (set as repository secret)
# GITHUB_TOKEN=

# Codecov token (set as repository secret)
# CODECOV_TOKEN=
```

**Setup GitHub Secrets:**

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add secrets:
   - `CODECOV_TOKEN`: From codecov.io
   - `PRIVATE_KEY`: For deployment (if automated)
   - `SEPOLIA_RPC_URL`: For testing

### 10. Security Configuration

**Purpose**: Enable security features

```env
# Auto-verify contracts after deployment
AUTO_VERIFY=true

# Safety checks
SAFETY_CHECKS=true

# Require confirmation for mainnet
MAINNET_CONFIRMATION_REQUIRED=true
```

### 11. Performance & Optimization

**Purpose**: Configure compiler optimization

```env
# Optimizer runs (higher = more gas efficient runtime)
OPTIMIZER_RUNS=800

# Enable optimizer
OPTIMIZER_ENABLED=true

# Contract size reporting
CONTRACT_SIZE=false

# Node environment
NODE_ENV=development
```

**Optimization Levels:**

| Runs | Use Case | Deployment Cost | Runtime Cost |
|------|----------|-----------------|--------------|
| 1 | One-time deploy | Minimum | High |
| 200 | Balanced | Medium | Medium |
| 800 | **Our choice** | Higher | Low |
| 10000 | Very frequent calls | Maximum | Minimum |

### 12. Monitoring & Analytics

**Purpose**: Production monitoring (optional)

```env
# Tenderly (transaction monitoring)
# TENDERLY_PROJECT=
# TENDERLY_USERNAME=

# OpenZeppelin Defender (automation)
# DEFENDER_API_KEY=
# DEFENDER_API_SECRET=
```

## 📋 Complete Example

**Production-ready `.env` configuration:**

```env
# ========================================
# Network Configuration
# ========================================
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456ghi789jkl

# ========================================
# Wallet Configuration
# ========================================
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# ========================================
# PauserSet Configuration (Gateway System)
# ========================================
NUM_PAUSERS=3
PAUSER_ADDRESS_0=0xA1b2C3d4E5F6789012345678901234567890ABCD
PAUSER_ADDRESS_1=0xB2c3D4e5F6A7890123456789012345678901BCDE
PAUSER_ADDRESS_2=0xC3d4E5f6A7B8901234567890123456789012CDEF

# ========================================
# KMS Configuration
# ========================================
KMS_GENERATION=1

# ========================================
# Contract Deployment
# ========================================
CONTRACT_ADDRESS=0x301258156b7D06e69A2E116fc8EC574B78D2EA38
ETHERSCAN_API_KEY=ABCDEFGHIJK123456789

# ========================================
# Testing Configuration
# ========================================
REPORT_GAS=true
GAS_PRICE=50
COINMARKETCAP_API_KEY=your-cmc-api-key-here
TEST_TIMEOUT=120000

# ========================================
# Frontend Configuration
# ========================================
VITE_CONTRACT_ADDRESS=0x301258156b7D06e69A2E116fc8EC574B78D2EA38
VITE_CHAIN_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_RPC_URL=https://sepolia.infura.io/v3/abc123def456ghi789jkl
VITE_EXPLORER_URL=https://sepolia.etherscan.io

# ========================================
# Security Configuration
# ========================================
AUTO_VERIFY=true
SAFETY_CHECKS=true
MAINNET_CONFIRMATION_REQUIRED=true

# ========================================
# Performance & Optimization
# ========================================
OPTIMIZER_RUNS=800
OPTIMIZER_ENABLED=true
CONTRACT_SIZE=false
NODE_ENV=production
```

## 🔒 Security Best Practices

### 1. `.env` File Security

```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore

# Verify .env is not tracked
git status

# If accidentally committed, remove from git
git rm --cached .env
git commit -m "Remove .env from tracking"
```

### 2. Private Key Security

**DO:**
- ✅ Use different keys for testnet and mainnet
- ✅ Use hardware wallet for mainnet
- ✅ Rotate keys periodically
- ✅ Backup keys securely (encrypted)
- ✅ Use environment variables in CI/CD

**DON'T:**
- ❌ Commit private keys to git
- ❌ Share keys via email/chat
- ❌ Store keys in plaintext
- ❌ Use same key across projects
- ❌ Screenshot private keys

### 3. PauserSet Security

```env
# Good: Different addresses with distributed control
PAUSER_ADDRESS_0=0xTeamMember1...  # Alice (hardware wallet)
PAUSER_ADDRESS_1=0xTeamMember2...  # Bob (hardware wallet)
PAUSER_ADDRESS_2=0xTeamMember3...  # Charlie (hardware wallet)

# Bad: Same address or deployer
# PAUSER_ADDRESS_0=0xDeployer...  # ❌ Don't use deployer
# PAUSER_ADDRESS_1=0xDeployer...  # ❌ Don't repeat
```

### 4. Verification

```bash
# Checklist before deployment
□ .env exists and configured
□ SEPOLIA_RPC_URL is valid
□ PRIVATE_KEY is correct (0x prefix)
□ NUM_PAUSERS matches number of addresses
□ All PAUSER_ADDRESS_X are unique
□ KMS_GENERATION is set
□ .env is in .gitignore
□ No secrets in code
```

## 🐛 Troubleshooting

### Issue: "Cannot read environment variable"

**Solution:**
```bash
# Ensure .env exists
ls -la .env

# Check syntax
cat .env | grep "=" | wc -l

# Test loading
node -e "require('dotenv').config(); console.log(process.env.SEPOLIA_RPC_URL);"
```

### Issue: "Invalid RPC URL"

**Solution:**
```bash
# Test RPC connectivity
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $SEPOLIA_RPC_URL

# Should return: {"jsonrpc":"2.0","id":1,"result":"0x..."}
```

### Issue: "Insufficient funds"

**Solution:**
```bash
# Check balance
npx hardhat run scripts/check-balance.js --network sepolia

# Get testnet ETH from faucets:
# - https://sepoliafaucet.com
# - https://faucet.quicknode.com/ethereum/sepolia
```

### Issue: "Invalid pauser address"

**Solution:**
```env
# Ensure addresses are valid Ethereum addresses
# Must start with 0x
# Must be 42 characters total (0x + 40 hex chars)

# Good
PAUSER_ADDRESS_0=0xA1b2C3d4E5F6789012345678901234567890ABCD

# Bad
PAUSER_ADDRESS_0=A1b2C3d4E5F6789012345678901234567890ABCD  # Missing 0x
PAUSER_ADDRESS_0=0xA1b2C3d4  # Too short
```

### Issue: "NUM_PAUSERS mismatch"

**Solution:**
```env
# NUM_PAUSERS must match number of addresses

# If NUM_PAUSERS=3, you need:
NUM_PAUSERS=3
PAUSER_ADDRESS_0=0x...
PAUSER_ADDRESS_1=0x...
PAUSER_ADDRESS_2=0x...

# If NUM_PAUSERS=5, you need:
NUM_PAUSERS=5
PAUSER_ADDRESS_0=0x...
PAUSER_ADDRESS_1=0x...
PAUSER_ADDRESS_2=0x...
PAUSER_ADDRESS_3=0x...
PAUSER_ADDRESS_4=0x...
```

## 📚 Additional Resources

- **Infura Setup**: [https://docs.infura.io](https://docs.infura.io)
- **Alchemy Setup**: [https://docs.alchemy.com](https://docs.alchemy.com)
- **MetaMask Guide**: [https://metamask.io/faqs/](https://metamask.io/faqs/)
- **Etherscan API**: [https://docs.etherscan.io](https://docs.etherscan.io)
- **Hardhat Config**: [https://hardhat.org/config/](https://hardhat.org/config/)

---

**Last Updated**: 2025-10-18
**Version**: 2.1.0
**Configuration Complexity**: ⭐⭐⭐ (Medium)

**Need Help?** Review the [README.md](README.md) for more information.
