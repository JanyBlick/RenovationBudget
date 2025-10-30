# Renovation Budget Integration with FHEVM SDK

This document explains how the Private Renovation Budget dApp has been integrated into the FHEVM SDK monorepo.

## Live Demo & Resources

- **🌐 Live Demo**: [https://janyblick.github.io/RenovationBudget/](https://janyblick.github.io/RenovationBudget/)
- **📹 Demo Video**: `demo.mp4` (9.4MB video walkthrough in this directory)
- **🔗 GitHub Repository**: [https://github.com/JanyBlick/fhevm-react-template](https://github.com/JanyBlick/fhevm-react-template)
- **📚 Original Template**: Based on fhevm-react-template

> **Try it now!** Visit the live demo to see real FHE operations in action on Sepolia testnet.

## Overview

The Private Renovation Budget Manager is a **production dApp** built with Zama's fhEVM that demonstrates real-world FHE usage. It has been integrated as an example showcasing:

- ✅ Real Zama fhEVM contracts (not mocks)
- ✅ Production-grade FHE operations
- ✅ Multiple encrypted data types (euint32, euint64, ebool)
- ✅ Complex business logic with privacy preservation
- ✅ Live deployment on GitHub Pages
- ✅ Real transactions on Sepolia testnet

## Original Structure

The original dApp uses:
- **Contracts**: Zama fhEVM v0.8.0 with real FHE operations
- **Frontend**: Vanilla HTML/JS with fhevmjs library
- **Network**: Sepolia testnet with Zama Gateway
- **Deployment**: GitHub Pages for frontend, Sepolia for contracts
- **Repository**: [fhevm-react-template](https://github.com/JanyBlick/fhevm-react-template)

## Watch the Demo

The `demo.mp4` file in this directory shows:
1. Connecting MetaMask to Sepolia
2. Submitting encrypted renovation budgets
3. Adding encrypted room requirements
4. Contractors submitting private bids
5. Encrypted budget calculations
6. Viewing results through Gateway decryption

## Integration Approach

### Option 1: Keep Original Structure (Recommended for Production)

The existing setup already uses Zama's production fhEVM libraries. Keep using:

```bash
# Run the original frontend
npm run dev  # Serves on http://localhost:8080

# Deploy to Sepolia
npm run deploy
```

### Option 2: Migrate to Next.js with @fhevm/react

For learning purposes or to demonstrate the SDK, we can create a Next.js wrapper:

1. **Use existing contracts** (already production-ready)
2. **Create Next.js frontend** using `@fhevm/react` hooks
3. **Integrate fhevmjs** for real FHE operations

## Key Differences: Mock SDK vs Real fhEVM

| Feature | Our Demo SDK | Zama fhEVM (This App) |
|---------|--------------|----------------------|
| Encryption | Mock (demonstration) | Real TFHE encryption |
| Network | Any EVM | Zama-enabled networks |
| Contracts | Simple examples | Production FHE operations |
| Decryption | Simulated | Gateway-based with KMS |
| Security | Educational | Production-grade |
| Live Demo | Local only | [janyblick.github.io](https://janyblick.github.io/RenovationBudget/) |

## Project Structure

```
examples/renovation-budget/
├── contracts/
│   └── PrivateRenovationBudget.sol    # Production fhEVM contract
├── public/
│   ├── app.js                          # Original frontend
│   ├── index.html
│   └── deployment-config.js            # Contract addresses
├── scripts/
│   └── deploy.js                       # Deployment script
├── test/
│   └── PrivateRenovationBudget.test.ts
├── demo.mp4                            # Video walkthrough
├── hardhat.config.js
├── README.md                           # Full project documentation
└── INTEGRATION_GUIDE.md               # This file
```

## Learning from This Example

### 1. Study the Contract

See `contracts/PrivateRenovationBudget.sol` for:
- How to use real FHE types
- Encrypted business logic
- Gateway integration patterns
- Decryption request handling

### 2. Understand the Flow

1. **Encrypt on Client**: Use fhevmjs to encrypt inputs
2. **Submit to Contract**: Send encrypted data
3. **Compute on Encrypted**: Contract performs FHE operations
4. **Request Decryption**: Through Gateway if needed
5. **Receive Results**: KMS handles decryption

### 3. Compare with Demo SDK

Our demo SDK (`@fhevm/sdk`) simplifies FHE concepts for learning.
This example shows production implementation with Zama's stack.

## Deployment

### Live Demo Setup

The live demo at [janyblick.github.io/RenovationBudget](https://janyblick.github.io/RenovationBudget/) uses:

1. **Frontend**: GitHub Pages hosting
2. **Contracts**: Deployed on Sepolia testnet
3. **Gateway**: Zama's production Gateway
4. **Network**: Sepolia with Zama fhEVM support

### Deploy Your Own

#### Sepolia Testnet

1. **Get Sepolia ETH**: From faucet
2. **Configure `.env`**:
   ```env
   PRIVATE_KEY=your_private_key
   SEPOLIA_RPC_URL=your_rpc_url
   ```
3. **Deploy**:
   ```bash
   npm run deploy
   ```

#### GitHub Pages

1. **Build**:
   ```bash
   npm run compile
   ```

2. **Update `deployment-config.js`**:
   ```javascript
   const CONTRACT_ADDRESS = 'your_deployed_address';
   ```

3. **Push to GitHub**:
   ```bash
   git add public/
   git commit -m "Deploy to GitHub Pages"
   git push
   ```

4. **Enable GitHub Pages**:
   - Repository Settings → Pages
   - Source: Deploy from branch
   - Branch: main, Folder: /public

### Integration with Monorepo

To use this alongside the demo SDK:

```bash
# From monorepo root
cd examples/renovation-budget

# This example is standalone but can reference SDK packages
npm install
npm run dev
```

## Why Keep Both?

### Demo SDK (`@fhevm/sdk`)
- ✅ Educational
- ✅ Easy to understand
- ✅ Works on any network
- ✅ No special infrastructure
- ❌ Not production FHE

### Renovation Budget (Zama fhEVM)
- ✅ Production-ready
- ✅ Real encryption
- ✅ Complex business logic
- ✅ Gateway integration
- ✅ Live demo available
- ❌ Requires Zama network
- ❌ More complex setup

## Next Steps

1. **Watch `demo.mp4`** to see the app in action
2. **Visit the [live demo](https://janyblick.github.io/RenovationBudget/)** to try it yourself
3. **Study the contracts** to understand real FHE
4. **Clone the [GitHub repo](https://github.com/JanyBlick/fhevm-react-template)** for the original template
5. **Run locally** to experiment with modifications
6. **Compare patterns** between demo SDK and production code

## Resources

- **Live Demo**: [https://janyblick.github.io/RenovationBudget/](https://janyblick.github.io/RenovationBudget/)
- **Source Code**: [https://github.com/JanyBlick/fhevm-react-template](https://github.com/JanyBlick/fhevm-react-template)
- **Demo Video**: `demo.mp4` in this directory
- [Zama fhEVM Docs](https://docs.zama.ai/fhevm)
- [fhevmjs Library](https://github.com/zama-ai/fhevmjs)
- [Gateway Documentation](https://docs.zama.ai/fhevm/getting-started/gateway)
- [Original Project README](./README.md)

## Contributing

When modifying this example:
- Keep contracts compatible with Zama fhEVM
- Test on Sepolia before mainnet
- Update `deployment-config.js` with new addresses
- Update documentation with changes
- Follow original security patterns
- Reference the [GitHub repository](https://github.com/JanyBlick/fhevm-react-template)

---

**This example demonstrates production FHE usage and serves as a bridge between our educational SDK and real-world applications.**

**🎥 Watch the demo video and try the live app to see it in action!**
