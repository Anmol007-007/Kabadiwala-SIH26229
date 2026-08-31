"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Factory, Boxes, ShieldCheck, Smartphone } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();

    const navLinks = [
        {
            href: process.env.NEXT_PUBLIC_COLLECTOR_PWA_URL || "https://kabadiwala-sih-26229-pwa.vercel.app/",
            label: "Collector PWA",
            icon: Smartphone,
            step: "Step 6",
            external: true,
        },
        { href: "/", label: "Aggregator Portal", icon: Boxes, step: "Step 3" },
        { href: "/smelter", label: "Smelter & EPR", icon: Factory, step: "Step 4" },
        { href: "/admin/dashboard", label: "Ministry Analytics", icon: LayoutDashboard, step: "Step 5" },
    ];

    return (
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-sm">
                        KC
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white tracking-tight">Kabadiwala Connect</span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                                SIH26229
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Urban Mining DPI for Secondary Metals & Critical Minerals</p>
                    </div>
                </div>

                <nav className="flex items-center gap-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || (link.href === "/admin/dashboard" && pathname?.startsWith("/admin"));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{link.label}</span>
                                <span className={`text-[10px] px-1 rounded ${isActive ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                                    {link.step}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
