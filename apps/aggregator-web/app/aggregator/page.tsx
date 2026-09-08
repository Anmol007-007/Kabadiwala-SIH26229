"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  ShieldCheck,
  Check,
  Plus,
  Zap,
  ArrowRight,
  PackageCheck,
  Truck,
  Hash,
  RefreshCw,
  QrCode,
  CheckCircle2,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useApp } from "@/context/AppContext";

export default function AggregatorPortal() {
  const {
    lots,
    floorStock,
    loads,
    rates,
    sendQuote,
    completeHandover,
    bundleFloorStock,
    refreshData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"inbound" | "stock" | "loads" | "ratecard">("inbound");
  const [activeQuoteLotId, setActiveQuoteLotId] = useState<string | null>(null);
  const [customRateInput, setCustomRateInput] = useState<number>(720);
  const [selectedStockIds, setSelectedStockIds] = useState<string[]>([]);
  const [destinationPlant, setDestinationPlant] = useState("Vidarbha Metal Recovery Pvt Ltd (MIDC Butibori)");
  const [selectedLoadQr, setSelectedLoadQr] = useState<any>(null);

  // Toggle selection for bundling
  const toggleStockSelection = (id: string) => {
    setSelectedStockIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedStockItems = floorStock.filter((s) => selectedStockIds.includes(s.id));
  const selectedTotalWeight = Number(
    selectedStockItems.reduce((acc, curr) => acc + curr.weight_kg, 0).toFixed(1)
  );

  const handleCreateBundle = () => {
    if (selectedStockIds.length === 0) return;
    const newLoad = bundleFloorStock(selectedStockIds, destinationPlant);
    setSelectedStockIds([]);
    setActiveTab("loads");
    setSelectedLoadQr(newLoad);
  };

  return (
    <div className="min-h-screen bg-white text-ink-900 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Aggregator Shop Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-ink-50/70 border border-ink-100 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white ring-1 border-ink-100 text-ink-700 shadow-2xs">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
                  Wadi Scrap Aggregators
                </h1>
                <span className="text-[10px] bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 px-2 py-0.5 rounded-full font-mono font-bold">
                  CPCB AUTHORISED AGGREGATOR
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-500 mt-0.5">
                Plot 14, Wadi Industrial Area, Nagpur &bull; CPCB Reg:{" "}
                <span className="font-mono text-ink-700 font-semibold">MH/EPR/A/2024/00522</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="px-3.5 py-2 bg-white hover:bg-ink-50 text-ink-700 text-xs font-semibold rounded-2xl border border-ink-100 flex items-center gap-2 transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-leaf-600" />
              <span>Refresh Queue</span>
            </button>
            <div className="px-3 py-1.5 bg-leaf-50 border border-leaf-100 rounded-2xl text-xs text-leaf-700 font-mono font-bold">
              Floor Stock: {floorStock.reduce((a, b) => a + b.weight_kg, 0).toFixed(1)} kg
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-ink-100 pb-2 overflow-x-auto">
          {[
            { id: "inbound", label: `Inbound Scrap Queue (${lots.filter(l => l.status !== "HANDED_OVER").length})` },
            { id: "stock", label: `Aggregator Floor Stock (${floorStock.length} items)` },
            { id: "loads", label: `Industrial Bulk Batches (${loads.length})` },
            { id: "ratecard", label: "Rate Card & Benchmark Matrix" },
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

        {/* TAB 1: INBOUND QUEUE (REAL-TIME FROM COLLECTORS) */}
        {activeTab === "inbound" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-ink-900">कबाड़ी आवक सूची (Live Inbound Lots from Collectors)</h3>
                <p className="text-xs text-ink-500">
                  कलेक्टर ऐप से बनाया गया कोई भी लॉट यहाँ तुरंत दिखाई देता है।
                </p>
              </div>
              <span className="text-xs font-mono text-leaf-700 font-bold bg-leaf-50 px-2.5 py-1 rounded-xl border border-leaf-100">
                Real-Time PostGIS Matching Active
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {lots.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-white border border-ink-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-leaf-600 transition shadow-2xs"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-ink-700 bg-ink-50 px-2 py-0.5 rounded-lg border border-ink-100">
                        {item.id}
                      </span>
                      <span className="text-xs font-bold text-ink-900">{item.collector}</span>
                      <span className="text-[11px] text-ink-500">&bull; {item.location}</span>
                      <span className="text-[10px] text-ink-400 font-mono">({item.timestamp})</span>
                    </div>

                    <h4 className="font-extrabold text-sm sm:text-base text-ink-900">{item.material}</h4>

                    <div className="flex items-center gap-3 text-xs text-ink-600">
                      <span>वजन: <strong className="text-ink-900 font-mono">{item.weight_kg} kg</strong></span>
                      <span>दर: <strong className="text-ink-900 font-mono">₹{item.ratePerKg}/kg</strong></span>
                      <span>कुल राशि: <strong className="text-leaf-600 font-mono font-bold">₹{item.totalPayout}</strong></span>
                    </div>

                    {item.audioTranscript && (
                      <p className="text-[11px] text-ink-500 font-mono bg-ink-50 px-2 py-0.5 rounded-md inline-block">
                        🎙️ Voice Log: &quot;{item.audioTranscript}&quot;
                      </p>
                    )}
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-xl font-bold uppercase ${
                        item.status === "OFFER_ACCEPTED"
                          ? "bg-leaf-50 text-leaf-700 border border-leaf-100"
                          : item.status === "QUOTE_SENT"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : item.status === "HANDED_OVER"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>

                    {item.status === "PENDING_QUOTE" && (
                      <div className="flex items-center gap-2">
                        {activeQuoteLotId === item.id ? (
                          <div className="flex items-center gap-2 bg-ink-50 p-1.5 rounded-2xl border border-ink-200">
                            <span className="text-xs font-bold text-ink-600">₹</span>
                            <input
                              type="number"
                              value={customRateInput}
                              onChange={(e) => setCustomRateInput(Number(e.target.value))}
                              className="w-16 bg-white border border-ink-200 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                            />
                            <button
                              onClick={() => {
                                sendQuote(item.id, customRateInput);
                                setActiveQuoteLotId(null);
                              }}
                              className="px-3 py-1 bg-leaf-600 hover:bg-leaf-700 text-white rounded-xl text-xs font-bold transition"
                            >
                              भेजें
                            </button>
                            <button
                              onClick={() => setActiveQuoteLotId(null)}
                              className="px-2 py-1 text-xs text-ink-500"
                            >
                              रद्द
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveQuoteLotId(item.id);
                              setCustomRateInput(item.ratePerKg);
                            }}
                            className="px-3.5 py-2 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs rounded-2xl shadow-xs transition flex items-center gap-1"
                          >
                            <span>ऑफर / कोटेशन भेजें</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {item.status === "OFFER_ACCEPTED" && (
                      <button
                        onClick={() => completeHandover(item.id)}
                        className="px-3.5 py-2 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>माल हैंडओवर स्वीकारें (Scan QR)</span>
                      </button>
                    )}

                    {item.status === "HANDED_OVER" && (
                      <span className="text-xs text-leaf-700 font-semibold flex items-center gap-1 bg-leaf-50 px-2 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        स्टॉक में मौजूद
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AGGREGATOR FLOOR STOCK & BUNDLING */}
        {activeTab === "stock" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-6 bg-ink-50/70 border border-ink-100 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-ink-900">
                    फ्लोर स्टॉक समूहन (Industrial Lot Consolidation)
                  </h3>
                  <p className="text-xs text-ink-500">
                    कम से कम 25 kg का बैच बनाएं ताकि औपचारिक रिसाइक्लर/स्मेल्टर को भेजा जा सके।
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-ink-500 font-bold uppercase">चयनित कुल वजन</p>
                    <p className="text-xl font-mono font-extrabold text-leaf-600">
                      {selectedTotalWeight} <span className="text-xs font-normal">kg</span>
                    </p>
                  </div>
                  <button
                    onClick={handleCreateBundle}
                    disabled={selectedStockIds.length === 0}
                    className="px-4 py-2.5 bg-leaf-600 hover:bg-leaf-700 disabled:opacity-40 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>औद्योगिक बैच बनाएं व प्रेषित करें</span>
                  </button>
                </div>
              </div>

              {/* Destination selector */}
              <div className="pt-2 border-t border-ink-100 flex items-center gap-3 text-xs">
                <span className="font-semibold text-ink-700">गंतव्य रिसाइक्लर (Destination):</span>
                <select
                  value={destinationPlant}
                  onChange={(e) => setDestinationPlant(e.target.value)}
                  className="bg-white border border-ink-200 rounded-xl px-2.5 py-1 text-xs font-bold text-ink-800"
                >
                  <option value="Vidarbha Metal Recovery Pvt Ltd (MIDC Butibori)">
                    Vidarbha Metal Recovery Pvt Ltd (MIDC Butibori) - CPCB Auth
                  </option>
                  <option value="Nagpur Critical Minerals Smelter (Kalmna)">
                    Nagpur Critical Minerals Smelter (Kalmna)
                  </option>
                </select>
              </div>
            </div>

            {/* Stock Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {floorStock.map((stock) => {
                const isSelected = selectedStockIds.includes(stock.id);
                return (
                  <div
                    key={stock.id}
                    onClick={() => toggleStockSelection(stock.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-leaf-50 border-leaf-600 ring-2 ring-leaf-600/30 shadow-xs"
                        : "bg-white border-ink-100 hover:border-ink-200 hover:bg-ink-50/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-ink-600 bg-ink-50 px-2 py-0.5 rounded-md">
                        {stock.id}
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded accent-leaf-600 w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <h4 className="font-bold text-sm text-ink-900">{stock.grade}</h4>
                    <p className="font-mono text-lg font-black text-leaf-700 mt-1">
                      {stock.weight_kg} kg
                    </p>
                    <p className="text-xs text-ink-500 font-mono">मूल्य: ₹{stock.value.toLocaleString("en-IN")}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: INDUSTRIAL LOADS & QR MINTING */}
        {activeTab === "loads" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-ink-900">
                  प्रेषित औद्योगिक बैच (Dispatched Industrial Batches)
                </h3>
                <p className="text-xs text-ink-500">
                  प्रत्येक बैच SHA-256 डिजिटल सील और QR कोड से सुरक्षित है।
                </p>
              </div>
              <span className="text-xs font-mono text-leaf-700 bg-leaf-50 px-2.5 py-1 rounded-xl border border-leaf-100 font-bold">
                Tamper-Proof Custody Chain
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {loads.map((load) => (
                <div
                  key={load.loadId}
                  className="p-5 bg-white border border-ink-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded-lg border border-leaf-100">
                        {load.loadId}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold uppercase">
                        {load.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-ink-500 font-mono">{load.dispatchedAt}</span>
                    </div>

                    <h4 className="font-bold text-base text-ink-900">{load.material}</h4>
                    <p className="text-xs text-ink-600">गंतव्य: <strong>{load.destination}</strong></p>

                    <div className="flex items-center gap-2 text-xs font-mono text-ink-500 pt-1">
                      <Hash className="w-3.5 h-3.5 text-leaf-600" />
                      <span className="truncate max-w-sm sm:max-w-md">{load.hash}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-ink-400 font-bold uppercase">वजन</p>
                      <p className="text-xl font-mono font-black text-ink-900">{load.weight} kg</p>
                    </div>

                    <button
                      onClick={() => setSelectedLoadQr(load)}
                      className="p-3 bg-ink-50 hover:bg-leaf-50 text-ink-700 hover:text-leaf-700 rounded-2xl border border-ink-100 transition shadow-2xs"
                      title="Show Industrial Batch QR Code"
                    >
                      <QrCode className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BENCHMARK RATE CARD */}
        {activeTab === "ratecard" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-ink-900">
                  दैनिक आधिकारिक स्क्रैप दरें (Daily Benchmark Scrap Rates)
                </h3>
                <p className="text-xs text-ink-500">
                  खान मंत्रालय और सीपीसीबी द्वारा प्रमाणित थोक दरें (Nagpur District Benchmark)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-ink-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink-50 text-ink-700 font-bold uppercase text-[10px] border-b border-ink-100">
                  <tr>
                    <th className="p-3">सामग्री (Material Grade)</th>
                    <th className="p-3">श्रेणी</th>
                    <th className="p-3">वर्तमान दर (₹/kg)</th>
                    <th className="p-3">दैनिक बदलाव</th>
                    <th className="p-3">न्यूनतम मात्रा</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {rates.map((r, i) => (
                    <tr key={i} className="hover:bg-ink-50/40 transition">
                      <td className="p-3 font-bold text-ink-900">{r.nameEn} ({r.nameHi})</td>
                      <td className="p-3 font-mono text-ink-600">{r.category}</td>
                      <td className="p-3 font-mono font-extrabold text-leaf-700 text-sm">₹{r.price}/kg</td>
                      <td className={`p-3 font-mono font-bold ${r.up ? "text-leaf-600" : "text-clay-700"}`}>
                        {r.change}
                      </td>
                      <td className="p-3 font-mono text-ink-600">{r.minKg} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Batch QR Modal */}
        {selectedLoadQr && (
          <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-ink-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
              <div className="flex items-center justify-between pb-2 border-b border-ink-100">
                <h4 className="font-bold text-sm text-ink-900">औद्योगिक बैच क्यूआर कोड</h4>
                <button onClick={() => setSelectedLoadQr(null)} className="text-ink-500 hover:text-ink-900">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-white inline-block rounded-2xl shadow-sm border-2 border-leaf-600">
                <QRCodeSVG
                  value={`https://mines.gov.in/batch?id=${selectedLoadQr.loadId}&hash=${selectedLoadQr.hash}&weight=${selectedLoadQr.weight}`}
                  size={170}
                />
              </div>

              <div>
                <p className="font-mono text-xs font-bold text-leaf-700">{selectedLoadQr.loadId}</p>
                <p className="text-xs font-bold text-ink-900">{selectedLoadQr.material}</p>
                <p className="font-mono text-sm font-extrabold text-ink-800">{selectedLoadQr.weight} kg</p>
              </div>

              <div className="p-2.5 bg-ink-50 rounded-xl text-[10px] font-mono text-ink-600 break-all">
                SHA-256: {selectedLoadQr.hash}
              </div>

              <button
                onClick={() => setSelectedLoadQr(null)}
                className="w-full py-2 bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold rounded-2xl"
              >
                बंद करें
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
