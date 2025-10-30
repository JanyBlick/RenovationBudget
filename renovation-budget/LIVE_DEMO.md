# Live Demo Guide

## 🌐 Try It Now!

**Live Demo:** [https://janyblick.github.io/RenovationBudget/](https://janyblick.github.io/RenovationBudget/)

Experience real FHE (Fully Homomorphic Encryption) in action without any local setup!

## What You'll See

The Private Renovation Budget Manager demonstrates:

- ✅ **Real TFHE encryption** on Sepolia testnet
- ✅ **Encrypted budget calculations** using Zama's fhEVM
- ✅ **Private contractor bids** with sealed bid functionality
- ✅ **Gateway-based decryption** for selective viewing
- ✅ **Production-ready** smart contracts
- ✅ **Fully functional UI** for homeowners and contractors

## Quick Start (30 seconds)

1. **Visit**: [https://janyblick.github.io/RenovationBudget/](https://janyblick.github.io/RenovationBudget/)
2. **Connect MetaMask** (will prompt automatically)
3. **Switch to Sepolia** testnet (if not already)
4. **Try the features!**

## Prerequisites

- MetaMask browser extension
- Sepolia testnet ETH (get from faucet if needed)

## Watch the Walkthrough

Can't try it right now? Watch `demo.mp4` (9.4MB) in this directory for a complete video walkthrough showing:

1. Wallet connection
2. Creating encrypted projects
3. Adding encrypted room requirements
4. Submitting contractor bids
5. Encrypted calculations
6. Gateway decryption

## Features to Try

### For Homeowners

1. **Create a Renovation Project**
   - Click "Create Project"
   - Budget values are encrypted before sending to contract
   - Only you can view your budget

2. **Add Room Requirements**
   - Specify encrypted room area
   - Set encrypted material costs
   - Set encrypted labor costs
   - All values remain private on-chain

3. **Calculate Budget**
   - Contract performs FHE arithmetic
   - Totals calculated on encrypted values
   - Results stay encrypted until you decrypt

### For Contractors

1. **View Projects** (encrypted)
2. **Submit Private Bids**
   - Enter bid amount (encrypted)
   - Enter time estimate (encrypted)
   - Bids invisible to other contractors

3. **Win Projects**
   - Only selected contractor revealed
   - Winning bid remains private

## Behind the Scenes

### Real FHE Operations

```solidity
// Real TFHE encryption (not mocks!)
euint32 area = FHE.asEuint32(encryptedArea);
euint32 cost = FHE.mul(area, unitPrice);
euint64 total = FHE.add(subtotal, cost);
```

### Gateway Integration

- Connects to Zama's production Gateway
- KMS (Key Management Service) for decryption
- Request decryption for specific values
- Callback-based results

### Network Details

- **Network**: Sepolia Testnet
- **Gateway**: Zama Production Gateway
- **Contracts**: Real fhEVM smart contracts
- **Frontend**: GitHub Pages (static hosting)

## Source Code

Want to see how it's built?

**GitHub Repository**: [https://github.com/JanyBlick/fhevm-react-template](https://github.com/JanyBlick/fhevm-react-template)

Clone it and run locally:

```bash
git clone https://github.com/JanyBlick/fhevm-react-template
cd fhevm-react-template
npm install
npm run dev
```

## Resources

- **Live Demo**: [https://janyblick.github.io/RenovationBudget/](https://janyblick.github.io/RenovationBudget/)
- **Demo Video**: `demo.mp4` (this directory)
- **Source Code**: [GitHub](https://github.com/JanyBlick/fhevm-react-template)
- **Integration Guide**: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Zama Docs**: [docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)

## Troubleshooting

### Can't connect MetaMask?
- Make sure MetaMask is installed
- Try refreshing the page
- Check browser console for errors

### Wrong network?
- MetaMask will prompt to switch
- Or manually switch to Sepolia testnet

### Need Sepolia ETH?
- Use a Sepolia faucet:
  - [sepoliafaucet.com](https://sepoliafaucet.com)
  - [infura.io/faucet](https://www.infura.io/faucet/sepolia)

### Transactions failing?
- Check you have enough Sepolia ETH
- Wait a bit (network might be congested)
- Try increasing gas limit

## Next Steps

After trying the live demo:

1. **Watch `demo.mp4`** for detailed walkthrough
2. **Clone the [repo](https://github.com/JanyBlick/fhevm-react-template)** to run locally
3. **Read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** to understand the architecture
4. **Study the contracts** to see real FHE operations
5. **Build your own** privacy-preserving dApp!

---

**🌐 [Try Live Demo Now](https://janyblick.github.io/RenovationBudget/) →**
