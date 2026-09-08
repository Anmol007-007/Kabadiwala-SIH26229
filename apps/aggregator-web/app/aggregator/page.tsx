"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  ShieldCheck,
  Check,
  Plus,
  Zap,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function AggregatorPortal() {
  const [activeTab, setActiveTab] = useState<"inbound" | "stock" | "loads" | "ratecard">("inbound");

  const [inboundListings, setInboundListings] = useState([
    {
      id: "LOT-NGP-84741",
      collector: "Ramesh Kumar (रमेश)",
      location: "Kalmna - Wadi Belt, 1.2 km away",
      material: "Circuit Boards (Grade A Mobile PCBs)",
      weight_kg: 8.0,
      askingPrice: 5407,
      status: "PENDING_QUOTE",
      timestamp: "12 mins ago",
    },
    {
      id: "LOT-NGP-84739",
      collector: "Sunita Bai (सुनीता)",
      location: "MIDC Hingna, 2.4 km away",
      material: "Mobile Boards & Keypads",
      weight_kg: 3.4,
      askingPrice: 2450,
      status: "QUOTE_SENT",
      timestamp: "35 mins ago",
    },
    {
      id: "LOT-NGP-84732",
      collector: "Imran Khan (इमरान)",
      location: "Sitabuldi Market, 3.8 km away",
      material: "Mixed Copper & Aluminium Cable",
      weight_kg: 42.0,
      askingPrice: 19800,
      status: "PENDING_QUOTE",
      timestamp: "1 hour ago",
    },
  ]);

  const [floorStock, setFloorStock] = useState([
    { id: 201, grade: "Circuit Boards (Grade A)", weight_kg: 18.4, value: 14168, status: "READY_TO_BUNDLE" },
    { id: 202, grade: "Copper Extrusion Wire", weight_kg: 22.5, value: 10800, status: "READY_TO_BUNDLE" },
    { id: 203, grade: "Lithium-ion Battery Packs", weight_kg: 10.0, value: 4200, status: "READY_TO_BUNDLE" },
  ]);

  const [rates, setRates] = useState([
    { grade: "Circuit Boards (Mobile PCBs)", price: 720, change: "+3.2%", minKg: 2 },
    { grade: "Circuit Boards (Computer/Server)", price: 260, change: "+1.5%", minKg: 5 },
    { grade: "Copper Wires & Strips", price: 480, change: "-0.8%", minKg: 3 },
    { grade: "Aluminium Castings & Cans", price: 215, change: "+1.1%", minKg: 5 },
    { grade: "Li-ion Battery Cells", price: 410, change: "+2.0%", minKg: 2 },
  ]);

  const [loads, setLoads] = useState([
    {
      loadId: "BULK-NGP-084",
      material: "Circuit Boards (Consolidated)",
      weight: 28.0,
      destination: "Vidarbha Metal Recovery Pvt Ltd (MIDC Butibori)",
      status: "IN_TRANSIT",
      hash: "c8f2b414d9b3a099a4c11b023fec9a796e6d78a9c2df3607ba9f1709403db812",
    },
  ]);

  const [activeQuoteLot, setActiveQuoteLot] = useState<string | null>(null);

  const handleSendQuote = (id: string) => {
    setInboundListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "QUOTE_SENT" } : item))
    );
    setActiveQuoteLot(null);
  };

  const adjustRate = (idx: number, delta: number) => {
    setRates((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, price: Math.max(10, r.price + delta) } : r))
    );
  };

  return (
    <div className="min-h-screen bg-white text-ink-900 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-ink-50/70 border border-ink-100 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white ring-1 ring-ink-100 text-ink-700 shadow-2xs">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
                  Wadi Scrap Aggregators
                </h1>
                <span className="text-[10px] bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 px-2 py-0.5 rounded-full font-mono font-bold">
                  REGISTERED AGGREGATOR
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-500 mt-0.5">
                Plot 14, Wadi Industrial Area, Nagpur &bull; CPCB Reg:{" "}
                <span className="text-ink-700 font-mono">MH/EPR/A/2024/00522</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border border-ink-100 rounded-2xl text-xs text-right shadow-2xs">
              <p className="text-ink-500 text-[10px] uppercase font-semibold">Consolidated Stock on Floor</p>
              <p className="text-lg font-black text-ink-900">50.9 kg</p>
            </div>
            <div className="px-4 py-2 bg-leaf-50 ring-1 ring-leaf-100 text-leaf-700 rounded-2xl text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Plant Gate Ready</span>
            </div>
          </div>
        </header>

        <div className="flex items-center gap-2 border-b border-ink-100 pb-2 overflow-x-auto">
          {[
            { id: "inbound", label: "Buy from Collectors", count: inboundListings.filter((i) => i.status === "PENDING_QUOTE").length },
            { id: "stock", label: "My Stock on Floor", count: "50.9 kg" },
            { id: "loads", label: "Bulk Loads for Recyclers", count: loads.length },
            { id: "ratecard", label: "My Rate Card & Rules" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-ink-900 text-white shadow-sm"
                  : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white text-ink-900 font-bold" : "bg-ink-100 text-ink-700"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "inbound" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink-900">Nearby Collector Listings Awaiting Offer</h2>
                <p className="text-xs text-ink-500">
                  Small doorstep lots (3–8 kg) broadcast by informal collectors within a 5 km radius
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inboundListings.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-white border border-ink-100 rounded-3xl p-5 shadow-2xs space-y-4 flex flex-col justify-between hover:border-leaf-600 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-leaf-700 bg-leaf-50 ring-1 ring-leaf-100 px-2 py-0.5 rounded-full font-bold">
                        {lot.id}
                      </span>
                      <span className="text-[10px] text-ink-400">{lot.timestamp}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-ink-900">{lot.material}</h3>
                      <p className="text-xs text-ink-700 font-medium">{lot.collector}</p>
                      <p className="text-[11px] text-ink-400">{lot.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ink-100">
                      <div>
                        <span className="text-[10px] text-ink-400 uppercase font-semibold">Weight</span>
                        <p className="text-base font-extrabold text-ink-900">{lot.weight_kg} kg</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-400 uppercase font-semibold">Benchmark Payout</span>
                        <p className="text-base font-extrabold text-leaf-600 font-mono">₹{lot.askingPrice}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    {lot.status === "QUOTE_SENT" ? (
                      <div className="w-full py-2 bg-leaf-50 text-leaf-700 text-xs font-semibold rounded-2xl ring-1 ring-leaf-100 text-center flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Quote Submitted &bull; Waiting Collector QR</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSendQuote(lot.id)}
                        className="w-full py-2.5 bg-leaf-600 hover:bg-leaf-700 text-white font-semibold text-xs rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-1.5 active:scale-[.98]"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Send Offer (₹{lot.askingPrice})</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "stock" && (
          <div className="bg-white border border-ink-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-ink-100">
              <div>
                <h2 className="text-lg font-bold text-ink-900">Aggregated Floor Inventory</h2>
                <p className="text-xs text-ink-500">
                  Consolidated lots collected from door-to-door informal pickers, ready to be bundled into bulk lots
                </p>
              </div>
              <button className="px-3.5 py-2 bg-leaf-600 hover:bg-leaf-700 text-white text-xs font-semibold rounded-2xl shadow-sm transition-all flex items-center gap-1.5 active:scale-[.98]">
                <Plus className="w-4 h-4" />
                <span>Build New Bulk Load (25+ kg)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {floorStock.map((stock) => (
                <div key={stock.id} className="p-4 bg-ink-50 rounded-2xl border border-ink-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-ink-500">LOT #{stock.id}</span>
                    <span className="text-[10px] text-leaf-700 font-bold bg-leaf-50 ring-1 ring-leaf-100 px-2 py-0.5 rounded-full">READY</span>
                  </div>
                  <h4 className="font-bold text-sm text-ink-900">{stock.grade}</h4>
                  <div className="flex items-center justify-between pt-2 border-t border-ink-100">
                    <span className="text-base font-extrabold text-ink-900">{stock.weight_kg} kg</span>
                    <span className="font-mono text-xs text-leaf-700 font-bold">₹{stock.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "loads" && (
          <div className="bg-white border border-ink-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-ink-100">
              <div>
                <h2 className="text-lg font-bold text-ink-900">Dispatched Bulk Loads (Plant Gate Minimum 25 kg)</h2>
                <p className="text-xs text-ink-500">
                  Secured with SHA-256 chain-of-custody hash for formal smelter inward verification
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {loads.map((load) => (
                <div
                  key={load.loadId}
                  className="p-5 bg-white border border-ink-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink-900">{load.loadId}</span>
                      <span className="text-[10px] font-mono bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 px-2 py-0.5 rounded-full font-bold">
                        {load.status}
                      </span>
                    </div>
                    <p className="text-xs text-ink-700">{load.material} &bull; <strong className="text-ink-900">{load.weight} kg</strong></p>
                    <p className="text-[11px] text-ink-500">Destination: {load.destination}</p>
                    <p className="text-[10px] font-mono text-ink-400 truncate max-w-md">Hash: {load.hash}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl ring-1 ring-ink-100 shadow-2xs">
                      <QRCodeSVG value={`https://mines.gov.in/verify?hash=${load.hash}`} size={60} />
                    </div>
                    <Link
                      href="/smelter"
                      className="px-3.5 py-2 bg-white hover:bg-ink-50 text-ink-700 text-xs font-semibold rounded-2xl border border-ink-100 transition-colors"
                    >
                      Verify on Recycler Tab &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "ratecard" && (
          <div className="bg-white border border-ink-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-ink-100">
              <div>
                <h2 className="text-lg font-bold text-ink-900">Aggregator Benchmark Rate Card</h2>
                <p className="text-xs text-ink-500">
                  Published daily rates offered to door-to-door pickers across Nagpur clusters
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {rates.map((rate, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white border border-ink-100 rounded-2xl flex items-center justify-between gap-4 shadow-2xs"
                >
                  <div>
                    <h4 className="font-bold text-sm text-ink-900">{rate.grade}</h4>
                    <p className="text-xs text-ink-500 mt-0.5">Min Acceptance: {rate.minKg} kg &bull; Daily Trend: <span className="text-leaf-600 font-bold">{rate.change}</span></p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustRate(idx, -10)}
                      className="w-8 h-8 rounded-xl bg-ink-50 hover:bg-ink-100 text-ink-900 font-bold text-sm flex items-center justify-center transition-colors border border-ink-100"
                    >
                      -
                    </button>
                    <span className="font-mono text-base font-extrabold text-ink-900 w-20 text-center">
                      ₹{rate.price}<span className="text-xs text-ink-400 font-normal">/kg</span>
                    </span>
                    <button
                      onClick={() => adjustRate(idx, 10)}
                      className="w-8 h-8 rounded-xl bg-ink-50 hover:bg-ink-100 text-ink-900 font-bold text-sm flex items-center justify-center transition-colors border border-ink-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
