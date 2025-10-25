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
        // Updated with v2.0 deployment (Gateway migrated)
        ADDRESS: '0x301258156b7D06e69A2E116fc8EC574B78D2EA38',
        NETWORK: 'SEPOLIA',
        DEPLOYED_BLOCK: 0, // Update with deployment block number
        DEPLOYMENT_TX: '0x792ad3ab484cba3329c12f1e5f2edf2c53dbd569028a56e5be884fe1835fb36c'
    },

    // Application settings
    APP: {
        NAME: 'Private Renovation Budget',
        VERSION: '2.0.0',
        DESCRIPTION: 'Confidentially calculate renovation costs with encrypted blockchain data - Gateway Migrated'
    }
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DEPLOYMENT_CONFIG;
} else {
    window.DEPLOYMENT_CONFIG = DEPLOYMENT_CONFIG;
}