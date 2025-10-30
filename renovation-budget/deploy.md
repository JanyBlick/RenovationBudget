# Deployment Instructions

## Prerequisites
- MetaMask wallet with Sepolia ETH
- Access to Hardhat deployment scripts
- Vercel account

## Contract Deployment
1. Deploy the contract using Hardhat:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
2. Copy the deployed contract address
3. Update `CONTRACT_ADDRESS` in `public/app.js`
4. Update `CONTRACT.ADDRESS` in `public/deployment-config.js`

## Vercel Deployment
1. Connect your repository to Vercel
2. Set build command: (leave empty for static deployment)
3. Set output directory: `public`
4. Deploy

## Manual Deployment
1. Upload the `public` folder contents to any web server
2. Ensure the contract address is configured correctly
3. Test the application with MetaMask

## Important Notes
- Contract must be deployed on Sepolia testnet
- Users need MetaMask installed and configured
- Ensure proper FHE library loading for encrypted operations