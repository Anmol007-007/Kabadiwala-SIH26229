"use client";

import React, { useState } from "react";
import {
  Factory,
  Scale,
  ShieldCheck,
  FileText,
  Download,
  RefreshCw,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function RecyclerPortal() {
  const [activeTab, setActiveTab] = useState<"inward" | "ledger" | "form4" | "formalization">("inward");
  const [batchHash, setBatchHash] = useState("c8f2b414d9b3a099a4c11b023fec9a796e6d78a9c2df3607ba9f1709403db812");
  const [declaredWeight, setDeclaredWeight] = useState(28.0);
  const [receivedWeight, setReceivedWeight] = useState("27.8");
  const [verifiedResult, setVerifiedResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  const ledgerEntries = [
    {
      trxId: "TRX-84741",
      lotId: "LOT-NGP-84741",
      material: "Grade A Mobile PCBs",
      weightKg: 8.0,
      collector: "Ramesh Kumar (Informal)",
      aggregator: "Wadi Aggregators",
      gps: "21.1458° N, 79.0882° E",
      timestamp: "Today, 11:42 AM",
      status: "VERIFIED",
    },
    {
      trxId: "TRX-84739",
      lotId: "LOT-NGP-84739",
      material: "Mobile Circuit Boards",
      weightKg: 3.4,
      collector: "Sunita Bai (Informal)",
      aggregator: "Wadi Aggregators",
      gps: "21.1214° N, 79.0145° E",
      timestamp: "Today, 10:15 AM",
      status: "VERIFIED",
    },
    {
      trxId: "TRX-84698",
      lotId: "LOT-NGP-84698",
      material: "Copper Cable & Extrusion",
      weightKg: 16.6,
      collector: "Dharmendra Jha (Informal)",
      aggregator: "Wadi Aggregators",
      gps: "21.1340° N, 79.0520° E",
      timestamp: "Yesterday, 04:20 PM",
      status: "VERIFIED",
    },
  ];

  const handleVerify = () => {
    setVerifying(true);
    const rec = parseFloat(receivedWeight) || declaredWeight;
    const diff = Number((rec - declaredWeight).toFixed(2));
    setTimeout(() => {
      setVerifiedResult({
        certId: "EPR-CPCB-2026-00412",
        batchHash,
        declaredWeight,
        receivedWeight: rec,
        variance: diff,
        carbonSavedMt: Number(((rec * 2.5) / 1000).toFixed(3)),
        timestamp: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setVerifying(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white text-ink-900 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-ink-50/70 border border-ink-100 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white ring-1 ring-ink-100 text-leaf-700 shadow-2xs">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
                  Vidarbha Metal Recovery Pvt Ltd
                </h1>
                <span className="text-[10px] bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 px-2 py-0.5 rounded-full font-mono font-bold">
                  AUTHORISED RECYCLER
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-500 mt-0.5">
                Plot E-21, MIDC Butibori, Nagpur &bull; CPCB Reg:{" "}
                <span className="text-ink-700 font-mono">MH/EPR/R/2024/00318</span> &bull; Capacity: 4,800 TPA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border border-ink-100 rounded-2xl text-xs text-right shadow-2xs">
              <p className="text-ink-500 text-[10px] uppercase font-semibold">Q2 Informal Sourcing</p>
              <p className="text-lg font-black text-leaf-700">31% &bull; On Track</p>
            </div>
          </div>
        </header>

        <div className="flex items-center gap-2 border-b border-ink-100 pb-2 overflow-x-auto">
          {[
            { id: "inward", label: "Inward Reconciliation (Weighbridge)" },
            { id: "ledger", label: "Traceability & EPR Ledger" },
            { id: "form4", label: "Statutory Form 4 Return (CPCB)" },
            { id: "formalization", label: "Formalization Progress" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-ink-900 text-white shadow-sm"
                  : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "inward" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-6 bg-white border border-ink-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                <div>
                  <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-leaf-700" />
                    <span>Inward Gate Verification</span>
                  </h2>
                  <p className="text-xs text-ink-500">
                    Verify cryptographic SHA-256 batch hash from Wadi Aggregators against physical scale weight
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wider mb-1.5">
                    Dispatched Batch Hash (SHA-256)
                  </label>
                  <input
                    type="text"
                    value={batchHash}
                    onChange={(e) => setBatchHash(e.target.value)}
                    className="w-full bg-ink-50 border border-ink-100 rounded-2xl p-3 text-xs text-ink-900 font-mono focus:outline-none focus:border-leaf-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-ink-50 border border-ink-100 rounded-2xl">
                    <p className="text-[10px] text-ink-500 uppercase font-semibold">Manifest Weight</p>
                    <p className="text-2xl font-black text-ink-900 mt-1">{declaredWeight} kg</p>
                    <p className="text-[10px] text-ink-400">From Wadi Aggregators</p>
                  </div>

                  <div className="p-4 bg-ink-50 border border-ink-100 rounded-2xl space-y-1">
                    <label className="block text-[10px] text-ink-500 uppercase font-semibold">
                      Actual Scale Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={receivedWeight}
                      onChange={(e) => setReceivedWeight(e.target.value)}
                      className="w-full bg-white border border-ink-100 rounded-xl p-2 text-xl font-black text-leaf-700 focus:outline-none"
                    />
                    <p className="text-[10px] text-ink-400">Weighbridge Bay 04</p>
                  </div>
                </div>

                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full py-3 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[.98]"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reconciling & Minting EPR Credit...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Reconcile & Issue Statutory EPR Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white border border-ink-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                  <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-leaf-700" />
                    <span>EPR Compliance Certificate</span>
                  </h2>
                  <span className="text-[10px] font-mono bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 px-2 py-0.5 rounded-full font-bold">
                    CPCB COMPLIANT
                  </span>
                </div>

                {verifiedResult ? (
                  <div className="mt-4 p-5 bg-leaf-50/50 border border-leaf-100 rounded-2xl shadow-2xs space-y-4 animate-fade-in">
                    <div className="text-center pb-2 border-b border-ink-100">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-leaf-700 font-bold">
                        CENTRAL POLLUTION CONTROL BOARD &bull; EPR PORTAL
                      </p>
                      <h3 className="font-extrabold text-base text-ink-900 mt-0.5">
                        Statutory Secondary Raw Material Recovery Certificate
                      </h3>
                      <p className="text-[10px] font-mono text-leaf-700 font-bold">{verifiedResult.certId}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-ink-500">Certified Weight:</span>
                        <p className="font-black text-leaf-700 text-sm">{verifiedResult.receivedWeight} kg</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-500">Weight Variance:</span>
                        <p className="font-bold text-ink-900">{verifiedResult.variance} kg (&plusmn;0.7%)</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-500">CO₂ Avoided:</span>
                        <p className="font-bold text-leaf-700">{verifiedResult.carbonSavedMt} MT CO₂e</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-500">Date:</span>
                        <p className="font-mono text-ink-700 text-[11px]">{verifiedResult.timestamp}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-ink-100 flex items-center justify-between">
                      <p className="font-mono text-[9px] text-ink-400 truncate max-w-[200px]">
                        {verifiedResult.batchHash}
                      </p>
                      <div className="p-1 bg-white rounded-lg ring-1 ring-ink-100">
                        <QRCodeSVG value={`https://cpcb.nic.in/epr?cert=${verifiedResult.certId}`} size={44} />
                      </div>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="w-full py-2.5 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-1.5 active:scale-[.98]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Statutory PDF Certificate</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-ink-400 space-y-2">
                    <Scale className="w-12 h-12 opacity-30" />
                    <p className="text-xs">Click Reconcile on the left to verify inward batch and mint certificate.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="bg-white border border-ink-100 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink-900">End-to-End Traceability Ledger</h2>
                <p className="text-xs text-ink-500">
                  Cryptographic binding linking informal doorstep collectors directly to plant furnace batches
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink-50 text-ink-500 uppercase text-[10px] tracking-wider border-b border-ink-100">
                  <tr>
                    <th className="p-3">TRX ID</th>
                    <th className="p-3">Material Grade</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Doorstep Collector</th>
                    <th className="p-3">Aggregator</th>
                    <th className="p-3">GPS Location</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 font-mono">
                  {ledgerEntries.map((row) => (
                    <tr key={row.trxId} className="hover:bg-ink-50/50">
                      <td className="p-3 text-leaf-700 font-bold">{row.trxId}</td>
                      <td className="p-3 font-sans text-ink-900 font-medium">{row.material}</td>
                      <td className="p-3 font-extrabold text-ink-900 font-sans">{row.weightKg} kg</td>
                      <td className="p-3 font-sans text-ink-700">{row.collector}</td>
                      <td className="p-3 font-sans text-ink-500">{row.aggregator}</td>
                      <td className="p-3 text-[10px] text-ink-400">{row.gps}</td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "form4" && (
          <div className="bg-white border border-ink-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-ink-100">
              <div>
                <h2 className="text-lg font-bold text-ink-900">Form 4 Statutory Annual Return Extract</h2>
                <p className="text-xs text-ink-500">
                  E-Waste (Management) Rules, 2022 &bull; Central Pollution Control Board (CPCB)
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-leaf-600 hover:bg-leaf-700 text-white text-xs font-semibold rounded-2xl shadow-sm flex items-center gap-1.5 active:scale-[.98]"
              >
                <Download className="w-4 h-4" />
                <span>Export CPCB Form 4 (PDF)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-ink-50 border border-ink-100 rounded-2xl">
                <p className="text-[10px] text-ink-500 uppercase font-semibold">Total E-Waste Received</p>
                <p className="text-2xl font-black text-ink-900 mt-1">495.8 kg</p>
                <p className="text-[10px] text-ink-400 mt-0.5">Informal source channel</p>
              </div>
              <div className="p-4 bg-ink-50 border border-ink-100 rounded-2xl">
                <p className="text-[10px] text-ink-500 uppercase font-semibold">Value Paid to Informal Pickers</p>
                <p className="text-2xl font-black text-leaf-600 font-mono mt-1">₹81,922</p>
                <p className="text-[10px] text-ink-400 mt-0.5">Direct cash & UPI handovers</p>
              </div>
              <div className="p-4 bg-ink-50 border border-ink-100 rounded-2xl">
                <p className="text-[10px] text-ink-500 uppercase font-semibold">EPR Credits Generated</p>
                <p className="text-2xl font-black text-ink-900 mt-1">0.496 MT</p>
                <p className="text-[10px] text-ink-400 mt-0.5">Audited by JNARDDC</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "formalization" && (
          <div className="bg-white border border-ink-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-ink-100">
              <div>
                <h2 className="text-lg font-bold text-ink-900">Informal Sector Formalization Targets</h2>
                <p className="text-xs text-ink-500">
                  Statutory requirement to increase informal channel integration from 10% to 40% by FY2026-27
                </p>
              </div>
            </div>

            <div className="p-5 bg-ink-50 border border-ink-100 rounded-2xl space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-ink-900">Q2 Milestone Progress</span>
                <span className="font-mono text-leaf-700 font-bold">31% / 25% (Target Exceeded)</span>
              </div>
              <div className="w-full bg-ink-100 h-3 rounded-full overflow-hidden">
                <div className="bg-leaf-600 h-full rounded-full" style={{ width: "68%" }} />
              </div>
              <p className="text-[11px] text-ink-500">
                142 independent doorstep collectors now onboarded with verified identity and bank/cash traceability.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}