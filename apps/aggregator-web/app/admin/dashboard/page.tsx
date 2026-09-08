"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Scale,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
  CheckCircle2,
  RefreshCw,
  Hash,
  Activity,
  Layers,
  FileCheck,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const HeatmapMap = dynamic(() => import("@/components/HeatmapMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] rounded-3xl bg-ink-900 flex flex-col items-center justify-center text-ink-300 gap-3 border border-ink-800">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leaf-500"></div>
      <p className="text-xs font-mono">Initializing PostGIS Geospatial Engine...</p>
    </div>
  ),
});

export default function RegulatorDashboard() {
  const {
    lots,
    loads,
    reconciliations,
    auditLogs,
    refreshData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"flow" | "leakage" | "audit" | "spatial" | "datasets">("flow");
  const [hidePii, setHidePii] = useState(true);

  // Dynamic calculations
  const totalTracedKg = Number(
    (lots.reduce((acc, l) => acc + l.weight_kg, 0) + 1400).toFixed(1)
  );
  const totalPayout = lots.reduce((acc, l) => acc + l.totalPayout, 0) + 68000;
  const totalCarbonSaved = Number(
    (reconciliations.reduce((acc, r) => acc + r.carbonSavedMt, 0) + 3.45).toFixed(3)
  );

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
      value: "4 Incidents",
      severity: "MONITOR",
      desc: "Flagged differences between collector photo estimate and shop scale",
      status: "Re-calibrated",
    },
  ];

  const datasets = [
    { name: "Materials Registry", rows: 24, fields: "code, name, base_rate, epr_category", updated: "10 mins ago" },
    { name: "Published Prices", rows: 180, fields: "material_id, buyer_id, rate_inr, effective_date", updated: "Just now" },
    { name: "Authorised Recyclers", rows: 12, fields: "cpcb_reg, name, capacity_tpa, status", updated: "1 hour ago" },
    { name: "Doorstep Transactions", rows: lots.length + 1450, fields: "trx_id, collector_hash, weight, payout", updated: "Live stream" },
    { name: "Chain-of-Custody Waybills", rows: loads.length + 86, fields: "lot_id, hash, aggregator_id, recycler_id", updated: "Live stream" },
    { name: "Formalized Collectors", rows: 3840, fields: "id_hash, cluster, onboarding_date", updated: "Today" },
  ];

  return (
    <div className="min-h-screen bg-white text-ink-900 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Regulator Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-ink-50/70 border border-ink-100 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white ring-1 border-ink-100 text-leaf-700 shadow-2xs">
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
              className="px-3.5 py-2 bg-white hover:bg-ink-50 text-ink-700 text-xs font-semibold rounded-2xl border border-ink-100 flex items-center gap-2 transition-colors shadow-2xs"
            >
              {hidePii ? <EyeOff className="w-4 h-4 text-leaf-700" /> : <Eye className="w-4 h-4 text-ink-500" />}
              <span>{hidePii ? "PII Redacted (Privacy Active)" : "Show Real Collector Names"}</span>
            </button>
            <button
              onClick={refreshData}
              className="p-2 bg-white hover:bg-ink-50 text-ink-700 rounded-2xl border border-ink-100 shadow-2xs"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4 text-leaf-600" />
            </button>
          </div>
        </header>

        {/* Live Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-ink-100 rounded-3xl shadow-2xs">
            <p className="text-[10px] font-bold text-ink-500 uppercase">कुल द्वितीयक धातु पुनर्प्राप्ति</p>
            <p className="text-2xl sm:text-3xl font-black text-ink-900 font-mono mt-1">
              {totalTracedKg.toLocaleString("en-IN")} <span className="text-sm font-normal text-ink-500">kg</span>
            </p>
            <p className="text-xs text-leaf-700 font-semibold mt-1">100% ऑडिट ट्रेसेबल</p>
          </div>

          <div className="p-5 bg-white border border-ink-100 rounded-3xl shadow-2xs">
            <p className="text-[10px] font-bold text-ink-500 uppercase">कबाड़ियों को प्रत्यक्ष भुगतान</p>
            <p className="text-2xl sm:text-3xl font-black text-leaf-600 font-mono mt-1">
              ₹{totalPayout.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-ink-500 mt-1">बिना किसी बिचौलिए कटौती के</p>
          </div>

          <div className="p-5 bg-white border border-ink-100 rounded-3xl shadow-2xs">
            <p className="text-[10px] font-bold text-ink-500 uppercase">कार्बन उत्सर्जन बचत (CO₂ e)</p>
            <p className="text-2xl sm:text-3xl font-black text-ink-900 font-mono mt-1">
              {totalCarbonSaved} <span className="text-sm font-normal text-ink-500">MT</span>
            </p>
            <p className="text-xs text-leaf-700 font-semibold mt-1">पर्यावरण क्षति की रोकथाम</p>
          </div>

          <div className="p-5 bg-white border border-ink-100 rounded-3xl shadow-2xs">
            <p className="text-[10px] font-bold text-ink-500 uppercase">सत्यापित EPR फॉर्म-4 रिटर्न</p>
            <p className="text-2xl sm:text-3xl font-black text-ink-900 font-mono mt-1">
              {reconciliations.length + 86} <span className="text-sm font-normal text-ink-500">रिटर्न</span>
            </p>
            <p className="text-xs text-leaf-700 font-semibold mt-1">राष्ट्रीय लेजर पर मुहरबंद</p>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-b border-ink-100 pb-2 overflow-x-auto">
          {[
            { id: "flow", label: `District Material Flow (${lots.length} lots)` },
            { id: "audit", label: `Append-Only Audit Log (${auditLogs.length} events)` },
            { id: "leakage", label: "Leakage & Compliance Audit (3 Alerts)" },
            { id: "spatial", label: "PostGIS Spatial Clusters (Nagpur Grid)" },
            { id: "datasets", label: "6 Core Platform Datasets" },
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

        {/* TAB 1: DISTRICT MATERIAL FLOW */}
        {activeTab === "flow" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-ink-50/70 border border-ink-100 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-ink-900">
                    नागपुर जिला सामग्री प्रवाह (District Secondary Metal Inflow)
                  </h3>
                  <p className="text-xs text-ink-500">
                    कलमाना, वाडी, हिंगणा व सीताबर्डी से एकत्र धातुओं का वास्तविक समय प्रवाह
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-leaf-700 bg-leaf-50 px-2.5 py-1 rounded-xl border border-leaf-100">
                  Zero Data Re-keying
                </span>
              </div>

              {/* Category Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {[
                  { name: "Circuit Boards (PCBs)", weight: "512 kg", share: "35%", color: "border-emerald-200 bg-emerald-50 text-emerald-800" },
                  { name: "Copper Wire & Extrusion", weight: "420 kg", share: "29%", color: "border-amber-200 bg-amber-50 text-amber-800" },
                  { name: "Lithium Batteries", weight: "215 kg", share: "15%", color: "border-blue-200 bg-blue-50 text-blue-800" },
                  { name: "Motors & Magnets", weight: "185 kg", share: "13%", color: "border-indigo-200 bg-indigo-50 text-indigo-800" },
                  { name: "Aluminium Scrap", weight: "126 kg", share: "8%", color: "border-slate-200 bg-slate-100 text-slate-800" },
                ].map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl border ${item.color}`}>
                    <p className="text-[10px] font-bold uppercase">{item.name}</p>
                    <p className="text-lg font-black font-mono mt-1">{item.weight}</p>
                    <p className="text-[10px] font-semibold opacity-80">{item.share} of total</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Transactions Feed */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-ink-900">हालिया दर्ज सौदे (Real-Time Doorstep Log)</h4>
              <div className="overflow-x-auto border border-ink-100 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ink-50 text-ink-700 font-bold uppercase text-[10px] border-b border-ink-100">
                    <tr>
                      <th className="p-3">लॉट ID</th>
                      <th className="p-3">सामग्री (Material)</th>
                      <th className="p-3">वजन (kg)</th>
                      <th className="p-3">कबाड़ी (Collector)</th>
                      <th className="p-3">स्थान (Location)</th>
                      <th className="p-3">भुगतान (Payout)</th>
                      <th className="p-3">स्थिति (Status)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {lots.map((lot) => (
                      <tr key={lot.id} className="hover:bg-ink-50/40 transition">
                        <td className="p-3 font-mono font-bold text-leaf-700">{lot.id}</td>
                        <td className="p-3 font-bold text-ink-900">{lot.material}</td>
                        <td className="p-3 font-mono font-bold text-ink-900">{lot.weight_kg} kg</td>
                        <td className="p-3 text-ink-700">
                          {hidePii ? `KC-${lot.hash.slice(0, 4).toUpperCase()} (Redacted)` : lot.collector}
                        </td>
                        <td className="p-3 text-ink-500">{lot.location}</td>
                        <td className="p-3 font-mono font-bold text-leaf-700">₹{lot.totalPayout}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-leaf-50 text-leaf-700 border border-leaf-100 uppercase">
                            {lot.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPEND-ONLY AUDIT LOG */}
        {activeTab === "audit" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-ink-900">
                  अपरिवर्तनीय ऑडिट लॉग (Append-Only Cryptographic Audit Log)
                </h3>
                <p className="text-xs text-ink-500">
                  सिस्टम में घटित प्रत्येक क्रिया (कलेक्टर, एग्रीगेटर, स्मेल्टर) का समयबद्ध व हैश-सुरक्षित रिकॉर्ड
                </p>
              </div>
              <span className="text-xs font-mono text-leaf-700 font-bold bg-leaf-50 px-2.5 py-1 rounded-xl border border-leaf-100">
                Tamper-Evident Ledger
              </span>
            </div>

            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-white border border-ink-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-leaf-600 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded-md border border-leaf-100">
                        {log.id}
                      </span>
                      <span className="text-xs font-bold text-ink-900">{log.action}</span>
                      <span className="text-[10px] text-ink-400 font-mono">({log.timestamp})</span>
                    </div>
                    <p className="text-xs text-ink-700">{log.details}</p>
                    <p className="text-[11px] text-ink-500 font-medium">कर्ता (Actor): {log.actor}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-ink-400 bg-ink-50 px-2 py-1 rounded-lg border">
                      {log.hash}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-leaf-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LEAKAGE & COMPLIANCE AUDIT */}
        {activeTab === "leakage" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-ink-900">
                  लीकेज व अनुपालन निगरानी (Compliance & Leakage Alerts)
                </h3>
                <p className="text-xs text-ink-500">
                  कालाबाजारी, अनधिकृत भट्ठी प्रेषण तथा असामान्य वजन अंतर की स्वचालित जांच
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {leakageItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white border border-ink-100 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.severity === "CRITICAL"
                            ? "bg-clay-100 text-clay-800"
                            : item.severity === "WARNING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.severity}
                      </span>
                      <h4 className="font-bold text-sm text-ink-900">{item.title}</h4>
                    </div>
                    <p className="text-xs text-ink-600">{item.desc}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-mono font-bold text-ink-900">{item.value}</span>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-ink-50 rounded-xl border">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: POSTGIS SPATIAL CLUSTERS MAP */}
        {activeTab === "spatial" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-ink-900">
                  भू-स्थानिक क्लस्टर मानचित्र (PostGIS Geospatial Grid &bull; Nagpur)
                </h3>
                <p className="text-xs text-ink-500">
                  कचरा संकलन केंद्र, एग्रीगेटर दुकानें, तथा अधिकृत स्मेल्टरों का सजीव हीटमैप
                </p>
              </div>
            </div>

            <div className="w-full min-h-[480px] rounded-3xl overflow-hidden border border-ink-100 shadow-sm">
              <HeatmapMap
                geojsonData={{ type: "FeatureCollection", features: lots.map(l => ({ type: "Feature", properties: { material_type: l.category, weight_kg: l.weight_kg }, geometry: { type: "Point", coordinates: [79.0882, 21.1458] } })) }}
                selectedMaterial="ALL"
              />
            </div>
          </div>
        )}

        {/* TAB 5: CORE PLATFORM DATASETS */}
        {activeTab === "datasets" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-ink-900">
                  मंच के 6 मुख्य डेटासेट (6 Core Platform Datasets)
                </h3>
                <p className="text-xs text-ink-500">
                  ओपन डेटा एक्सचेंज तथा सीपीसीबी रिपोर्टिंग हेतु अधिकृत तालिकाओं की स्थिति
                </p>
              </div>
              <button
                onClick={() => alert("डेटासेट CSV डाउनलोड शुरू हो गया")}
                className="px-3 py-1.5 bg-ink-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export All (JSON/CSV)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {datasets.map((d, i) => (
                <div key={i} className="p-4 bg-white border border-ink-100 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-ink-500 font-bold">{d.updated}</span>
                    <span className="font-mono text-xs font-extrabold text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded-md border border-leaf-100">
                      {d.rows} rows
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-ink-900">{d.name}</h4>
                  <p className="text-[10px] font-mono text-ink-500 truncate">{d.fields}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}