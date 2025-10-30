# 🔄 CI/CD Documentation

Comprehensive guide for the Continuous Integration/Continuous Deployment pipeline of the Private Renovation Budget Manager.

## 📋 Table of Contents

- [Overview](#overview)
- [Workflow Architecture](#workflow-architecture)
- [Setup Instructions](#setup-instructions)
- [Jobs Breakdown](#jobs-breakdown)
- [Code Quality Tools](#code-quality-tools)
- [Coverage Configuration](#coverage-configuration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🎯 Overview

The CI/CD pipeline provides automated testing, code quality checks, and deployment verification for every code change.

### Key Features

- ✅ **Automated Testing** - 75+ tests run on every push
- ✅ **Multi-Version Support** - Tests on Node.js 18.x and 20.x
- ✅ **Code Quality** - Solhint linting for Solidity
- ✅ **Coverage Tracking** - Codecov integration with 85% target
- ✅ **Gas Analysis** - Automatic gas reports on PRs
- ✅ **Security Audits** - npm vulnerability scanning
- ✅ **Build Verification** - Contract compilation checks

### Pipeline Triggers

```yaml
Triggers:
  - push:
      branches: [main, develop, feature/*, hotfix/*]
  - pull_request:
      branches: [main, develop]
  - workflow_dispatch (manual)
```

## 🏗️ Workflow Architecture

### Job Dependency Graph

```
┌─────────────────┐
│  Code Quality   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ Tests  │ │ Coverage │
└───┬────┘ └────┬─────┘
    │           │
    └─────┬─────┘
          │
          ▼
    ┌──────────┐
    │  Build   │
    └────┬─────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│Gas Rpt  │ │ Security │
└────┬────┘ └────┬─────┘
     │           │
     └─────┬─────┘
           │
           ▼
     ┌──────────┐
     │  Status  │
     └──────────┘
```

### Pipeline Stages

| Stage | Duration | Purpose |
|-------|----------|---------|
| Quality Check | ~30s | Lint Solidity code |
| Unit Tests | ~2-3min | Run test suite (2 versions) |
| Coverage | ~3-4min | Generate coverage report |
| Build | ~1-2min | Compile contracts |
| Gas Report | ~2-3min | Analyze gas usage |
| Security | ~30s | Audit dependencies |
| Status | ~10s | Final verification |

**Total Duration**: 5-8 minutes

## 🔧 Setup Instructions

### Prerequisites

- GitHub repository with admin access
- Codecov account (free for open source)
- Node.js 18.x or 20.x installed locally

### Step 1: Enable GitHub Actions

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Actions** → **General**
3. Under "Actions permissions", select:
   - ✅ **Allow all actions and reusable workflows**
4. Click **Save**

### Step 2: Configure Codecov

#### 2.1 Create Codecov Account

1. Visit [codecov.io](https://codecov.io)
2. Click **Sign up** → **Sign in with GitHub**
3. Authorize Codecov to access your repositories

#### 2.2 Add Repository to Codecov

1. In Codecov dashboard, click **Add a repository**
2. Find and select your repository
3. Copy the **CODECOV_TOKEN** from the setup page

#### 2.3 Add Secret to GitHub

1. In GitHub repository: **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Create secret:
   - **Name**: `CODECOV_TOKEN`
   - **Value**: Paste your Codecov token
4. Click **Add secret**

### Step 3: Install Dependencies Locally

```bash
# Install all development dependencies
npm install

# Verify Solhint is installed
npx solhint --version

# Verify Prettier is installed
npx prettier --version
```

### Step 4: Test Workflow Locally

```bash
# Run linting
npm run lint:sol

# Run tests
npm test

# Generate coverage
npm run coverage

# Run full CI suite
npm run ci
```

### Step 5: Push to GitHub

```bash
git add .
git commit -m "Enable CI/CD pipeline"
git push origin main
```

### Step 6: Verify Workflow Execution

1. Go to **Actions** tab in your repository
2. You should see the "Test Suite" workflow running
3. Click on the workflow to view progress
4. Wait for all jobs to complete (green checkmarks)

## 📊 Jobs Breakdown

### Job 1: Code Quality

**Purpose**: Lint Solidity code with Solhint

```yaml
Runs on: ubuntu-latest
Node version: 20.x
Duration: ~30 seconds
Dependencies: None (runs first)
```

**What it does:**
1. Checks out repository
2. Sets up Node.js with cache
3. Installs dependencies
4. Runs `npm run lint:sol`
5. Fails if linting errors found

**Local equivalent:**
```bash
npm run lint:sol
```

### Job 2: Unit Tests

**Purpose**: Run comprehensive test suite

```yaml
Runs on: ubuntu-latest
Node versions: 18.x, 20.x (matrix)
Duration: ~2-3 minutes per version
Dependencies: Code Quality
```

**What it does:**
1. Checks out repository
2. Sets up Node.js (both versions)
3. Installs dependencies
4. Compiles contracts
5. Runs 75+ tests
6. Reports results

**Local equivalent:**
```bash
npm test
```

**Matrix Strategy:**
- Tests run in parallel on both Node versions
- If one version fails, the other continues
- Both must pass for job to succeed

### Job 3: Coverage Analysis

**Purpose**: Generate and upload coverage report

```yaml
Runs on: ubuntu-latest
Node version: 20.x
Duration: ~3-4 minutes
Dependencies: Code Quality
```

**What it does:**
1. Checks out repository
2. Sets up Node.js
3. Installs dependencies
4. Compiles contracts
5. Runs `npm run coverage`
6. Generates LCOV report
7. Uploads to Codecov

**Local equivalent:**
```bash
npm run coverage
```

**Coverage Targets:**
- Statements: 85%
- Branches: 80%
- Functions: 90%
- Lines: 85%

### Job 4: Gas Report

**Purpose**: Analyze gas usage

```yaml
Runs on: ubuntu-latest
Node version: 20.x
Duration: ~2-3 minutes
Dependencies: Tests
Condition: Only on pull requests
```

**What it does:**
1. Checks out repository
2. Sets up Node.js
3. Installs dependencies
4. Compiles contracts
5. Runs tests with gas reporting
6. Displays gas usage

**Local equivalent:**
```bash
npm run test:gas
```

**When it runs:**
- Only on pull requests (not direct pushes)
- Helps review gas cost changes

### Job 5: Build Verification

**Purpose**: Verify contract compilation

```yaml
Runs on: ubuntu-latest
Node version: 20.x
Duration: ~1-2 minutes
Dependencies: Tests
```

**What it does:**
1. Checks out repository
2. Sets up Node.js
3. Installs dependencies
4. Compiles contracts
5. Generates TypeChain types
6. Verifies artifacts exist
7. Uploads artifacts (7-day retention)

**Local equivalent:**
```bash
npm run compile
npm run typechain
```

### Job 6: Security Audit

**Purpose**: Check for vulnerabilities

```yaml
Runs on: ubuntu-latest
Node version: 20.x
Duration: ~30 seconds
Dependencies: None (parallel)
```

**What it does:**
1. Checks out repository
2. Sets up Node.js
3. Runs `npm audit`
4. Reports vulnerabilities (moderate+)

**Local equivalent:**
```bash
npm audit
```

### Job 7: Status Check

**Purpose**: Final verification

```yaml
Runs on: ubuntu-latest
Duration: ~10 seconds
Dependencies: All previous jobs
Condition: always() - runs even if others fail
```

**What it does:**
1. Checks results of all jobs
2. Displays summary
3. Exits with success/failure

## 🎨 Code Quality Tools

### Solhint Configuration

**File**: `solhint.json`

**Rules Applied:**
- Compiler version: ^0.8.0
- Max line length: 120 characters
- String quotes: Double quotes
- Function visibility: Required
- Import ordering: Enforced
- Naming conventions: mixedCase

**Running Solhint:**

```bash
# Lint all Solidity files
npm run lint:sol

# Auto-fix issues
npm run lint:fix

# Lint specific file
npx solhint contracts/YourContract.sol
```

**Ignored Files:**
- node_modules/
- artifacts/
- cache/
- coverage/
- typechain-types/

### Prettier Configuration

**File**: `prettierrc.json`

**Solidity Settings:**
- Print width: 120 characters
- Tab width: 4 spaces
- Use tabs: false
- Quotes: Double
- Explicit types: always

**TypeScript/JavaScript Settings:**
- Print width: 100 characters
- Tab width: 2 spaces
- Semi: true
- Single quotes: true
- Trailing comma: es5

**Running Prettier:**

```bash
# Check formatting
npm run format:check

# Format all files
npm run format

# Format specific file
npx prettier --write contracts/YourContract.sol
```

## 📈 Coverage Configuration

### Codecov Setup

**File**: `codecov.yml`

**Project Coverage:**
- Target: 85%
- Threshold: 2% (allows 2% drop)
- Status: Required (blocks PRs if fails)

**Patch Coverage (New Code):**
- Target: 80%
- Threshold: 5%
- Only on PRs: true

**Ignored Paths:**
- test/**/*
- scripts/**/*
- migrations/**/*
- coverage/**/*
- *.config.js
- hardhat.config.ts

**Comment Format:**
```
header: Summary statistics
diff: Line-by-line coverage changes
files: File coverage breakdown
footer: Additional info
```

### Viewing Coverage Reports

**On Codecov.io:**
1. Go to [codecov.io](https://codecov.io)
2. Select your repository
3. View coverage dashboard
4. Explore file-by-file breakdown

**On Pull Requests:**
1. Codecov bot posts comment with coverage changes
2. Shows overall coverage change
3. Lists files with coverage changes
4. Links to full report

**Locally:**
```bash
# Generate coverage
npm run coverage

# Open HTML report
# On Windows:
start coverage/index.html

# On macOS:
open coverage/index.html

# On Linux:
xdg-open coverage/index.html
```

## 🐛 Troubleshooting

### Tests Pass Locally But Fail in CI

**Possible Causes:**
1. Node.js version mismatch
2. Environment variables not set
3. Network-dependent tests
4. Race conditions
5. File system differences

**Solutions:**

```bash
# Check Node version locally
node --version

# Test with CI Node versions
nvm install 18
nvm use 18
npm test

nvm install 20
nvm use 20
npm test

# Run tests in clean environment
rm -rf node_modules
npm ci
npm test
```

### Codecov Upload Fails

**Possible Causes:**
1. CODECOV_TOKEN not set
2. Coverage file not generated
3. Network issues
4. Codecov service down

**Solutions:**

```bash
# Verify token is set
# In GitHub: Settings → Secrets → Actions
# Check CODECOV_TOKEN exists

# Verify coverage file locally
npm run coverage
ls -la coverage/lcov.info

# Check Codecov status
# Visit: https://status.codecov.com
```

### Solhint Linting Errors

**Common Issues:**
1. Line too long (>120 chars)
2. Wrong quote style
3. Missing visibility modifier
4. Imports not at top

**Solutions:**

```bash
# Auto-fix many issues
npm run lint:fix

# Check specific file
npx solhint contracts/YourContract.sol --fix

# Disable specific rule (use sparingly)
// solhint-disable-next-line rule-name
uint256 public value;
```

### Gas Report Not Appearing

**Possible Causes:**
1. Not running on pull request
2. Gas reporter not configured
3. Tests failing

**Solutions:**

```bash
# Gas reports only run on PRs
# Create PR to see gas report

# Test locally
npm run test:gas

# Check gas reporter config in hardhat.config.ts
```

### Build Artifacts Missing

**Possible Causes:**
1. Compilation errors
2. Syntax errors in contracts
3. Missing dependencies

**Solutions:**

```bash
# Clean and rebuild
npm run clean
npm run compile

# Check for errors
npx hardhat compile --verbose

# Verify artifacts
ls -la artifacts/contracts
```

## 📝 Best Practices

### For Developers

**Before Pushing Code:**

```bash
# Run pre-commit checks
npm run precommit

# Or run full CI suite
npm run ci

# Quick check (faster)
npm run ci:quick
```

**Writing Tests:**
- ✅ Write tests for all new features
- ✅ Test edge cases and error conditions
- ✅ Maintain coverage above 85%
- ✅ Use descriptive test names
- ✅ Keep tests independent

**Code Quality:**
- ✅ Run linter before committing
- ✅ Fix warnings, not just errors
- ✅ Follow naming conventions
- ✅ Add comments for complex logic
- ✅ Keep functions small and focused

### For Reviewers

**Reviewing Pull Requests:**

1. **Check CI Status**
   - ✅ All jobs must be green
   - ✅ Review failed jobs if red
   - ✅ Don't approve with failures

2. **Review Coverage**
   - ✅ Check Codecov comment
   - ✅ Ensure new code is tested
   - ✅ Verify coverage doesn't drop

3. **Review Gas Changes**
   - ✅ Check gas report in PR
   - ✅ Verify gas increases are justified
   - ✅ Suggest optimizations if needed

4. **Check Security**
   - ✅ Review npm audit results
   - ✅ Check for new vulnerabilities
   - ✅ Verify dependencies are safe

### For Maintainers

**Regular Maintenance:**

```bash
# Update dependencies monthly
npm outdated
npm update

# Check for security issues
npm audit
npm audit fix

# Update GitHub Actions
# Edit github-workflows/test.yml
# Update action versions (e.g., actions/checkout@v4)
```

**Monitoring:**
- ✅ Monitor coverage trends on Codecov
- ✅ Review failed workflows promptly
- ✅ Keep CI configuration updated
- ✅ Respond to Dependabot alerts

**Optimizing CI:**
- ✅ Use caching for faster builds
- ✅ Run jobs in parallel when possible
- ✅ Skip unnecessary jobs on non-PR pushes
- ✅ Keep workflow files clean and documented

## 📚 Additional Resources

### Documentation

- **GitHub Actions**: [https://docs.github.com/en/actions](https://docs.github.com/en/actions)
- **Codecov**: [https://docs.codecov.com](https://docs.codecov.com)
- **Solhint**: [https://github.com/protofire/solhint](https://github.com/protofire/solhint)
- **Prettier**: [https://prettier.io/docs](https://prettier.io/docs)
- **Hardhat**: [https://hardhat.org/docs](https://hardhat.org/docs)

### Examples

- **Workflow Examples**: [https://github.com/actions/starter-workflows](https://github.com/actions/starter-workflows)
- **Codecov Examples**: [https://github.com/codecov/codecov-action](https://github.com/codecov/codecov-action)

### Community

- **GitHub Actions Community**: [https://github.community/c/actions](https://github.community/c/actions)
- **Hardhat Discord**: [https://hardhat.org/discord](https://hardhat.org/discord)

---

**Last Updated**: 2025-10-18
**Pipeline Version**: 1.0
**Maintained by**: Private Renovation Budget Manager Team
