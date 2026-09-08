"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Smartphone,
  Store,
  Factory,
  Scale,
  ChevronDown,
  RotateCcw,
  RefreshCw,
  Wifi,
  WifiOff,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import Logo from "./Logo";
import { useApp } from "@/context/AppContext";

export const ROLES = [
  {
    id: "collector",
    name: "Ramesh Kumar",
    roleTitle: "Kabadiwala (Collector)",
    org: "Kalmna - Wadi Belt, Nagpur",
    reg: "Door-to-Door Informal Mining",
    path: "/collector",
    icon: Smartphone,
    color: "amber",
    badge: "Voice & Camera PWA",
  },
  {
    id: "aggregator",
    name: "Wadi Scrap Aggregators",
    roleTitle: "Aggregator (Shop)",
    org: "Plot 14, Wadi Industrial, Nagpur",
    reg: "CPCB: MH/EPR/A/2024/00522",
    path: "/aggregator",
    icon: Store,
    color: "blue",
    badge: "Inbound & Lots",
  },
  {
    id: "recycler",
    name: "Vidarbha Metal Recovery Pvt Ltd",
    roleTitle: "Recycler (Smelter)",
    org: "MIDC Butibori, Nagpur",
    reg: "CPCB: MH/EPR/R/2024/00318",
    path: "/smelter",
    icon: Factory,
    color: "emerald",
    badge: "Weighbridge & EPR",
  },
  {
    id: "regulator",
    name: "JNARDDC / CPCB Oversight",
    roleTitle: "Regulator (Ministry)",
    org: "Ministry of Mines, GoI",
    reg: "Statutory Monitoring & Leakage Audit",
    path: "/admin/dashboard",
    icon: Scale,
    color: "purple",
    badge: "PostGIS & Audit",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    language,
    setLanguage,
    isOnline,
    setIsOnline,
    resetAllData,
    refreshData,
  } = useApp();

  const activeRole = ROLES.find(
    (r) => pathname === r.path || (r.path === "/admin/dashboard" && pathname?.startsWith("/admin"))
  );

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-ink-100 sticky top-0 z-40 px-3 sm:px-6 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link href="/" className="hover:opacity-95 transition-opacity shrink-0">
            <Logo size="md" showSubtitle={true} />
          </Link>

          {/* Role Navigation Pills (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-ink-50 border border-ink-100 rounded-2xl">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                pathname === "/"
                  ? "bg-ink-900 text-white shadow-xs"
                  : "text-ink-600 hover:text-ink-900 hover:bg-white"
              }`}
            >
              Overview
            </Link>
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive =
                pathname === role.path ||
                (role.path === "/admin/dashboard" && pathname?.startsWith("/admin"));
              return (
                <Link
                  key={role.id}
                  href={role.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-ink-900 text-white shadow-xs"
                      : "text-ink-600 hover:text-ink-900 hover:bg-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{role.roleTitle.split(" ")[0]}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Controls: Role Switcher, Language, Reset, Refresh, Network */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="hidden sm:inline-block bg-ink-50 border border-ink-100 text-xs font-bold text-ink-700 rounded-xl px-2 py-1.5 focus:outline-none hover:bg-white transition cursor-pointer"
              title="Select Platform Language"
            >
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="en">English</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              className="p-2 bg-ink-50 hover:bg-ink-100 text-ink-600 hover:text-ink-900 border border-ink-100 rounded-xl transition"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-leaf-600" : ""}`} />
            </button>

            {/* Reset Data Button */}
            <button
              onClick={() => {
                if (confirm("क्या आप सारा डेटा रीसेट करके मूल टेस्ट डेटा (Nagpur Benchmarks) लोड करना चाहते हैं?")) {
                  resetAllData();
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-ink-50 hover:bg-clay-100 text-ink-600 hover:text-clay-700 border border-ink-100 rounded-xl text-xs font-semibold transition"
              title="Reset All Data to Official Nagpur Baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>

            {/* Online/Offline Mode Toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`p-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 transition ${
                isOnline
                  ? "bg-leaf-50 text-leaf-700 border-leaf-100 hover:bg-leaf-100"
                  : "bg-clay-100 text-clay-700 border-clay-100 hover:bg-clay-100/80"
              }`}
              title={isOnline ? "Mode: Online (Auto Sync)" : "Mode: Offline (IndexedDB Queued)"}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isOnline ? "Online" : "Offline"}</span>
            </button>

            {/* Role Switcher Modal Button */}
            <button
              onClick={() => setRoleModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition active:scale-[.98] text-xs px-3 py-1.5 bg-leaf-600 text-white shadow-sm hover:bg-leaf-700 shrink-0 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeRole ? activeRole.roleTitle.split(" ")[0] : "Switch Role"}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-ink-600 hover:text-ink-900 bg-ink-50 border border-ink-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-ink-100 flex flex-col gap-1.5 animate-fade-in">
            <div className="flex items-center justify-between px-2 pb-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-ink-50 border border-ink-100 text-xs font-bold text-ink-700 rounded-xl px-2 py-1.5"
              >
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="en">English</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>

              <button
                onClick={() => {
                  resetAllData();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-clay-700 bg-clay-100 rounded-xl font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-ink-900 hover:bg-ink-50 rounded-xl"
            >
              Overview
            </Link>

            <div className="pt-2 border-t border-ink-100 font-medium text-[11px] text-ink-400 px-3 uppercase tracking-wider">
              Choose Actor Console
            </div>
            {ROLES.map((role) => (
              <Link
                key={role.id}
                href={role.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50 rounded-xl"
              >
                <span>{role.roleTitle}</span>
                <span className="text-[10px] text-ink-500">{role.name}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Role Selection Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-ink-100 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-ink-100">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-leaf-700 font-bold bg-leaf-50 px-2.5 py-0.5 rounded-full ring-1 ring-leaf-100">
                  ONE RECORD &bull; FOUR ACTORS
                </span>
                <h3 className="text-xl font-black text-ink-900 mt-1.5">Select a Role to Experience</h3>
                <p className="text-xs text-ink-600 mt-1">
                  Choose your role. The scrap lot created by the Collector travels to the Aggregator, Smelter, and Regulator in real-time.
                </p>
              </div>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="p-1.5 text-ink-500 hover:text-ink-900 bg-ink-50 hover:bg-ink-100 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = activeRole?.id === role.id;
                return (
                  <Link
                    key={role.id}
                    href={role.path}
                    onClick={() => setRoleModalOpen(false)}
                    className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                      isSelected
                        ? "bg-leaf-50/70 border-leaf-600 ring-1 ring-leaf-600 shadow-xs"
                        : "bg-white border-ink-100 hover:border-leaf-600 hover:bg-ink-50/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-ink-50 text-leaf-700 group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-ink-50 text-ink-600">
                          {role.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-ink-900">{role.roleTitle}</h4>
                      <p className="text-xs text-ink-700 font-medium mt-0.5">{role.name}</p>
                      <p className="text-[11px] text-ink-500 mt-1">{role.org}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-ink-100 flex items-center justify-between text-[10px] text-ink-500 font-mono">
                      <span>{role.reg}</span>
                      <span className="text-leaf-600 group-hover:translate-x-0.5 transition-transform font-bold">&rarr;</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
