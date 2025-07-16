// Contract configuration - Set to null until contract is deployed
const CONTRACT_ADDRESS = '0x55F046c86B21805df96997b479e9CF88ce8692C1';
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Sepolia testnet chain ID
const SEPOLIA_NETWORK = {
    chainId: SEPOLIA_CHAIN_ID,
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/']
};

const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "contractor", "type": "address"}
        ],
        "name": "BidSubmitted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "homeowner", "type": "address"}
        ],
        "name": "BudgetCalculated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "contractor", "type": "address"}
        ],
        "name": "ContractorVerified",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "selectedContractor", "type": "address"}
        ],
        "name": "ProjectApproved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "homeowner", "type": "address"}
        ],
        "name": "ProjectCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256"},
            {"indexed": false, "internalType": "uint8", "name": "roomIndex", "type": "uint8"}
        ],
        "name": "RoomAdded",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "projectId", "type": "uint256"},
            {"internalType": "uint32", "name": "area", "type": "uint32"},
            {"internalType": "uint32", "name": "materialCost", "type": "uint32"},
            {"internalType": "uint32", "name": "laborCost", "type": "uint32"}
        ],
        "name": "addRoomRequirement",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "projectId", "type": "uint256"},
            {"internalType": "address", "name": "selectedContractor", "type": "address"}
        ],
        "name": "approveProject",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "projectId", "type": "uint256"},
            {"internalType": "uint32", "name": "contingencyPercent", "type": "uint32"}
        ],
        "name": "calculateBudget",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "projectId", "type": "uint256"},
            {"internalType": "address", "name": "contractor", "type": "address"}
        ],
        "name": "compareBidWithBudget",
        "outputs": [
            {"internalType": "euint64", "name": "bidAmount", "type": "uint256"},
            {"internalType": "euint64", "name": "budgetEstimate", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "createProject",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "projectId", "type": "uint256"}],
        "name": "getBudgetEstimate",
        "outputs": [
            {"internalType": "euint64", "name": "totalBudget", "type": "uint256"},
            {"internalType": "euint64", "name": "finalEstimate", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "projectId", "type": "uint256"},
            {"internalType": "address", "name": "contractor", "type": "address"}
        ],
        "name": "getContractorBid",
        "outputs": [
            {"internalType": "euint64", "name": "bidAmount", "type": "uint256"},
            {"internalType": "euint32", "name": "timeEstimate", "type": "uint256"},
            {"internalType": "bool", "name": "isSubmitted", "type": "bool"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "projectId", "type": "uint256"}],
        "name": "getProjectContractors",
        "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "projectId", "type": "uint256"}],
        "name": "getProjectInfo",
        "outputs": [
            {"internalType": "address", "name": "homeowner", "type": "address"},
            {"internalType": "bool", "name": "isCalculated", "type": "bool"},
            {"internalType": "bool", "name": "isApproved", "type": "bool"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "uint8", "name": "roomCount", "type": "uint8"},
            {"internalType": "uint256", "name": "bidCount", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextProjectId",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "requestId", "type": "uint256"},
            {"internalType": "uint64", "name": "decryptedBudget", "type": "uint64"},
            {"internalType": "bytes[]", "name": "signatures", "type": "bytes[]"}
        ],
        "name": "processBudgetReveal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "projectId", "type": "uint256"}],
        "name": "requestBudgetDecryption",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "projectId", "type": "uint256"},
            {"internalType": "uint64", "name": "bidAmount", "type": "uint64"},
            {"internalType": "uint32", "name": "timeEstimate", "type": "uint32"}
        ],
        "name": "submitBid",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "contractor", "type": "address"}],
        "name": "verifyContractor",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "verifiedContractors",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Global variables
let provider;
let signer;
let contract;
let userAddress;

// Initialize the application
async function init() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask detected');
    } else {
        showResult('Please install MetaMask to use this application.', 'error');
    }
}

// Add/Switch to Sepolia network
async function addSepoliaNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK]
        });
    } catch (error) {
        console.error('Failed to add Sepolia network:', error);
        throw error;
    }
}

// Switch to Sepolia network
async function switchToSepolia() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }]
        });
    } catch (error) {
        if (error.code === 4902) {
            // Network not added yet, add it
            await addSepoliaNetwork();
        } else {
            throw error;
        }
    }
}

// Connect to MetaMask wallet
async function connectWallet() {
    try {
        console.log('Starting wallet connection...');

        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask not detected. Please install MetaMask extension.');
        }

        console.log('MetaMask detected, requesting account access...');
        showLoading(true);

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Account access granted');

        // Create provider using ethers v6 syntax
        console.log('Creating ethers provider...');
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        userAddress = await signer.getAddress();
        console.log('User address:', userAddress);

        // Check and switch to Sepolia network
        console.log('Checking network...');
        const network = await provider.getNetwork();
        console.log('Current network chainId:', network.chainId);

        if (network.chainId !== 11155111n) { // Sepolia testnet (BigInt comparison)
            console.log('Switching to Sepolia network...');
            await switchToSepolia();
            // Recreate provider after network switch
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            console.log('Network switched successfully');
        } else {
            console.log('Already on Sepolia network');
        }

        // Create contract instance only if address is available
        console.log('Setting up contract with address:', CONTRACT_ADDRESS);
        if (CONTRACT_ADDRESS && ethers.isAddress(CONTRACT_ADDRESS)) {
            console.log('Creating contract instance...');
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            document.getElementById('contract-address').textContent = CONTRACT_ADDRESS;
            document.getElementById('deployment-section').style.display = 'none';
            // Check user role
            console.log('Checking user role...');
            await checkUserRole();
        } else {
            console.log('Contract address not valid:', CONTRACT_ADDRESS);
            contract = null;
            document.getElementById('contract-address').textContent = 'Contract not deployed yet';
            document.getElementById('user-role').textContent = 'Please deploy contract first';
            document.getElementById('deployment-section').style.display = 'block';
        }

        // Update UI
        document.getElementById('status-text').textContent = `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        document.getElementById('connect-btn').style.display = 'none';
        document.getElementById('app-content').style.display = 'block';

        if (CONTRACT_ADDRESS) {
            showResult('Connected to Sepolia successfully! ✅', 'success');
        } else {
            showResult('Connected to Sepolia! Please deploy the contract and update CONTRACT_ADDRESS in app.js', 'warning');
        }

    } catch (error) {
        console.error('Connection error:', error);
        showResult(`Connection failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Check user role in the contract
async function checkUserRole() {
    try {
        const owner = await contract.owner();
        const isVerifiedContractor = await contract.verifiedContractors(userAddress);

        let role = 'Homeowner';
        if (userAddress.toLowerCase() === owner.toLowerCase()) {
            role = 'Contract Owner';
        } else if (isVerifiedContractor) {
            role = 'Verified Contractor';
        }

        document.getElementById('user-role').textContent = role;
    } catch (error) {
        console.error('Error checking user role:', error);
        document.getElementById('user-role').textContent = 'Unknown';
    }
}

// Switch between tabs
function switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Create a new renovation project
async function createProject() {
    try {
        checkContractAvailable();

        showLoading(true);

        const tx = await contract.createProject();
        const receipt = await tx.wait();

        // Get project ID from event logs (ethers v6)
        const event = receipt.logs.find(log => {
            try {
                const parsedLog = contract.interface.parseLog(log);
                return parsedLog.name === 'ProjectCreated';
            } catch {
                return false;
            }
        });

        if (event) {
            const parsedEvent = contract.interface.parseLog(event);
            const projectId = parsedEvent.args.projectId.toString();
            showResult(`Project created successfully! Project ID: ${projectId}`, 'success');
        } else {
            showResult('Project created successfully!', 'success');
        }

    } catch (error) {
        console.error('Error creating project:', error);
        showResult(`Error creating project: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Add room requirements to a project
async function addRoom() {
    try {
        checkContractAvailable();

        const projectId = document.getElementById('project-id').value;
        const area = document.getElementById('room-area').value;
        const materialCost = document.getElementById('material-cost').value;
        const laborCost = document.getElementById('labor-cost').value;

        if (!projectId || !area || !materialCost || !laborCost) {
            throw new Error('Please fill in all fields');
        }

        showLoading(true);

        const tx = await contract.addRoomRequirement(
            projectId,
            parseInt(area),
            parseInt(materialCost),
            parseInt(laborCost)
        );
        await tx.wait();

        showResult('Room added successfully!', 'success');

        // Clear form
        document.getElementById('room-area').value = '';
        document.getElementById('material-cost').value = '';
        document.getElementById('labor-cost').value = '';

    } catch (error) {
        console.error('Error adding room:', error);
        showResult(`Error adding room: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Calculate total budget for a project
async function calculateBudget() {
    try {
        checkContractAvailable();

        const projectId = document.getElementById('calc-project-id').value;
        const contingency = document.getElementById('contingency').value;

        if (!projectId || !contingency) {
            throw new Error('Please fill in all fields');
        }

        if (parseInt(contingency) > 50) {
            throw new Error('Contingency percentage cannot exceed 50%');
        }

        showLoading(true);

        const tx = await contract.calculateBudget(projectId, parseInt(contingency));
        await tx.wait();

        showResult('Budget calculated successfully! Use "Get Budget Estimate" to view the encrypted results.', 'success');

    } catch (error) {
        console.error('Error calculating budget:', error);
        showResult(`Error calculating budget: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// View project information
async function viewProject() {
    try {
        checkContractAvailable();

        const projectId = document.getElementById('view-project-id').value;

        if (!projectId) {
            throw new Error('Please enter a project ID');
        }

        showLoading(true);

        const projectInfo = await contract.getProjectInfo(projectId);

        const result = `
            <div class="result-item">
                <h4>Project #${projectId} Information</h4>
                <p><strong>Homeowner:</strong> ${projectInfo.homeowner}</p>
                <p><strong>Is Calculated:</strong> ${projectInfo.isCalculated ? 'Yes' : 'No'}</p>
                <p><strong>Is Approved:</strong> ${projectInfo.isApproved ? 'Yes' : 'No'}</p>
                <p><strong>Room Count:</strong> ${projectInfo.roomCount}</p>
                <p><strong>Bid Count:</strong> ${projectInfo.bidCount}</p>
                <p><strong>Created:</strong> ${new Date(Number(projectInfo.timestamp) * 1000).toLocaleString()}</p>
            </div>
        `;

        showResult(result);

    } catch (error) {
        console.error('Error viewing project:', error);
        showResult(`Error viewing project: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Get budget estimate (encrypted values)
async function getBudget() {
    try {
        checkContractAvailable();

        const projectId = document.getElementById('view-project-id').value;

        if (!projectId) {
            throw new Error('Please enter a project ID');
        }

        showLoading(true);

        const budget = await contract.getBudgetEstimate(projectId);

        const result = `
            <div class="result-item">
                <h4>Budget Estimate (Encrypted)</h4>
                <p><strong>Total Budget Handle:</strong> ${budget.totalBudget.toString()}</p>
                <p><strong>Final Estimate Handle:</strong> ${budget.finalEstimate.toString()}</p>
                <p class="warning">Note: These are encrypted values. Use FHE decryption to view actual amounts.</p>
            </div>
        `;

        showResult(result);

    } catch (error) {
        console.error('Error getting budget:', error);
        showResult(`Error getting budget: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Get contractors who bid on project
async function getContractors() {
    try {
        checkContractAvailable();

        const projectId = document.getElementById('view-project-id').value;

        if (!projectId) {
            throw new Error('Please enter a project ID');
        }

        showLoading(true);

        const contractors = await contract.getProjectContractors(projectId);

        let result = `<div class="result-item"><h4>Contractors for Project #${projectId}</h4>`;

        if (contractors.length === 0) {
            result += '<p>No contractors have bid on this project yet.</p>';
        } else {
            result += '<ul>';
            contractors.forEach((contractor, index) => {
                result += `<li>${index + 1}. ${contractor}</li>`;
            });
            result += '</ul>';
        }

        result += '</div>';
        showResult(result);

    } catch (error) {
        console.error('Error getting contractors:', error);
        showResult(`Error getting contractors: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Approve project and select contractor
async function approveProject() {
    try {
        checkContractAvailable();

        const projectId = document.getElementById('approve-project-id').value;
        const contractorAddress = document.getElementById('selected-contractor').value;

        if (!projectId || !contractorAddress) {
            throw new Error('Please fill in all fields');
        }

        if (!ethers.isAddress(contractorAddress)) {
            throw new Error('Invalid contractor address');
        }

        showLoading(true);

        const tx = await contract.approveProject(projectId, contractorAddress);
        await tx.wait();

        showResult(`Project #${projectId} approved with contractor ${contractorAddress}!`, 'success');

    } catch (error) {
        console.error('Error approving project:', error);
        showResult(`Error approving project: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Submit a bid (contractor function)
async function submitBid() {
    try {
        checkContractAvailable();

        const projectId = document.getElementById('bid-project-id').value;
        const bidAmount = document.getElementById('bid-amount').value;
        const timeEstimate = document.getElementById('time-estimate').value;

        if (!projectId || !bidAmount || !timeEstimate) {
            throw new Error('Please fill in all fields');
        }

        showLoading(true);

        const tx = await contract.submitBid(
            projectId,
            parseInt(bidAmount),
            parseInt(timeEstimate)
        );
        await tx.wait();

        showResult('Bid submitted successfully!', 'success');

        // Clear form
        document.getElementById('bid-amount').value = '';
        document.getElementById('time-estimate').value = '';

    } catch (error) {
        console.error('Error submitting bid:', error);
        showResult(`Error submitting bid: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// View contractor's own bid
async function viewMyBid() {
    try {
        checkContractAvailable();

        const projectId = document.getElementById('my-bid-project-id').value;

        if (!projectId) {
            throw new Error('Please enter a project ID');
        }

        showLoading(true);

        const bid = await contract.getContractorBid(projectId, userAddress);

        const result = `
            <div class="result-item">
                <h4>My Bid for Project #${projectId}</h4>
                <p><strong>Bid Amount Handle:</strong> ${bid.bidAmount.toString()}</p>
                <p><strong>Time Estimate Handle:</strong> ${bid.timeEstimate.toString()}</p>
                <p><strong>Is Submitted:</strong> ${bid.isSubmitted ? 'Yes' : 'No'}</p>
                <p><strong>Submitted:</strong> ${Number(bid.timestamp) > 0 ? new Date(Number(bid.timestamp) * 1000).toLocaleString() : 'Not submitted'}</p>
                <p class="warning">Note: Bid amounts are encrypted. Use FHE decryption to view actual values.</p>
            </div>
        `;

        showResult(result);

    } catch (error) {
        console.error('Error viewing bid:', error);
        showResult(`Error viewing bid: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Verify contractor (admin function)
async function verifyContractor() {
    try {
        checkContractAvailable();

        const contractorAddress = document.getElementById('contractor-address').value;

        if (!contractorAddress) {
            throw new Error('Please enter a contractor address');
        }

        if (!ethers.isAddress(contractorAddress)) {
            throw new Error('Invalid contractor address');
        }

        showLoading(true);

        const tx = await contract.verifyContractor(contractorAddress);
        await tx.wait();

        showResult(`Contractor ${contractorAddress} verified successfully!`, 'success');

        // Clear form
        document.getElementById('contractor-address').value = '';

    } catch (error) {
        console.error('Error verifying contractor:', error);
        showResult(`Error verifying contractor: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Utility functions
function checkContractAvailable() {
    if (!contract) {
        throw new Error('Contract not deployed. Please deploy the contract and update CONTRACT_ADDRESS in app.js');
    }
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function showResult(message, type = 'info') {
    const resultsDiv = document.getElementById('results');
    const className = type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : '';

    if (typeof message === 'string') {
        resultsDiv.innerHTML = `<div class="${className}">${message}</div>`;
    } else {
        resultsDiv.innerHTML = message;
    }

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Handle MetaMask account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // User disconnected
            location.reload();
        } else {
            // User switched accounts
            location.reload();
        }
    });

    window.ethereum.on('chainChanged', (chainId) => {
        // User switched networks
        location.reload();
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);