// ========================================
// Hardhat Configuration
// Private Renovation Budget Manager
// ========================================
//
// Security & Performance Optimized Configuration
// - Solidity Optimizer: Enabled with 800 runs (balanced)
// - Gas Reporter: Comprehensive gas analysis
// - Code Coverage: Solidity coverage support
// - DoS Protection: Gas limits configured
// - Type Safety: TypeChain integration

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Get optimizer runs from environment or use default
const OPTIMIZER_RUNS = process.env.OPTIMIZER_RUNS
  ? parseInt(process.env.OPTIMIZER_RUNS)
  : 800;

// Gas reporter configuration
const REPORT_GAS = process.env.REPORT_GAS === "true";
const GAS_PRICE = process.env.GAS_PRICE || 50; // gwei
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // ========================================
  // Solidity Compiler Configuration
  // ========================================
  solidity: {
    version: "0.8.24",
    settings: {
      // Optimizer configuration for gas efficiency
      optimizer: {
        enabled: true,
        runs: OPTIMIZER_RUNS, // Higher = optimized for frequent calls
        details: {
          // Advanced optimizer settings
          peephole: true,       // Peephole optimization
          inliner: true,        // Function inlining
          jumpdestRemover: true, // Remove unused jumpdests
          orderLiterals: true,  // Order literals efficiently
          deduplicate: true,    // Remove duplicate code
          cse: true,           // Common subexpression elimination
          constantOptimizer: true, // Optimize constants
          yul: true,           // Enable Yul optimizer
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf"
          }
        }
      },
      // Output selection for maximum information
      outputSelection: {
        "*": {
          "*": [
            "abi",
            "evm.bytecode",
            "evm.deployedBytecode",
            "evm.methodIdentifiers",
            "metadata"
          ],
          "": ["ast"]
        }
      },
      // Metadata settings
      metadata: {
        bytecodeHash: "ipfs",
        useLiteralContent: true
      },
      // EVM version (Constantinople for FHE compatibility)
      evmVersion: "paris"
    }
  },

  // ========================================
  // Network Configuration
  // ========================================
  networks: {
    // Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR-PROJECT-ID",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      // Gas configuration for DoS protection
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1.2, // 20% buffer for gas fluctuations
      // Timeout settings
      timeout: 120000, // 2 minutes
      // Network optimizations
      httpHeaders: {
        "User-Agent": "Private-Renovation-Budget/2.1.0"
      }
    },

    // Local Hardhat Network
    hardhat: {
      chainId: 31337,
      // Gas configuration
      gas: 12000000,
      blockGasLimit: 12000000,
      // Initial base fee (London hard fork)
      initialBaseFeePerGas: 0,
      gasPrice: 0,
      // Mining configuration
      mining: {
        auto: true,
        interval: 0, // Mine instantly
        mempool: {
          order: "fifo" // First in, first out
        }
      },
      // Account settings
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        accountsBalance: "10000000000000000000000" // 10000 ETH
      },
      // Forking configuration (if needed)
      forking: process.env.FORK_ENABLED === "true" ? {
        url: process.env.SEPOLIA_RPC_URL || "",
        blockNumber: process.env.FORK_BLOCK_NUMBER
          ? parseInt(process.env.FORK_BLOCK_NUMBER)
          : undefined,
        enabled: true
      } : undefined,
      // Allow unlimited contract size for testing
      allowUnlimitedContractSize: false, // Keep false for production-like testing
      // Throw on transaction failures
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      // Logging
      loggingEnabled: process.env.VERBOSE === "true"
    },

    // Localhost Network (for running local node)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      timeout: 60000
    }
  },

  // ========================================
  // Gas Reporter Configuration
  // ========================================
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    gasPrice: GAS_PRICE,
    coinmarketcap: COINMARKETCAP_API_KEY,
    // Output options
    outputFile: process.env.CI ? "gas-report.txt" : undefined,
    noColors: process.env.CI ? true : false,
    // Display options
    showTimeSpent: true,
    showMethodSig: true,
    // Token for price data
    token: "ETH",
    // Exclude from report
    excludeContracts: [],
    // Report format
    rst: false,
    rstTitle: "Gas Usage Report",
    // Source code info
    src: "./contracts"
  },

  // ========================================
  // Etherscan Verification
  // ========================================
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    },
    customChains: []
  },

  // ========================================
  // TypeChain Configuration
  // ========================================
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["node_modules/@fhevm/solidity/artifacts/**/*.json"],
    dontOverrideCompile: false
  },

  // ========================================
  // Path Configuration
  // ========================================
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    root: "."
  },

  // ========================================
  // Mocha Test Configuration
  // ========================================
  mocha: {
    timeout: process.env.TEST_TIMEOUT
      ? parseInt(process.env.TEST_TIMEOUT)
      : 120000, // 2 minutes
    bail: false, // Continue after first failure
    allowUncaught: false,
    require: ["ts-node/register"],
    // Reporter options
    reporter: process.env.CI ? "json" : "spec",
    reporterOptions: process.env.CI ? {
      output: "test-results.json"
    } : {}
  },

  // ========================================
  // Contract Sizer Configuration
  // ========================================
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: process.env.CONTRACT_SIZE === "true",
    strict: true,
    // Warn if contract size > 24KB (EIP-170 limit)
    only: []
  },

  // ========================================
  // Solidity Coverage Configuration
  // ========================================
  coverage: {
    skipFiles: [
      "test/",
      "scripts/",
      "migrations/"
    ]
  }
};