"use client";

import React, { useState } from "react";
import {
  Factory,
  Scale,
  ShieldCheck,
  FileText,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Printer,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useApp } from "@/context/AppContext";

export default function RecyclerPortal() {
  const {
    loads,
    reconciliations,
    lots,
    reconcileLoad,
    refreshData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"inward" | "ledger" | "form4" | "formalization">("inward");
  const [selectedLoadId, setSelectedLoadId] = useState<string>(loads[0]?.loadId || "BULK-NGP-084");
  const [receivedWeight, setReceivedWeight] = useState<string>("27.8");
  const [activeCert, setActiveCert] = useState<any>(reconciliations[0] || null);

  const currentSelectedLoad = loads.find((l) => l.loadId === selectedLoadId) || loads[0];
  const declaredWeight = currentSelectedLoad ? currentSelectedLoad.weight : 28.0;
  const currentReceivedWeight = parseFloat(receivedWeight) || declaredWeight;
  const variance = Number((currentReceivedWeight - declaredWeight).toFixed(2));
  const variancePct = declaredWeight > 0 ? Number(((variance / declaredWeight) * 100).toFixed(2)) : 0;

  const handleVerifyScale = () => {
    const cert = reconcileLoad(currentSelectedLoad?.loadId || "BULK-NGP-084", currentReceivedWeight);
    setActiveCert(cert);
    setActiveTab("form4");
  };

  return (
    <div className="min-h-screen bg-white text-ink-900 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Smelter Plant Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-ink-50/70 border border-ink-100 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white ring-1 border-ink-100 text-leaf-700 shadow-2xs">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
                  Vidarbha Metal Recovery Pvt Ltd
                </h1>
                <span className="text-[10px] bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 px-2 py-0.5 rounded-full font-mono font-bold">
                  AUTHORISED RECYCLER & SMELTER
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-500 mt-0.5">
                Plot E-21, MIDC Butibori, Nagpur &bull; CPCB Reg:{" "}
                <span className="font-mono text-ink-700 font-semibold">MH/EPR/R/2024/00318</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="px-3.5 py-2 bg-white hover:bg-ink-50 text-ink-700 text-xs font-semibold rounded-2xl border border-ink-100 flex items-center gap-2 transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-leaf-600" />
              <span>Refresh Gate</span>
            </button>
            <div className="px-3 py-1.5 bg-leaf-50 border border-leaf-100 rounded-2xl text-xs text-leaf-700 font-mono font-bold">
              EPR Yield: {reconciliations.reduce((a, b) => a + b.receivedWeight, 0).toFixed(1)} kg Verified
            </div>
          </div>
        </header>

        {/* Portal Tabs */}
        <div className="flex items-center gap-2 border-b border-ink-100 pb-2 overflow-x-auto">
          {[
            { id: "inward", label: "Inbound Weighbridge Reconciliation" },
            { id: "form4", label: `CPCB Form-4 Statutory Return (${reconciliations.length})` },
            { id: "ledger", label: "End-to-End Traceability Ledger" },
            { id: "formalization", label: "Informal Formalization Metric" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-ink-900 text-white shadow-xs"
                  : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: WEIGHBRIDGE RECONCILIATION */}
        {activeTab === "inward" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Inward Batch Form */}
            <div className="lg:col-span-2 p-6 bg-white border border-ink-100 rounded-3xl space-y-5 shadow-2xs">
              <div>
                <h3 className="font-extrabold text-base text-ink-900">
                  आवक माल वजन मिलान (Weighbridge Reconciliation Gate)
                </h3>
                <p className="text-xs text-ink-500">
                  एग्रीगेटर द्वारा भेजे गए औद्योगिक बैच को धर्मकांटा (Scale) पर तौल कर मिलान करें।
                </p>
              </div>

              {/* Select batch from dispatched loads */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700">प्राप्त बैच चुनें (Dispatched Batch):</label>
                <select
                  value={selectedLoadId}
                  onChange={(e) => {
                    setSelectedLoadId(e.target.value);
                    const target = loads.find((l) => l.loadId === e.target.value);
                    if (target) {
                      setReceivedWeight((target.weight - 0.2).toFixed(1));
                    }
                  }}
                  className="w-full bg-ink-50 border border-ink-200 rounded-2xl p-3 text-xs font-mono font-bold text-ink-900 focus:outline-none focus:ring-2 focus:ring-leaf-600"
                >
                  {loads.map((l) => (
                    <option key={l.loadId} value={l.loadId}>
                      {l.loadId} &bull; {l.material} &bull; {l.weight} kg &bull; ({l.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Hash Display */}
              <div className="p-3 bg-ink-50 rounded-2xl border border-ink-100 space-y-1">
                <span className="text-[10px] font-mono text-ink-500 uppercase font-bold">
                  SHA-256 Chain of Custody Seal:
                </span>
                <p className="font-mono text-xs text-ink-800 break-all">{currentSelectedLoad?.hash}</p>
              </div>

              {/* Scale Weights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-ink-50/70 border border-ink-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-ink-500 uppercase">घोषित प्रेषित वजन (Declared)</span>
                  <p className="text-2xl font-black text-ink-900 font-mono mt-1">
                    {declaredWeight} <span className="text-sm font-normal text-ink-500">kg</span>
                  </p>
                  <p className="text-[11px] text-ink-500 mt-1">एग्रीगेटर वे बिल के अनुसार</p>
                </div>

                <div className="p-4 bg-white border-2 border-leaf-600 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-leaf-700 uppercase">धर्मकांटा स्केल वजन (Gross Weighbridge)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={receivedWeight}
                      onChange={(e) => setReceivedWeight(e.target.value)}
                      className="w-full text-2xl font-black text-ink-900 font-mono focus:outline-none"
                    />
                    <span className="text-sm font-bold text-ink-500">kg</span>
                  </div>
                  <p className="text-[10px] text-leaf-700 font-medium">स्केल सेंसर लाइव इनपुट</p>
                </div>
              </div>

              {/* Live Variance Calculation */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  Math.abs(variancePct) <= 2.5
                    ? "bg-leaf-50 border-leaf-200 text-leaf-800"
                    : "bg-clay-100 border-clay-200 text-clay-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {Math.abs(variancePct) <= 2.5 ? (
                    <CheckCircle2 className="w-5 h-5 text-leaf-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-clay-600" />
                  )}
                  <div>
                    <p className="font-bold text-xs">
                      वजन अंतर (Variance): <strong>{variance > 0 ? `+${variance}` : variance} kg ({variancePct}%)</strong>
                    </p>
                    <p className="text-[11px]">
                      {Math.abs(variancePct) <= 2.5
                        ? "सीपीसीबी नियम 4(2) के तहत स्वीकार्य सीमा (±2.5%) के भीतर है।"
                        : "सावधानी: विसंगति 2.5% से अधिक है। ऑडिट ध्वज लग सकता है।"}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-2 py-1 bg-white rounded-lg border">
                  {Math.abs(variancePct) <= 2.5 ? "PERMISSIBLE" : "HIGH VARIANCE"}
                </span>
              </div>

              <button
                onClick={handleVerifyScale}
                className="w-full py-3.5 bg-leaf-600 hover:bg-leaf-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <Scale className="w-4 h-4" />
                <span>सत्यापित करें और वैधानिक EPR फॉर्म-4 प्रमाणपत्र बनाएं &rarr;</span>
              </button>
            </div>

            {/* Quick Summary Card */}
            <div className="p-6 bg-ink-50/70 border border-ink-100 rounded-3xl space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-leaf-700 uppercase bg-leaf-50 px-2 py-0.5 rounded-full border border-leaf-100">
                  STATUTORY RECYCLER OBLIGATION
                </span>
                <h4 className="font-extrabold text-base text-ink-900 mt-2">सीपीसीबी फॉर्म-4 अनिवार्य प्रकटीकरण</h4>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  ई-अपशिष्ट प्रबंधन नियम, 2022 के नियम 13(1) के अनुसार प्रत्येक प्राप्त बैच के लिए सामग्री उपज, कार्बन बचत, तथा अनौपचारिक कबाड़ियों का हिस्सा दर्ज करना अनिवार्य है।
                </p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-ink-100 flex justify-between">
                    <span className="text-ink-600">औसत कार्बन बचत:</span>
                    <strong className="font-mono text-ink-900">2.5 kg CO₂ / kg</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-ink-100 flex justify-between">
                    <span className="text-ink-600">कुल सत्यापित बैच:</span>
                    <strong className="font-mono text-ink-900">{reconciliations.length} Batches</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-ink-100 text-[11px] text-ink-500 font-mono">
                Ministry of Mines &bull; Urban Mining Registry v2.4
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CPCB FORM-4 CERTIFICATE */}
        {activeTab === "form4" && activeCert && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-8 bg-white border-2 border-ink-900 rounded-3xl max-w-3xl mx-auto shadow-md space-y-6">
              {/* Certificate Header */}
              <div className="text-center pb-4 border-b-2 border-ink-900 space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-leaf-700 bg-leaf-50 px-2.5 py-0.5 rounded-full border border-leaf-100">
                  MINISTRY OF MINES &bull; CENTRAL POLLUTION CONTROL BOARD
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-ink-900 tracking-tight">
                  FORM 4 &bull; EPR YIELD VERIFICATION RETURN
                </h2>
                <p className="text-xs text-ink-600 font-mono">
                  [See Rule 13(1) of E-Waste (Management) Rules, 2022]
                </p>
                <p className="text-xs font-mono font-bold text-leaf-700 pt-1">
                  Certificate No: {activeCert.certId}
                </p>
              </div>

              {/* Certificate Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-ink-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-ink-500 uppercase font-bold">Authorised Recycler</span>
                  <p className="font-bold text-ink-900">{activeCert.smelterName}</p>
                  <p className="text-[10px] font-mono text-ink-500">{activeCert.cpcbReg}</p>
                </div>

                <div className="p-3 bg-ink-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-ink-500 uppercase font-bold">Secondary Material Batch</span>
                  <p className="font-bold text-ink-900">{activeCert.material}</p>
                  <p className="text-[10px] font-mono text-ink-500">Batch ID: {activeCert.batchId}</p>
                </div>

                <div className="p-3 bg-ink-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-ink-500 uppercase font-bold">Scale Reconciliation</span>
                  <p className="text-ink-700">घोषित: <strong className="font-mono">{activeCert.declaredWeight} kg</strong></p>
                  <p className="text-ink-700">धर्मकांटा प्राप्त: <strong className="font-mono text-leaf-700">{activeCert.receivedWeight} kg</strong></p>
                  <p className="text-[10px] text-ink-500">अंतर (Variance): {activeCert.variance} kg</p>
                </div>

                <div className="p-3 bg-ink-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-ink-500 uppercase font-bold">Environmental Impact</span>
                  <p className="font-bold text-leaf-700 text-sm font-mono">
                    {activeCert.carbonSavedMt} MT CO₂ e Saved
                  </p>
                  <p className="text-[10px] text-ink-500">Urban mining avoids virgin ore extraction</p>
                </div>
              </div>

              {/* QR & Hash Verification */}
              <div className="p-4 bg-ink-50 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-ink-500">
                    Tamper-Proof Cryptographic Hash (SHA-256)
                  </span>
                  <p className="text-[10px] font-mono text-ink-700 break-all">{activeCert.batchHash}</p>
                  <p className="text-[10px] text-leaf-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & Recorded on National EPR Credit Ledger
                  </p>
                </div>

                <div className="p-2 bg-white rounded-xl border shrink-0">
                  <QRCodeSVG
                    value={`https://mines.gov.in/epr-verify?cert=${activeCert.certId}&hash=${activeCert.batchHash}`}
                    size={72}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-ink-900 hover:bg-ink-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>प्रमाणपत्र प्रिंट / PDF डाउनलोड करें</span>
                </button>
                <button
                  onClick={() => setActiveTab("ledger")}
                  className="px-4 py-2.5 bg-ink-50 hover:bg-ink-100 text-ink-700 font-bold text-xs rounded-xl border border-ink-200 transition"
                >
                  ट्रेसबिलिटी लेजर देखें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRACEABILITY LEDGER */}
        {activeTab === "ledger" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-ink-900">
                  संपूर्ण ट्रैसेबिलिटी लेजर (End-to-End Chain of Custody)
                </h3>
                <p className="text-xs text-ink-500">
                  कबाड़ी के दरवाजे से स्मेल्टर भट्ठी तक प्रत्येक ग्राम का डिजिटल प्रमाण
                </p>
              </div>
              <span className="text-xs font-mono text-leaf-700 font-bold bg-leaf-50 px-2.5 py-1 rounded-xl border border-leaf-100">
                100% Audit Complete
              </span>
            </div>

            <div className="overflow-x-auto border border-ink-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink-50 text-ink-700 font-bold uppercase text-[10px] border-b border-ink-100">
                  <tr>
                    <th className="p-3">लॉट ID</th>
                    <th className="p-3">सामग्री (Material)</th>
                    <th className="p-3">वजन (kg)</th>
                    <th className="p-3">कबाड़ी (Collector)</th>
                    <th className="p-3">एग्रीगेटर</th>
                    <th className="p-3">भू-निर्देशांक (GPS)</th>
                    <th className="p-3">स्थिति (Status)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {lots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-ink-50/40 transition">
                      <td className="p-3 font-mono font-bold text-leaf-700">{lot.id}</td>
                      <td className="p-3 font-bold text-ink-900">{lot.material}</td>
                      <td className="p-3 font-mono text-ink-900 font-bold">{lot.weight_kg} kg</td>
                      <td className="p-3 text-ink-700">{lot.collector}</td>
                      <td className="p-3 text-ink-600">{lot.buyerName}</td>
                      <td className="p-3 font-mono text-[10px] text-ink-500">{lot.gps || "21.1458° N, 79.0882° E"}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-leaf-50 text-leaf-700 border border-leaf-100 uppercase">
                          VERIFIED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: FORMALIZATION METRIC */}
        {activeTab === "formalization" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-6 bg-ink-50/70 border border-ink-100 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-base text-ink-900">
                अनौपचारिक श्रमिकों का औपचारिक समावेश (Informal Sector Inclusion)
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                खान मंत्रालय के दिशानिर्देशों के तहत, स्मेल्टरों को उनके द्वारा उपयोग की जाने वाली द्वितीयक धातु का कम से कम 20% अनौपचारिक कबाड़ियों (DPI पंजीकृत) से प्राप्त करना अनिवार्य है।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-ink-100">
                  <p className="text-[10px] font-bold text-ink-500 uppercase">प्रत्यक्ष कबाड़ी भुगतान</p>
                  <p className="text-2xl font-black text-leaf-600 font-mono mt-1">₹38,400</p>
                  <p className="text-[10px] text-ink-500">सीधे बैंक / नकद रसीद द्वारा</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-ink-100">
                  <p className="text-[10px] font-bold text-ink-500 uppercase">सक्रिय कबाड़ी सहभागी</p>
                  <p className="text-2xl font-black text-ink-900 font-mono mt-1">14 व्यक्ति</p>
                  <p className="text-[10px] text-ink-500">नागपुर कलमाना-वाडी बेल्ट</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-ink-100">
                  <p className="text-[10px] font-bold text-ink-500 uppercase">औपचारिक समावेश दर</p>
                  <p className="text-2xl font-black text-leaf-600 font-mono mt-1">28.4%</p>
                  <p className="text-[10px] text-leaf-700 font-semibold">लक्ष्य (20%) से अधिक</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}