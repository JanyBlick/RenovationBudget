'use client';

import { useState } from 'react';
import { useFHE } from './FHEProvider';
import { useContract } from '@/hooks/useContract';
import { FheType } from '@fhevm/sdk';

export function HomeownerPanel() {
  const { client, isReady, signer } = useFHE();
  const contract = useContract();

  const [projectId, setProjectId] = useState('');
  const [roomArea, setRoomArea] = useState('');
  const [materialCost, setMaterialCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [contingency, setContingency] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const createProject = async () => {
    if (!contract || !client || !isReady) {
      setResult('FHE client not ready');
      return;
    }

    try {
      setLoading(true);
      setResult('Creating project...');

      const tx = await contract.createProject();
      const receipt = await tx.wait();

      const event = receipt.logs.find((log: any) =>
        log.fragment?.name === 'ProjectCreated'
      );

      if (event) {
        const newProjectId = event.args[0].toString();
        setResult(`✅ Project created successfully! Project ID: ${newProjectId}`);
        setProjectId(newProjectId);
      } else {
        setResult('✅ Project created successfully!');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addRoom = async () => {
    if (!contract || !client || !isReady || !projectId) {
      setResult('Please provide all required fields');
      return;
    }

    try {
      setLoading(true);
      setResult('Adding room...');

      // Encrypt the room data
      const encryptedArea = await client.encryptInput(Number(roomArea), FheType.UINT32);
      const encryptedMaterial = await client.encryptInput(Number(materialCost), FheType.UINT32);
      const encryptedLabor = await client.encryptInput(Number(laborCost), FheType.UINT32);

      const tx = await contract.addRoomRequirement(
        projectId,
        encryptedArea.data,
        encryptedMaterial.data,
        encryptedLabor.data
      );

      await tx.wait();
      setResult('✅ Room added successfully!');

      // Clear form
      setRoomArea('');
      setMaterialCost('');
      setLaborCost('');
    } catch (error: any) {
      console.error('Error:', error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateBudget = async () => {
    if (!contract || !client || !isReady || !projectId) {
      setResult('Please provide project ID');
      return;
    }

    try {
      setLoading(true);
      setResult('Calculating budget...');

      const tx = await contract.calculateBudget(projectId, Number(contingency) || 15);
      await tx.wait();

      setResult('✅ Budget calculated successfully!');
    } catch (error: any) {
      console.error('Error:', error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const approveProject = async () => {
    if (!contract || !projectId || !selectedContractor) {
      setResult('Please provide project ID and contractor address');
      return;
    }

    try {
      setLoading(true);
      setResult('Approving project...');

      const tx = await contract.approveProject(projectId, selectedContractor);
      await tx.wait();

      setResult('✅ Project approved successfully!');
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
        <h3>Create New Project</h3>
        <button onClick={createProject} className="btn-primary" disabled={loading}>
          Create Renovation Project
        </button>
      </div>

      <div className="section">
        <h3>Add Room Requirements</h3>
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
          <label>Room Area (sq meters):</label>
          <input
            type="number"
            value={roomArea}
            onChange={(e) => setRoomArea(e.target.value)}
            placeholder="e.g. 25"
          />
        </div>
        <div className="form-group">
          <label>Material Cost per sq meter ($):</label>
          <input
            type="number"
            value={materialCost}
            onChange={(e) => setMaterialCost(e.target.value)}
            placeholder="e.g. 150"
          />
        </div>
        <div className="form-group">
          <label>Labor Cost per sq meter ($):</label>
          <input
            type="number"
            value={laborCost}
            onChange={(e) => setLaborCost(e.target.value)}
            placeholder="e.g. 100"
          />
        </div>
        <button onClick={addRoom} className="btn-primary" disabled={loading}>
          Add Room
        </button>
      </div>

      <div className="section">
        <h3>Calculate Budget</h3>
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
          <label>Contingency Percentage (%):</label>
          <input
            type="number"
            value={contingency}
            onChange={(e) => setContingency(e.target.value)}
            placeholder="e.g. 15"
            max="50"
          />
        </div>
        <button onClick={calculateBudget} className="btn-primary" disabled={loading}>
          Calculate Total Budget
        </button>
      </div>

      <div className="section">
        <h3>Approve Project</h3>
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
          <label>Selected Contractor Address:</label>
          <input
            type="text"
            value={selectedContractor}
            onChange={(e) => setSelectedContractor(e.target.value)}
            placeholder="0x..."
          />
        </div>
        <button onClick={approveProject} className="btn-success" disabled={loading}>
          Approve Project
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
