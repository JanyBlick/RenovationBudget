# 🔒 Security & Performance Guide

Comprehensive guide for security auditing and performance optimization in the Private Renovation Budget Manager.

## 📋 Table of Contents

- [Security Overview](#security-overview)
- [Security Toolchain](#security-toolchain)
- [Performance Optimization](#performance-optimization)
- [DoS Protection](#dos-protection)
- [Gas Optimization](#gas-optimization)
- [Best Practices](#best-practices)
- [Monitoring & Auditing](#monitoring--auditing)

## 🛡️ Security Overview

### Security Layers

```
┌─────────────────────────────────────────┐
│    Left-Shift Security Strategy         │
├─────────────────────────────────────────┤
│  1. Pre-commit Hooks (Husky)            │
│     ├─ Solidity linting                 │
│     ├─ TypeScript/JS linting            │
│     ├─ Code formatting                  │
│     ├─ Secret detection                 │
│     └─ Contract size check              │
├─────────────────────────────────────────┤
│  2. Pre-push Checks                     │
│     ├─ Full test suite (75+ tests)      │
│     ├─ Security audit                   │
│     └─ Build verification               │
├─────────────────────────────────────────┤
│  3. CI/CD Pipeline                      │
│     ├─ Multi-version testing            │
│     ├─ Coverage reporting               │
│     ├─ Gas analysis                     │
│     └─ Automated security scans         │
├─────────────────────────────────────────┤
│  4. Daily Security Audits               │
│     ├─ Dependency scanning              │
│     ├─ Secret detection                 │
│     ├─ Solidity security analysis       │
│     └─ DoS protection checks            │
└─────────────────────────────────────────┘
```

### Security Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Test Coverage** | >85% | TBD | 🎯 |
| **Known Vulnerabilities** | 0 | 0 | ✅ |
| **Secret Exposure** | 0 | 0 | ✅ |
| **Gas Efficiency** | Optimized | 800 runs | ✅ |
| **Contract Size** | <24KB | TBD | 🎯 |

## 🔧 Security Toolchain

### Complete Tool Stack

```
Solidity Layer:
  ├─ solhint (linting)
  ├─ hardhat (compilation)
  ├─ optimizer (gas efficiency)
  └─ contract-sizer (size check)

JavaScript/TypeScript Layer:
  ├─ eslint (linting)
  ├─ @typescript-eslint (TS rules)
  ├─ eslint-plugin-security (security rules)
  ├─ eslint-plugin-no-secrets (secret detection)
  └─ prettier (formatting)

Pre-commit Layer:
  ├─ husky (git hooks)
  ├─ lint-staged (changed files)
  └─ detect-secrets (secret scan)

CI/CD Layer:
  ├─ GitHub Actions (automation)
  ├─ codecov (coverage)
  ├─ npm audit (vulnerabilities)
  └─ gas-reporter (gas analysis)
```

### 1. ESLint Security Configuration

**File**: `eslintrc.json`

**Security Rules Enabled:**

```javascript
// Prevent dangerous patterns
"no-eval": "error"                    // No eval()
"no-implied-eval": "error"            // No implied eval
"no-new-func": "error"                // No Function constructor
"security/detect-eval-with-expression": "error"

// Buffer security
"security/detect-buffer-noassert": "error"
"security/detect-unsafe-regex": "error"

// Timing attack prevention
"security/detect-possible-timing-attacks": "warn"

// Secret detection
"no-secrets/no-secrets": "error"
```

**Run ESLint:**
```bash
npm run lint:js          # Lint JS/TS files
npm run lint:js:fix      # Auto-fix issues
```

### 2. Solhint Security Configuration

**File**: `solhint.json`

**Security Rules:**
- Compiler version enforcement: `^0.8.0`
- Visibility requirements
- Re-entrancy awareness
- Gas limit considerations

**Run Solhint:**
```bash
npm run lint:sol         # Lint Solidity
npm run lint:sol:fix     # Auto-fix issues
```

### 3. Husky Pre-commit Hooks

**Location**: `husky-hooks/pre-commit`

**Checks Performed:**
1. ✅ Solidity linting (Solhint)
2. ✅ JavaScript/TypeScript linting (ESLint)
3. ✅ Code formatting (Prettier)
4. ✅ Secret detection
5. ✅ Contract size check

**Setup:**
```bash
# Install Husky
npm install

# Initialize hooks
npm run prepare

# Test hooks
git add .
git commit -m "Test hooks"
```

**Bypass (emergency only):**
```bash
git commit --no-verify -m "Emergency fix"
```

### 4. Secret Detection

**Tool**: `detect-secrets-launcher`

**Scans for:**
- Private keys (Ethereum, SSH)
- API keys
- Passwords
- Tokens
- Credentials

**Run manually:**
```bash
npm run check:secrets
```

**Create baseline:**
```bash
npx detect-secrets-launcher --scan > .secrets.baseline
```

## ⚡ Performance Optimization

### Compiler Optimization

**Configuration** (`hardhat.config.js`):

```javascript
optimizer: {
  enabled: true,
  runs: 800,  // Balanced: deployment + runtime
  details: {
    peephole: true,           // Peephole optimization
    inliner: true,            // Function inlining
    jumpdestRemover: true,    // Remove unused jumpdests
    orderLiterals: true,      // Order literals
    deduplicate: true,        // Remove duplicate code
    cse: true,               // Common subexpression elimination
    constantOptimizer: true,  // Optimize constants
    yul: true,               // Enable Yul optimizer
    yulDetails: {
      stackAllocation: true,
      optimizerSteps: "dhfoDgvulfnTUtnIf"
    }
  }
}
```

**Optimization Strategies:**

| Runs | Best For | Trade-off |
|------|----------|-----------|
| 1 | One-time deploy | Cheap deployment, expensive calls |
| 200 | Balanced | Moderate both |
| 800 | Frequent calls | **← Our choice** |
| 10000 | Very frequent | Expensive deployment |

**Change optimization:**
```bash
# Set in .env
OPTIMIZER_RUNS=800

# Or run with custom value
OPTIMIZER_RUNS=1000 npm run compile
```

### Gas Optimization

**Gas Reporter Configuration:**

```javascript
gasReporter: {
  enabled: REPORT_GAS,
  currency: "USD",
  gasPrice: 50,              // gwei
  coinmarketcap: API_KEY,    // For USD conversion
  showTimeSpent: true,
  showMethodSig: true
}
```

**Run gas analysis:**
```bash
npm run test:gas           # Basic gas report
npm run test:performance   # Full performance test
```

**Gas Optimization Techniques:**

1. **Use `uint256` over smaller types**
   ```solidity
   // ✅ Good (cheaper)
   uint256 public value;

   // ❌ Avoid (more expensive due to packing)
   uint8 public smallValue;
   ```

2. **Cache storage variables**
   ```solidity
   // ✅ Good
   uint256 cached = storageVar;
   result = cached + cached + cached;

   // ❌ Avoid (3 SLOADs)
   result = storageVar + storageVar + storageVar;
   ```

3. **Use `calldata` for read-only parameters**
   ```solidity
   // ✅ Good (no copy)
   function process(uint256[] calldata data) external {

   // ❌ Avoid (copies to memory)
   function process(uint256[] memory data) external {
   ```

4. **Batch operations**
   ```solidity
   // ✅ Good (1 transaction)
   function batchProcess(uint256[] calldata ids) external {

   // ❌ Avoid (multiple transactions)
   function process(uint256 id) external {
   ```

### Contract Size Optimization

**EIP-170 Limit**: 24,576 bytes (24KB)

**Check contract size:**
```bash
npm run check:size
```

**Size reduction techniques:**

1. **Use libraries for common functions**
2. **Split large contracts**
3. **Remove unused code**
4. **Optimize string literals**
5. **Use error codes instead of strings**

```solidity
// ✅ Good (2 bytes)
revert Unauthorized();

// ❌ Avoid (58 bytes)
revert("Only contract owner can call this function");
```

## 🛡️ DoS Protection

### Gas Limits

**Block Gas Limit**: ~30M gas
**Safe Function Limit**: <1M gas
**Warning Threshold**: >500K gas

**Gas configuration** (`hardhat.config.js`):

```javascript
networks: {
  sepolia: {
    gas: "auto",
    gasPrice: "auto",
    gasMultiplier: 1.2,  // 20% buffer
    timeout: 120000      // 2 minutes
  },
  hardhat: {
    gas: 12000000,
    blockGasLimit: 12000000
  }
}
```

### DoS Prevention Patterns

1. **Limit array iterations**
   ```solidity
   // ✅ Good (bounded)
   function processFirst10(uint256[] memory data) external {
     uint256 limit = data.length > 10 ? 10 : data.length;
     for (uint256 i = 0; i < limit; i++) {
       // Process
     }
   }

   // ❌ Avoid (unbounded)
   function processAll(uint256[] memory data) external {
     for (uint256 i = 0; i < data.length; i++) {
       // Could run out of gas
     }
   }
   ```

2. **Use pull over push for payments**
   ```solidity
   // ✅ Good (pull pattern)
   function withdraw() external {
     uint256 amount = balances[msg.sender];
     balances[msg.sender] = 0;
     payable(msg.sender).transfer(amount);
   }

   // ❌ Avoid (push pattern - can fail)
   function distributeAll() external {
     for (uint256 i = 0; i < recipients.length; i++) {
       payable(recipients[i]).transfer(amounts[i]);
     }
   }
   ```

3. **Implement circuit breakers**
   ```solidity
   bool public paused;

   modifier whenNotPaused() {
     require(!paused, "Contract is paused");
     _;
   }

   function pause() external onlyOwner {
     paused = true;
   }
   ```

### Attack Surface Reduction

**Code Splitting Benefits:**
- ✅ Smaller contracts = easier auditing
- ✅ Reduced complexity per contract
- ✅ Isolated vulnerability impact
- ✅ Faster loading in frontend

**Our implementation:**
```
contracts/
  ├─ PrivateRenovationBudget.sol (main logic)
  ├─ AccessControl (separate)
  └─ PauserSet (separate)
```

## 📊 Performance Monitoring

### Real-time Gas Monitoring

**Setup gas alerts:**

```javascript
// In test files
it("should use reasonable gas", async function () {
  const tx = await contract.functionName();
  const receipt = await tx.wait();

  // Assert gas usage
  expect(receipt?.gasUsed).to.be.lt(500000n);
});
```

### Performance Metrics

**Track these metrics:**

| Metric | Tool | Frequency |
|--------|------|-----------|
| **Gas per function** | gas-reporter | Every test run |
| **Contract size** | contract-sizer | Every compile |
| **Test execution time** | Mocha | Every test run |
| **Coverage** | solidity-coverage | Every coverage run |
| **Build time** | CI/CD | Every push |

### Continuous Monitoring

**GitHub Actions monitors:**
1. Gas usage on every PR
2. Contract size on every build
3. Performance tests daily
4. Security scans daily

**View reports:**
```bash
# Local reports
npm run test:gas              # Gas report
npm run check:size            # Size report
npm run test:performance      # Full performance

# CI reports
# Go to: Actions → Security Audit → Artifacts
```

## ✅ Best Practices

### Development Workflow

**Before coding:**
```bash
git checkout -b feature/my-feature
```

**During coding:**
```bash
# Run frequently
npm run lint                  # Check code quality
npm run format                # Format code
npm test                      # Run tests
```

**Before committing:**
```bash
npm run precommit             # Pre-commit checks
# Husky will run automatically
git add .
git commit -m "Add feature"
```

**Before pushing:**
```bash
npm run ci:quick              # Quick CI check
git push origin feature/my-feature
```

**Security checklist:**
- ✅ No `eval()` or `new Function()`
- ✅ No hardcoded secrets
- ✅ Input validation on all functions
- ✅ Gas limits considered
- ✅ Re-entrancy protection
- ✅ Access control implemented
- ✅ Events emitted for state changes

### Code Review Checklist

**For reviewers:**

```markdown
Security:
- [ ] No vulnerabilities introduced
- [ ] Access control correct
- [ ] Input validation present
- [ ] No secret exposure

Performance:
- [ ] Gas usage acceptable
- [ ] Contract size within limits
- [ ] No unbounded loops
- [ ] Optimization appropriate

Quality:
- [ ] Tests added/updated
- [ ] Coverage maintained (>85%)
- [ ] Documentation updated
- [ ] Code formatted correctly
```

## 🚨 Incident Response

### If vulnerability found:

1. **Don't panic** - Most issues are caught early
2. **Assess severity**:
   - **Critical**: Pause contract immediately
   - **High**: Fix and deploy ASAP
   - **Medium**: Fix in next release
   - **Low**: Fix when convenient

3. **Response steps**:
```bash
# If contract is deployed and vulnerability is critical:
# 1. Pause contract (if pause mechanism available)
# 2. Notify users
# 3. Fix vulnerability
# 4. Audit fix
# 5. Deploy patched version
# 6. Resume operations

# If in development:
# 1. Fix issue
# 2. Add test for vulnerability
# 3. Run full test suite
# 4. Security audit
# 5. Continue development
```

### Security contacts:

- **GitHub Security**: Use Security tab → Report vulnerability
- **Team**: [security@example.com](mailto:security@example.com)
- **Community**: [Discord/Telegram]

## 📚 Additional Resources

### Tools Documentation

- **Hardhat**: [https://hardhat.org/docs](https://hardhat.org/docs)
- **Solhint**: [https://protofire.github.io/solhint/](https://protofire.github.io/solhint/)
- **ESLint**: [https://eslint.org/docs](https://eslint.org/docs)
- **Prettier**: [https://prettier.io/docs](https://prettier.io/docs)
- **Husky**: [https://typicode.github.io/husky/](https://typicode.github.io/husky/)

### Security Resources

- **Consensys Best Practices**: [https://consensys.github.io/smart-contract-best-practices/](https://consensys.github.io/smart-contract-best-practices/)
- **OpenZeppelin**: [https://docs.openzeppelin.com/](https://docs.openzeppelin.com/)
- **OWASP**: [https://owasp.org/](https://owasp.org/)

### Performance Resources

- **Solidity Gas Optimization**: [https://gist.github.com/hrkrshnn/ee8fabd532058307229d65dcd5836ddc](https://gist.github.com/hrkrshnn/ee8fabd532058307229d65dcd5836ddc)
- **EIP-170**: [https://eips.ethereum.org/EIPS/eip-170](https://eips.ethereum.org/EIPS/eip-170)

---

**Last Updated**: 2025-10-18
**Version**: 1.0
**Maintained by**: Private Renovation Budget Manager Security Team

**Security Level**: 🔒🔒🔒🔒 (High)
**Performance Level**: ⚡⚡⚡⚡ (Optimized)
