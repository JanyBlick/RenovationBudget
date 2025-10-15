# 🧪 Testing Documentation

Comprehensive testing suite for the Private Renovation Budget Manager smart contract.

## 📊 Test Coverage Overview

- **Total Test Cases**: 75+
- **Main Test Suite**: 62 tests (Mock environment)
- **Sepolia Test Suite**: 13 tests (Live testnet)
- **Coverage Areas**: Deployment, Access Control, Core Functionality, Edge Cases, Gas Optimization

## 🎯 Test Categories

### 1. Deployment and Initialization (5 tests)
- Contract deployment verification
- Owner assignment
- KMS generation initialization
- Project ID initialization
- Pause state verification

### 2. Pauser Management (8 tests)
- Pauser registration
- Pauser count tracking
- Adding new pausers
- Removing pausers
- Permission validation
- Duplicate prevention
- Zero address prevention

### 3. Pause/Unpause Functionality (6 tests)
- Contract pause mechanism
- Contract unpause mechanism
- Authorization checks
- Operation blocking when paused
- State recovery after unpause

### 4. Contractor Verification (6 tests)
- Contractor verification process
- Owner-only access control
- Event emission
- Duplicate prevention
- Verification state persistence

### 5. Project Creation (7 tests)
- Project creation workflow
- Event emission
- ID incrementing
- Owner initialization
- State initialization

### 6. Room Requirements (8 tests)
- Adding room specifications
- Homeowner-only access
- Multiple room support
- Boundary value handling
- Event emission

### 7. Budget Calculation (6 tests)
- Budget calculation process
- Contingency percentage handling
- Authorization checks
- Duplicate prevention
- Edge case validation

### 8. Contractor Bidding (7 tests)
- Bid submission
- Contractor verification requirement
- Multiple bid support
- Bid tracking
- Event emission

### 9. Project Approval (6 tests)
- Project approval workflow
- Contractor selection
- State validation
- Authorization checks
- Event emission

### 10. View Functions (5 tests)
- Project information retrieval
- Contractor list retrieval
- Budget estimation
- State queries

### 11. Edge Cases and Boundary Conditions (6 tests)
- Maximum value handling (uint32, uint64)
- Rapid operations
- State consistency
- Invalid input handling

### 12. Gas Optimization Tests (3 tests)
- Project creation gas costs
- Room addition gas costs
- Bid submission gas costs

## 🚀 Running Tests

### Prerequisites

```bash
npm install
```

### Run All Tests (Mock Environment)

```bash
npm test
```

### Run Specific Test File

```bash
npx hardhat test test/PrivateRenovationBudget.test.ts
```

### Run Sepolia Tests

```bash
# Set contract address first
export CONTRACT_ADDRESS=0x301258156b7D06e69A2E116fc8EC574B78D2EA38

# Run Sepolia tests
npm run test:sepolia
```

### Generate Coverage Report

```bash
npm run coverage
```

### Generate Gas Report

```bash
REPORT_GAS=true npm test
```

## 📝 Test Structure

### Main Test File

`test/PrivateRenovationBudget.test.ts`

```typescript
describe("Private Renovation Budget Manager", function () {
  // Setup
  let contract: PrivateRenovationBudget;
  let owner, alice, bob: HardhatEthersSigner;

  beforeEach(async function () {
    // Deploy fresh contract for each test
    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Category Name", function () {
    it("should do something specific", async function () {
      // Arrange
      const input = 100;

      // Act
      const tx = await contract.functionName(input);
      await tx.wait();

      // Assert
      expect(result).to.equal(expected);
    });
  });
});
```

### Sepolia Test File

`test/PrivateRenovationBudget.sepolia.test.ts`

```typescript
describe("Sepolia Integration Tests", function () {
  before(async function () {
    // Connect to deployed contract
    if (network.chainId !== 11155111n) {
      this.skip();
    }
  });

  it("should work on testnet", async function () {
    this.timeout(120000); // Extended timeout

    progress("Step 1...");
    // Test logic

    expect(result).to.be.valid;
  });
});
```

## 🔧 Test Utilities

### Deploy Fixture

```typescript
async function deployFixture() {
  const signers = await ethers.getSigners();
  const pauserAddresses = [
    signers[5].address,
    signers[6].address,
    signers[7].address
  ];

  const Contract = await ethers.getContractFactory("PrivateRenovationBudget");
  const instance = await Contract.deploy(pauserAddresses, 1);
  const address = await instance.getAddress();

  return { contract: instance, contractAddress: address };
}
```

### Progress Logger (Sepolia)

```typescript
let step = 0;
let steps = 5;

function progress(message: string) {
  console.log(`  ${++step}/${steps} ${message}`);
}
```

## 📊 Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Statements | >90% | TBD |
| Branches | >85% | TBD |
| Functions | >95% | TBD |
| Lines | >90% | TBD |

## 🎯 Test Patterns Used

### 1. Arrange-Act-Assert (AAA)

```typescript
it("should create project", async function () {
  // Arrange
  const homeowner = alice.address;

  // Act
  const tx = await contract.connect(alice).createProject();
  await tx.wait();

  // Assert
  const projectInfo = await contract.getProjectInfo(1);
  expect(projectInfo.homeowner).to.equal(homeowner);
});
```

### 2. Event Testing

```typescript
it("should emit ProjectCreated event", async function () {
  await expect(
    contract.connect(alice).createProject()
  ).to.emit(contract, "ProjectCreated")
    .withArgs(1n, alice.address);
});
```

### 3. Revert Testing

```typescript
it("should revert for unauthorized access", async function () {
  await expect(
    contract.connect(bob).ownerFunction()
  ).to.be.revertedWith("Not authorized");
});
```

### 4. Gas Testing

```typescript
it("should use reasonable gas", async function () {
  const tx = await contract.functionName();
  const receipt = await tx.wait();

  expect(receipt?.gasUsed).to.be.lt(500000n);
});
```

### 5. State Testing

```typescript
it("should update state correctly", async function () {
  const before = await contract.getValue();
  await contract.setValue(100);
  const after = await contract.getValue();

  expect(after).to.not.equal(before);
  expect(after).to.equal(100);
});
```

## 🐛 Common Issues and Solutions

### Issue: Tests fail with "Invalid address"

**Solution**: Ensure signers are properly initialized

```typescript
before(async function () {
  const signers = await ethers.getSigners();
  owner = signers[0];
  alice = signers[1];
});
```

### Issue: Sepolia tests timeout

**Solution**: Increase timeout for network operations

```typescript
it("should work on Sepolia", async function () {
  this.timeout(120000); // 2 minutes
  // Test logic
});
```

### Issue: Gas estimation fails

**Solution**: Check network configuration

```typescript
// hardhat.config.ts
networks: {
  hardhat: {
    gasPrice: 0,
    initialBaseFeePerGas: 0,
  }
}
```

## 📈 Continuous Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run coverage
```

## 🔍 Test Debugging

### Enable Verbose Logging

```bash
npx hardhat test --verbose
```

### Show Stack Traces

```bash
npx hardhat test --stack-traces
```

### Run Single Test

```bash
npx hardhat test --grep "should create project"
```

## 📚 Testing Best Practices

### ✅ DO

- Write descriptive test names
- Test one thing per test case
- Use proper setup and teardown
- Test edge cases and boundaries
- Mock external dependencies
- Keep tests independent
- Use meaningful assertions

### ❌ DON'T

- Test multiple things in one test
- Rely on test execution order
- Use hardcoded values without explanation
- Skip error case testing
- Ignore gas costs
- Leave console.logs in tests

## 🎓 Learning Resources

- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts)
- [Chai Assertion Library](https://www.chaijs.com/api/bdd/)
- [Ethereum Waffle Matchers](https://ethereum-waffle.readthedocs.io/en/latest/matchers.html)
- [Smart Contract Testing Best Practices](https://consensys.github.io/smart-contract-best-practices/development-recommendations/testing/)

## 📞 Support

If tests fail or you need help:

1. Check the error message carefully
2. Review the test code and contract code
3. Ensure all dependencies are installed
4. Verify network configuration
5. Check Hardhat console for details

## 🔄 Version History

- **v2.1.0** - Comprehensive test suite with 75+ tests
- **v2.0.0** - Gateway migration tests
- **v1.0.0** - Initial test implementation

---

**Last Updated**: 2025-10-18
**Test Framework**: Hardhat + Mocha + Chai
**Total Test Cases**: 75+
**Coverage Target**: >90%
