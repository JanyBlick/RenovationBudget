'use client';

import { useState } from 'react';
import { useContract } from '@/hooks/useContract';

export function AdminPanel() {
  const contract = useContract();

  const [contractorAddress, setContractorAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const verifyContractor = async () => {
    if (!contract || !contractorAddress) {
      setResult('Please provide contractor address');
      return;
    }

    try {
      setLoading(true);
      setResult('Verifying contractor...');

      const tx = await contract.verifyContractor(contractorAddress);
      await tx.wait();

      setResult(`✅ Contractor ${contractorAddress} verified successfully!`);
      setContractorAddress('');
    } catch (error: any) {
      console.error('Error:', error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="section">
        <h3>Verify Contractor</h3>
        <div className="form-group">
          <label>Contractor Address:</label>
          <input
            type="text"
            value={contractorAddress}
            onChange={(e) => setContractorAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>
        <button onClick={verifyContractor} className="btn-primary" disabled={loading}>
          Verify Contractor
        </button>
      </div>

      {result && (
        <div className="results-section">
          <h3>Result</h3>
          <p>{result}</p>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Processing transaction...</p>
        </div>
      )}
    </div>
  );
}
