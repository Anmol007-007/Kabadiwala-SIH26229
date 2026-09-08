"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  Store,
  Factory,
  Scale,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const ROLES = [
  {
    id: "collector",
    title: "Kabadiwala / Ground Collector",
    titleHi: "कबाड़ीवाला / संग्रहकर्ता",
    org: "Ramesh Kumar",
    location: "Kalmna – Wadi Belt, Nagpur",
    reg: "KC-NGP-4417",
    path: "/collector",
    icon: Smartphone,
    badge: "Voice + Camera PWA",
    features: ["Voice-first scrap logging", "Live benchmark rates", "QR handover receipt"],
    accent: "leaf",
  },
  {
    id: "aggregator",
    title: "Aggregator / Scrap Shop",
    titleHi: "एग्रीगेटर / स्क्रैप दुकान",
    org: "Wadi Scrap Aggregators",
    location: "Plot 14, Wadi Industrial, Nagpur",
    reg: "CPCB: MH/EPR/A/2024/00522",
    path: "/aggregator",
    icon: Store,
    badge: "Inbound Queue",
    features: ["Real-time collector lots", "Floor stock & bundling", "Bulk batch dispatch"],
    accent: "ink",
  },
  {
    id: "smelter",
    title: "Recycler / Smelter",
    titleHi: "रिसाइक्लर / स्मेल्टर",
    org: "Vidarbha Metal Recovery Pvt Ltd",
    location: "MIDC Butibori, Nagpur",
    reg: "CPCB: MH/EPR/R/2024/00318",
    path: "/smelter",
    icon: Factory,
    badge: "Weighbridge + EPR",
    features: ["Inward batch verification", "Weight reconciliation", "Form-4 EPR certificate"],
    accent: "leaf",
  },
  {
    id: "regulator",
    title: "Ministry / Regulator",
    titleHi: "मंत्रालय / नियामक",
    org: "JNARDDC / CPCB Oversight",
    location: "Ministry of Mines, Govt. of India",
    reg: "National Admin Access",
    path: "/admin/dashboard",
    icon: Scale,
    badge: "Analytics + Audit",
    features: ["Geospatial heatmap", "Leakage detection alerts", "Immutable audit chain"],
    accent: "ink",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { resetAllData, refreshData } = useApp();
  const [entering, setEntering] = useState<string | null>(null);

  const handleEnter = (role: (typeof ROLES)[number]) => {
    setEntering(role.id);
    if (typeof window !== "undefined") {
      localStorage.setItem("kc_current_role", role.id);
    }
    setTimeout(() => router.push(role.path), 120);
  };

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-ink-100 bg-white px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-leaf-600 flex items-center justify-center">
            <span className="text-white font-extrabold text-[10px]">KC</span>
          </div>
          <div>
            <span className="font-bold text-xs text-ink-900">Kabadiwala Connect</span>
            <span className="hidden sm:inline text-[10px] text-ink-400 ml-2 font-mono">SIH26229</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-600 bg-white border border-ink-100 rounded-lg hover:bg-ink-50 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm("Reset all demo data to defaults?")) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-600 bg-white border border-ink-100 rounded-lg hover:bg-ink-50 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-7">
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-leaf-50 border border-leaf-100 rounded-full text-[11px] font-semibold text-leaf-700">
              <span className="w-1.5 h-1.5 rounded-full bg-leaf-600 animate-pulse" />
              Urban Mining DPI · Ministry of Mines, Govt. of India
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-ink-900 tracking-tight mt-3">
              Select your role to continue
            </h1>
            <p className="text-xs text-ink-500 max-w-sm mx-auto leading-relaxed">
              One platform, four roles. Each view shows only what matters to you.
              Data syncs across all roles in real time.
            </p>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isLoading = entering === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleEnter(role)}
                  disabled={entering !== null}
                  className={`text-left p-5 bg-white border border-ink-100 rounded-2xl transition-all group disabled:opacity-60 ${
                    isLoading
                      ? "border-leaf-600 shadow-md"
                      : "hover:border-leaf-600 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`p-2 rounded-xl transition-colors ${
                      isLoading
                        ? "bg-leaf-50 text-leaf-700"
                        : "bg-ink-50 text-ink-600 group-hover:bg-leaf-50 group-hover:text-leaf-700"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold text-ink-400 bg-ink-50 px-1.5 py-0.5 rounded-md border border-ink-100">
                        {role.badge}
                      </span>
                      {isLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-leaf-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-ink-300 group-hover:text-leaf-600 transition-colors" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className={`font-bold text-sm transition-colors ${
                      isLoading ? "text-leaf-700" : "text-ink-900 group-hover:text-leaf-700"
                    }`}>
                      {role.title}
                    </h3>
                    <p className="text-[11px] text-ink-500">{role.org}</p>
                    <p className="text-[10px] font-mono text-ink-400">{role.reg}</p>
                  </div>

                  <ul className="mt-3 space-y-1">
                    {role.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-[11px] text-ink-500">
                        <span className="w-1 h-1 rounded-full bg-ink-300 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Info strip */}
          <div className="border border-ink-100 rounded-xl bg-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-[11px] text-ink-500">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-leaf-500 animate-pulse" />
                <span>Real-time sync active across tabs</span>
              </div>
              <span className="hidden sm:block text-ink-200">|</span>
              <span className="hidden sm:block">BroadcastChannel · localStorage persistence</span>
            </div>
            <span className="text-[10px] font-mono text-ink-400 bg-ink-50 px-2 py-0.5 rounded-md border border-ink-100">
              LOT-NGP-84741 · Demo Seed Data
            </span>
          </div>
        </div>
      </main>

      {/* Bottom caption */}
      <footer className="text-center py-4 px-4">
        <p className="text-[10px] text-ink-300">
          Kabadiwala Connect · SIH 2026 · Ministry of Mines · JNARDDC · Demo Environment
        </p>
      </footer>
    </div>
  );
}