'use client';

import { useState } from 'react';
import { HomeownerPanel } from '@/components/HomeownerPanel';
import { ContractorPanel } from '@/components/ContractorPanel';
import { AdminPanel } from '@/components/AdminPanel';
import { WalletConnection } from '@/components/WalletConnection';
import { FHEProvider } from '@/components/FHEProvider';

type TabType = 'homeowner' | 'contractor' | 'admin';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('homeowner');
  const [isConnected, setIsConnected] = useState(false);

  return (
    <FHEProvider>
      <div className="container">
        <header>
          <h1>🏠 Private Renovation Budget</h1>
          <p>Confidentially calculate renovation costs with encrypted blockchain data</p>
        </header>

        <WalletConnection
          isConnected={isConnected}
          onConnectionChange={setIsConnected}
        />

        {isConnected && (
          <>
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'homeowner' ? 'active' : ''}`}
                onClick={() => setActiveTab('homeowner')}
              >
                Homeowner
              </button>
              <button
                className={`tab-btn ${activeTab === 'contractor' ? 'active' : ''}`}
                onClick={() => setActiveTab('contractor')}
              >
                Contractor
              </button>
              <button
                className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                Admin
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'homeowner' && <HomeownerPanel />}
              {activeTab === 'contractor' && <ContractorPanel />}
              {activeTab === 'admin' && <AdminPanel />}
            </div>
          </>
        )}
      </div>
    </FHEProvider>
  );
}
