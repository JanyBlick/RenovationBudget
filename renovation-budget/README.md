# 🏠 Private Renovation Budget

> **Confidential renovation cost estimation powered by Fully Homomorphic Encryption (FHE) on blockchain**

A Next.js + React application demonstrating FHE-enabled private budget calculations using the @fhevm/sdk.

[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://private-renovation-budget.vercel.app/)
[![Contract](https://img.shields.io/badge/Contract-Sepolia-orange)](https://sepolia.etherscan.io/address/0x55F046c86B21805df96997b479e9CF88ce8692C1)

## 🎯 Project Overview

Private Renovation Budget is a revolutionary blockchain application that enables homeowners and contractors to confidentially calculate renovation costs while maintaining complete privacy of sensitive financial data. Built on cutting-edge Fully Homomorphic Encryption (FHE) technology, this platform ensures that all budget calculations, contractor bids, and project details remain encrypted throughout the entire process.

## 🔐 Core Concepts

### Fully Homomorphic Encryption (FHE) in Smart Contracts

**What is FHE?**
Fully Homomorphic Encryption allows computations to be performed directly on encrypted data without ever decrypting it. This means:
- ✅ All renovation costs remain private during calculation
- ✅ Contractor bids are encrypted and cannot be viewed by competitors
- ✅ Homeowner budgets stay confidential throughout the bidding process
- ✅ Mathematical operations (addition, multiplication) work seamlessly on encrypted values

### Private Renovation Budget Calculation

The platform revolutionizes traditional renovation estimation by:

1. **Encrypted Input Processing**: Room dimensions, material preferences, and budget constraints are encrypted before blockchain submission
2. **Confidential Computation**: Smart contracts perform cost calculations on encrypted data using FHE operations
3. **Private Bid Comparison**: Contractors submit encrypted bids that can be compared without revealing actual amounts
4. **Secure Budget Estimation**: Final budget estimates are generated while maintaining complete privacy of all input parameters

## 🏗️ How It Works

### For Homeowners
- **Create Projects**: Define renovation requirements with encrypted room specifications
- **Add Requirements**: Specify room types, sizes, and renovation needs confidentially
- **Calculate Budgets**: Get accurate cost estimates without revealing sensitive financial information
- **Review Bids**: Compare contractor proposals while maintaining bid confidentiality
- **Select Contractors**: Approve projects and choose contractors based on encrypted evaluations

### For Contractors
- **Submit Encrypted Bids**: Provide competitive quotes without competitors seeing your pricing
- **Access Project Details**: View homeowner requirements while respecting privacy boundaries
- **Maintain Competitiveness**: Bid confidentially on multiple projects simultaneously

### For Administrators
- **Verify Contractors**: Manage contractor credentials and platform access
- **Oversee Operations**: Monitor platform usage while respecting user privacy

## 🌟 Key Features

- **🔒 Complete Privacy**: All financial data encrypted end-to-end
- **⛓️ Blockchain Security**: Immutable records on Ethereum Sepolia testnet
- **🏠 Multi-Room Support**: Handle complex renovation projects with multiple spaces
- **💰 Accurate Estimation**: Industry-standard cost calculation algorithms
- **🤝 Contractor Network**: Verified professional network for quality assurance
- **📊 Transparent Process**: Clear workflow while maintaining data confidentiality
- **🔧 User-Friendly Interface**: Intuitive design for both technical and non-technical users

## 📊 Smart Contract Details

**Contract Address**: `0x55F046c86B21805df96997b479e9CF88ce8692C1`

**Network**: Ethereum Sepolia Testnet

**Key Functions**:
- `createProject()`: Initialize new renovation projects with encrypted parameters
- `addRoomRequirement()`: Add confidential room specifications
- `calculateBudget()`: Generate private cost estimates using FHE
- `submitBid()`: Contractors submit encrypted competitive bids
- `approveProject()`: Homeowners select winning contractors confidentially

## 🎥 Demonstration

### Video Demo
The project includes a comprehensive demonstration video showcasing:
- Complete user workflow from project creation to contractor selection
- Real-time budget calculations using encrypted data
- Contractor bidding process with privacy preservation
- Administrative functions and contractor verification

### Transaction Evidence
On-chain transaction screenshots demonstrate:
- Successful smart contract interactions
- Encrypted data processing on blockchain
- Gas-efficient FHE operations
- Secure multi-party computation results

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the application.

### Smart Contract Deployment

```bash
npm run compile
npm run deploy
```

### Usage

1. Connect your MetaMask wallet
2. Switch to Sepolia testnet
3. Interact with real smart contracts on Sepolia testnet
4. Test encrypted budget calculations using FHE
5. Explore contractor bidding features with privacy preservation

## 💡 Technical Innovation

### React + Next.js Architecture
- **Next.js 14**: Modern React framework with App Router
- **TypeScript**: Full type safety across the application
- **Component-Based**: Modular, reusable React components
- **Client-Side Encryption**: FHE operations in the browser using @fhevm/sdk

### FHE Integration
- **@fhevm/sdk**: Framework-agnostic SDK for FHE operations
- **Zama FHEVM**: Leverages cutting-edge FHE virtual machine technology
- **Gas Optimization**: Efficient encrypted computation minimizing transaction costs
- **Privacy-First Design**: Every operation prioritizes data confidentiality

### Smart Contract Architecture
- **Modular Design**: Clean separation of concerns for maintainability
- **Event-Driven**: Comprehensive logging for transparency without compromising privacy
- **Access Control**: Role-based permissions ensuring appropriate data access
- **Hardhat Integration**: Development, testing, and deployment tools

## 🌍 Use Cases

### Residential Projects
- Kitchen renovations with confidential budget planning
- Bathroom remodeling with private contractor selection
- Whole-house renovations maintaining financial privacy
- Emergency repairs with urgent confidential bidding

### Commercial Applications
- Office space renovations with competitive sealed bidding
- Retail space modifications with private cost estimation
- Warehouse improvements with confidential contractor evaluation
- Multi-tenant building upgrades with privacy-preserved planning

## 📦 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **FHE SDK**: @fhevm/sdk for encryption/decryption
- **Smart Contracts**: Solidity, Hardhat
- **Blockchain**: Ethereum Sepolia Testnet
- **Wallet**: MetaMask integration via ethers.js

## 🔗 Links

- **Smart Contract**: [0x55F046c86B21805df96997b479e9CF88ce8692C1](https://sepolia.etherscan.io/address/0x55F046c86B21805df96997b479e9CF88ce8692C1)
- **Network**: Sepolia Testnet

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using Fully Homomorphic Encryption and Blockchain Technology**