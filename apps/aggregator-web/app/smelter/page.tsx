"use client";

import React, { useState } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kabadiwala-backend-4vkq.onrender.com';

export default function SmelterPortal() {
    const [batchHash, setBatchHash] = useState('');
    const [receivedWeight, setReceivedWeight] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        setLoading(true);
        try {
            // Calls the FastAPI backend
            const res = await fetch(`${BASE_URL}/api/v1/epr/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    batch_hash: batchHash,
                    received_weight_kg: parseFloat(receivedWeight)
                })
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error("Verification failed", error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8 font-sans text-gray-100">
            <header className="mb-8 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white">Formal Smelter & Recycler Portal</h1>
                <p className="text-slate-400">Inward Verification & EPR Compliance</p>
            </header>

            <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-semibold mb-6">Inward QR Scanner & Reconciliation</h2>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Scanned Batch Hash (SHA-256)</label>
                        <input
                            type="text"
                            value={batchHash}
                            onChange={(e) => setBatchHash(e.target.value)}
                            placeholder="e.g., 8f434346648f6b96df89dda901c5176b..."
                            className="w-full bg-slate-700 border border-slate-600 rounded p-3 text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Actual Received Weight (kg)</label>
                        <input
                            type="number"
                            value={receivedWeight}
                            onChange={(e) => setReceivedWeight(e.target.value)}
                            placeholder="Enter physical scale weight"
                            className="w-full bg-slate-700 border border-slate-600 rounded p-3 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <button
                    onClick={handleVerify}
                    disabled={!batchHash || !receivedWeight || loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Verifying...' : 'Verify Batch & Generate EPR'}
                </button>

                {result && result.status === 'success' && (
                    <div className="mt-8 p-6 bg-green-900/30 border border-green-700 rounded-lg">
                        <h3 className="text-green-400 font-bold mb-2">✅ Verification Successful</h3>
                        <p className="text-sm text-slate-300 mb-1">Weight Variance: <strong>{result.variance_kg} kg</strong></p>
                        <p className="text-sm text-slate-300 mb-4">{result.message}</p>

                        <a
                            href={result.certificate_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded"
                        >
                            📄 Download EPR Certificate (PDF)
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}