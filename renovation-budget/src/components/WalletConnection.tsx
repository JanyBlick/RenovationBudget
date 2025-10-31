'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletConnectionProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

const SEPOLIA_CHAIN_ID = '0xaa36a7';
const CONTRACT_ADDRESS = '0x55F046c86B21805df96997b479e9CF88ce8692C1';

export function WalletConnection({ isConnected, onConnectionChange }: WalletConnectionProps) {
  const [account, setAccount] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('Unknown');
  const [status, setStatus] = useState<string>('Connect Wallet');

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask!');
        return;
      }

      setStatus('Connecting...');

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Check network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (error: any) {
          if (error.code === 4902) {
            alert('Please add Sepolia network to MetaMask');
          }
          throw error;
        }
      }

      setAccount(account);
      setStatus(`Connected: ${account.substring(0, 6)}...${account.substring(38)}`);
      setUserRole('Homeowner'); // Default role
      onConnectionChange(true);
    } catch (error) {
      console.error('Connection failed:', error);
      setStatus('Connection failed');
      onConnectionChange(false);
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount('');
          setStatus('Connect Wallet');
          onConnectionChange(false);
        } else {
          setAccount(accounts[0]);
          setStatus(`Connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, [onConnectionChange]);

  return (
    <div className="status-card">
      <div>
        <span id="status-text">{status}</span>
        {isConnected && (
          <div style={{ marginTop: '10px' }}>
            <div><strong>Contract:</strong> {CONTRACT_ADDRESS}</div>
            <div><strong>Network:</strong> Sepolia Testnet</div>
            <div><strong>Your Role:</strong> {userRole}</div>
          </div>
        )}
      </div>
      {!isConnected && (
        <button onClick={connectWallet} style={{
          padding: '10px 20px',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          Connect MetaMask
        </button>
      )}
    </div>
  );
}
