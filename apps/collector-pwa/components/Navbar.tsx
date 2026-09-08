"use client";

import React from "react";
import {
  LayoutDashboard,
  Factory,
  Boxes,
  Smartphone,
} from "lucide-react";

export default function PwaNavbar() {
  const portalBase =
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://kabadiwala-connect.vercel.app");

  const navLinks = [
    { href: "/", label: "Collector PWA", icon: Smartphone, isActive: true },
    { href: `${portalBase}/`, label: "Aggregator Portal", icon: Boxes, isActive: false },
    { href: `${portalBase}/smelter`, label: "Smelter & EPR", icon: Factory, isActive: false },
    { href: `${portalBase}/admin/dashboard`, label: "Ministry Analytics", icon: LayoutDashboard, isActive: false },
  ];

  return (
    <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-md mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xs shadow">
              क
            </div>
            <div>
              <span className="font-extrabold text-white text-xs tracking-tight">KABADIWALA CONNECT</span>
              <p className="text-[9px] text-slate-400">Urban Mining DPI &bull; Ministry of Mines</p>
            </div>
          </div>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
            DPI LIVE
          </span>
        </div>

        <nav className="flex items-center justify-between gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  link.isActive
                    ? "bg-amber-500 text-neutral-950 shadow font-bold"
                    : "text-neutral-300 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
