'use client';

import { useState } from 'react';
import { useFHE } from './FHEProvider';
import { useContract } from '@/hooks/useContract';
import { FheType } from '@fhevm/sdk';

export function ContractorPanel() {
  const { client, isReady } = useFHE();
  const contract = useContract();

  const [projectId, setProjectId] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const submitBid = async () => {
    if (!contract || !client || !isReady || !projectId) {
      setResult('Please provide all required fields');
      return;
    }

    try {
      setLoading(true);
      setResult('Submitting bid...');

      // Encrypt the bid data
      const encryptedBid = await client.encryptInput(Number(bidAmount), FheType.UINT32);
      const encryptedTime = await client.encryptInput(Number(timeEstimate), FheType.UINT32);

      const tx = await contract.submitBid(
        projectId,
        encryptedBid.data,
        encryptedTime.data
      );

      await tx.wait();
      setResult('✅ Bid submitted successfully!');

      // Clear form
      setBidAmount('');
      setTimeEstimate('');
    } catch (error: any) {
      console.error('Error:', error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const viewMyBid = async () => {
    if (!contract || !projectId) {
      setResult('Please provide project ID');
      return;
    }

    try {
      setLoading(true);
      setResult('Fetching your bid...');

      // Note: In a real app, you would need to decrypt this data
      setResult('📊 Bid information retrieval requires decryption. Check contract events for details.');
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
        <h3>Submit Bid</h3>
        <div className="form-group">
          <label>Project ID:</label>
          <input
            type="number"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Enter project ID"
          />
        </div>
        <div className="form-group">
          <label>Bid Amount ($):</label>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="e.g. 5000"
          />
        </div>
        <div className="form-group">
          <label>Estimated Time (days):</label>
          <input
            type="number"
            value={timeEstimate}
            onChange={(e) => setTimeEstimate(e.target.value)}
            placeholder="e.g. 30"
          />
        </div>
        <button onClick={submitBid} className="btn-primary" disabled={loading}>
          Submit Bid
        </button>
      </div>

      <div className="section">
        <h3>View My Bids</h3>
        <div className="form-group">
          <label>Project ID:</label>
          <input
            type="number"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Enter project ID"
          />
        </div>
        <button onClick={viewMyBid} className="btn-secondary" disabled={loading}>
          View My Bid
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
