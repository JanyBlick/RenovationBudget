'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createFhevmClient, FhevmClient } from '@fhevm/sdk';
import { ethers } from 'ethers';

interface FHEContextType {
  client: FhevmClient | null;
  isReady: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
}

const FHEContext = createContext<FHEContextType>({
  client: null,
  isReady: false,
  provider: null,
  signer: null,
});

export function useFHE() {
  return useContext(FHEContext);
}

export function FHEProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const initFHE = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const browserSigner = await browserProvider.getSigner();

          setProvider(browserProvider);
          setSigner(browserSigner);

          const fhevmClient = createFhevmClient({
            providerUrl: 'https://sepolia.infura.io/v3/',
            chainId: 11155111, // Sepolia
          });

          await fhevmClient.init();
          setClient(fhevmClient);
          setIsReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize FHE client:', error);
      }
    };

    initFHE();
  }, []);

  return (
    <FHEContext.Provider value={{ client, isReady, provider, signer }}>
      {children}
    </FHEContext.Provider>
  );
}
