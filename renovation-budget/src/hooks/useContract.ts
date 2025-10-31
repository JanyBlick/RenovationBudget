import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useFHE } from '@/components/FHEProvider';

const CONTRACT_ADDRESS = '0x55F046c86B21805df96997b479e9CF88ce8692C1';

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
    "inputs": [],
    "name": "createProject",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "projectId", "type": "uint256"},
      {"internalType": "uint32", "name": "bidAmount", "type": "uint32"},
      {"internalType": "uint32", "name": "timeEstimate", "type": "uint32"}
    ],
    "name": "submitBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "contractor", "type": "address"}
    ],
    "name": "verifyContractor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export function useContract() {
  const { signer } = useFHE();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);
    }
  }, [signer]);

  return contract;
}
