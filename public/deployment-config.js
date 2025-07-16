// Deployment Configuration
const DEPLOYMENT_CONFIG = {
    // Network configurations
    NETWORKS: {
        SEPOLIA: {
            chainId: 11155111,
            name: 'Sepolia Testnet',
            rpcUrl: 'https://sepolia.infura.io/v3/',
            blockExplorer: 'https://sepolia.etherscan.io'
        }
    },

    // Contract deployment info
    CONTRACT: {
        // Update this with your deployed contract address
        ADDRESS: '0x55F046c86B21805df96997b479e9CF88ce8692C1',
        NETWORK: 'SEPOLIA',
        DEPLOYED_BLOCK: 0 // Update with deployment block number
    },

    // Application settings
    APP: {
        NAME: 'Private Renovation Budget',
        VERSION: '1.0.0',
        DESCRIPTION: 'Confidentially calculate renovation costs with encrypted blockchain data'
    }
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DEPLOYMENT_CONFIG;
} else {
    window.DEPLOYMENT_CONFIG = DEPLOYMENT_CONFIG;
}