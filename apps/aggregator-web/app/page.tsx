"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Mock Data for the UI
const MARKET_RATES = { Copper: 750, Aluminium: 210, Brass: 520, EWaste: 150 };
const UNBATCHED_INVENTORY = [
  { id: 101, material: 'Copper', weight_kg: 150, collector: 'Ramesh' },
  { id: 102, material: 'Copper', weight_kg: 200, collector: 'Suresh' },
  { id: 103, material: 'Copper', weight_kg: 150, collector: 'Mukesh' },
];

export default function AggregatorDashboard() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchData, setBatchData] = useState<{ hash: string; totalWeight: number; payload: string } | null>(null);

  // Toggle selection of inventory items
  const toggleSelection = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Secure SHA-256 Hashing for the QR Code
  const generateHash = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleCreateBatch = async () => {
    const selectedItems = UNBATCHED_INVENTORY.filter(item => selectedIds.includes(item.id));
    const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight_kg, 0);

    // Create the payload that will be hashed
    const payload = JSON.stringify({
      aggregator_id: "AGG-001",
      material: "Copper",
      total_weight_kg: totalWeight,
      transaction_ids: selectedIds,
      timestamp: new Date().toISOString(),
    });

    const hash = await generateHash(payload);

    setBatchData({ hash, totalWeight, payload });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Aggregator Operations Portal</h1>
        <p className="text-slate-500">Kabadiwala Connect - Urban Mining DPI</p>
      </header>

      {/* Dynamic Pricing Banner */}
      <div className="flex gap-4 mb-8">
        {Object.entries(MARKET_RATES).map(([material, price]) => (
          <div key={material} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex-1">
            <p className="text-sm text-gray-500 font-medium">{material} (Daily Rate)</p>
            <p className="text-2xl font-bold text-green-600">₹{price}/kg</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Selection Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Unbatched Copper Inventory</h2>
          <div className="space-y-3 mb-6">
            {UNBATCHED_INVENTORY.map((item) => (
              <label key={item.id} className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded mr-4"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelection(item.id)}
                />
                <div className="flex-1">
                  <p className="font-medium">ID: TXN-{item.id} ({item.collector})</p>
                  <p className="text-sm text-gray-500">{item.weight_kg} kg • {item.material}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleCreateBatch}
            disabled={selectedIds.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Create Industrial Batch
          </button>
        </div>

        {/* QR Code Generation Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[400px]">
          {batchData ? (
            <div className="text-center w-full">
              <h2 className="text-xl font-bold text-green-600 mb-2">Batch Minted Successfully</h2>
              <p className="text-gray-600 mb-6">Total Weight: <strong>{batchData.totalWeight} kg</strong></p>

              <div className="bg-white p-4 inline-block border-2 border-gray-200 rounded-xl mb-6">
                <QRCodeSVG value={batchData.payload} size={200} level="H" />
              </div>

              <div className="bg-gray-100 p-3 rounded text-left text-xs text-gray-500 break-all font-mono">
                <strong>SHA-256 Hash:</strong><br />
                {batchData.hash}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p>Select inventory items and create a batch<br />to generate the chain-of-custody QR code.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}