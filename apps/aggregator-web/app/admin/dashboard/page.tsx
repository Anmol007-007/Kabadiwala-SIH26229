"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Scale,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";

const HeatmapMap = dynamic(() => import("@/components/HeatmapMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] rounded-3xl bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-800">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      <p className="text-xs font-mono">Initializing PostGIS Geospatial Engine...</p>
    </div>
  ),
});

export default function RegulatorDashboard() {
  const [activeTab, setActiveTab] = useState<"flow" | "leakage" | "datasets" | "spatial">("flow");
  const [hidePii, setHidePii] = useState(true);

  const leakageItems = [
    {
      title: "Consignments Delivered to Lapsed Facilities",
      value: "68.7 kg",
      severity: "CRITICAL",
      desc: "Batch routed to plant with expired authorization (MH/EPR/R/2021/00109)",
      status: "Notice Issued",
    },
    {
      title: "Scrap Lots Held in Aggregator Storage > 14 Days",
      value: "79.7 kg",
      severity: "WARNING",
      desc: "Nagpur Zone 2 Aggregator exceeding statutory CPCB storage limit",
      status: "Audit Scheduled",
    },
    {
      title: "Doorstep Weight Estimate Disputes (>25% Variance)",
      value: "6 Incidents",
      severity: "MONITOR",
      desc: "Flagged differences between collector photo estimate and shop scale",
      status: "Re-calibrated",
    },
  ];

  const datasets = [
    { name: "Materials Registry", rows: 24, fields: "code, name, base_rate, epr_category", updated: "10 mins ago" },
    { name: "Published Prices", rows: 180, fields: "material_id, buyer_id, rate_inr, effective_date", updated: "Just now" },
    { name: "Authorised Recyclers", rows: 12, fields: "cpcb_reg, name, capacity_tpa, status", updated: "1 hour ago" },
    { name: "Doorstep Transactions", rows: 1458, fields: "trx_id, collector_hash, weight, payout", updated: "Live stream" },
    { name: "Chain-of-Custody Waybills", rows: 87, fields: "lot_id, hash, aggregator_id, recycler_id", updated: "Live stream" },
    { name: "Formalized Collectors", rows: 3840, fields: "id_hash, cluster, onboarding_date", updated: "Today" },
  ];

  return (
    <div className="min-h-screen bg-white text-ink-900 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-ink-50/70 border border-ink-100 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white ring-1 ring-ink-100 text-leaf-700 shadow-2xs">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
                  Regulator Oversight & Leakage Audit
                </h1>
                <span className="text-[10px] bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 px-2 py-0.5 rounded-full font-mono font-bold">
                  JNARDDC / CPCB MANDATE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-500 mt-0.5">
                Ministry of Mines, Government of India &bull; Jawaharlal Nehru Aluminium Research Development & Design Centre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setHidePii(!hidePii)}
              className="px-3.5 py-2 bg-white hover:bg-ink-50 text-ink-700 text-xs font-semibold rounded-2xl ring-1 ring-ink-100 flex items-center gap-2 transition-colors shadow-2xs"
            >
              {hidePii ? <EyeOff className="w-4 h-4 text-leaf-700" /> : <Eye className="w-4 h-4 text-ink-500" />}
              <span>{hidePii ? "PII Redacted (Privacy Active)" : "Show Real Collector Names"}</span>
            </button>
          </div>
        </header>

        <div className="flex items-center gap-2 border-b border-ink-100 pb-2 overflow-x-auto">
          {[
            { id: "flow", label: "District Material Flow (1,458 kg Traced)" },
            { id: "leakage", label: "Leakage & Compliance Audit (3 Alerts)" },
            { id: "spatial", label: "PostGIS Spatial Clusters (India Grid)" },
            { id: "datasets", label: "6 Core Platform Datasets" },
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

        {activeTab === "flow" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 bg-ink-50 border border-ink-100 rounded-3xl">
                <p className="text-[11px] text-ink-500 uppercase font-semibold">Total District Secondary Mass</p>
                <p className="text-3xl font-extrabold text-ink-900 mt-2">1,458 kg</p>
                <p className="text-xs text-leaf-700 font-semibold mt-1">&bull; Across 87 verified handovers</p>
              </div>

              <div className="p-6 bg-ink-50 border border-ink-100 rounded-3xl">
                <p className="text-[11px] text-ink-500 uppercase font-semibold">Value Transferred to Informal Sector</p>
                <p className="text-3xl font-extrabold text-leaf-600 font-mono mt-2">₹2,22,416</p>
                <p className="text-xs text-ink-500 mt-1">&bull; Direct cash & UPI (Zero cut)</p>
              </div>

              <div className="p-6 bg-ink-50 border border-ink-100 rounded-3xl">
                <p className="text-[11px] text-ink-500 uppercase font-semibold">Formal Plant Gate Absorption</p>
                <p className="text-3xl font-extrabold text-ink-900 mt-2">91.4%</p>
                <p className="text-xs text-ink-500 mt-1">&bull; 8.6% currently in transit</p>
              </div>
            </div>

            <div className="p-8 bg-white border border-ink-100 rounded-3xl space-y-6 shadow-sm">
              <h3 className="font-bold text-base text-ink-900">Closed-Loop Custody Handover Stream</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                <div className="p-5 bg-ink-50 border border-ink-100 rounded-2xl space-y-3">
                  <span className="text-[10px] font-mono text-leaf-700 font-bold uppercase bg-leaf-50 px-2 py-0.5 rounded-full ring-1 ring-leaf-100">TIER 1 &bull; DOORSTEP PICK</span>
                  <h4 className="font-bold text-sm text-ink-900">Informal Collectors</h4>
                  <p className="text-xs text-ink-500">
                    {hidePii ? "Collector #RK-4417, #SB-1092, #IK-9921" : "Ramesh Kumar, Sunita Bai, Imran Khan"}
                  </p>
                  <p className="text-lg font-black text-ink-900 font-mono">1,458 kg collected</p>
                </div>

                <div className="p-5 bg-ink-50 border border-ink-100 rounded-2xl space-y-3">
                  <span className="text-[10px] font-mono text-ink-700 font-bold uppercase bg-white px-2 py-0.5 rounded-full ring-1 ring-ink-100">TIER 2 &bull; CONSOLIDATION</span>
                  <h4 className="font-bold text-sm text-ink-900">Registered Aggregators</h4>
                  <p className="text-xs text-ink-500">Wadi Scrap Aggregators, Sitabuldi Cluster</p>
                  <p className="text-lg font-black text-ink-900 font-mono">52 bulk lots bundled</p>
                </div>

                <div className="p-5 bg-ink-50 border border-ink-100 rounded-2xl space-y-3">
                  <span className="text-[10px] font-mono text-leaf-700 font-bold uppercase bg-leaf-50 px-2 py-0.5 rounded-full ring-1 ring-leaf-100">TIER 3 &bull; SMELTING & EPR</span>
                  <h4 className="font-bold text-sm text-ink-900">Authorised Recyclers</h4>
                  <p className="text-xs text-ink-500">Vidarbha Metal Recovery (Butibori)</p>
                  <p className="text-lg font-black text-leaf-700 font-mono">1.33 MT CPCB Mined</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leakage" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-ink-900">Automated Supply Chain Leakage Detector</h2>
              <p className="text-xs text-ink-500">
                Algorithmically detects diversion, unauthorized burning, expired licenses, and weight discrepancies
              </p>
            </div>

            <div className="space-y-3">
              {leakageItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white border border-ink-100 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:border-leaf-600 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-clay-700" />
                      <h4 className="font-bold text-sm text-ink-900">{item.title}</h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-clay-100 text-clay-700">
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500">{item.desc}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-lg font-black text-ink-900">{item.value}</span>
                    <span className="text-xs font-semibold px-3 py-1 bg-ink-50 text-ink-700 rounded-xl border border-ink-100">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "spatial" && (
          <div className="bg-white border border-ink-100 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-ink-900">National PostGIS Geospatial Aggregation Map</h2>
              <p className="text-xs text-ink-500">
                Spatial clustering of informal urban mining handovers across India
              </p>
            </div>
            <div className="w-full relative min-h-[440px]">
              <HeatmapMap geojsonData={{ type: "FeatureCollection", features: [] }} selectedMaterial="ALL" />
            </div>
          </div>
        )}

        {activeTab === "datasets" && (
          <div className="bg-white border border-ink-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-ink-100">
              <div>
                <h2 className="text-lg font-bold text-ink-900">6 Core Platform Relational Tables</h2>
                <p className="text-xs text-ink-500">
                  Open Digital Public Infrastructure schema conforming to Ministry of Mines DPI guidelines
                </p>
              </div>
              <button className="px-3.5 py-2 bg-leaf-600 hover:bg-leaf-700 text-white text-xs font-semibold rounded-2xl shadow-sm flex items-center gap-1.5 active:scale-[.98]">
                <Download className="w-4 h-4" />
                <span>Export Schema (JSON)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.map((table, idx) => (
                <div key={idx} className="p-4 bg-ink-50 border border-ink-100 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-ink-900">{table.name}</span>
                    <span className="text-[10px] font-mono text-leaf-700 bg-leaf-50 ring-1 ring-leaf-100 px-2 py-0.5 rounded-full font-bold">
                      {table.rows} rows
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-ink-600 break-words">{table.fields}</p>
                  <p className="text-[10px] text-ink-400 pt-1 border-t border-ink-100">Sync: {table.updated}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}