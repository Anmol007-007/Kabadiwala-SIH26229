"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Pickaxe, Users, Leaf, Filter } from "lucide-react";

const HeatmapMap = dynamic(() => import("@/components/HeatmapMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[480px] rounded-xl bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-xs">Initializing Mapbox WebGL Engine...</p>
        </div>
    )
});

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kabadiwala-backend-4vkq.onrender.com';

export default function AdminDashboard() {
    const [data, setData] = useState<{ kpis: any; spatial_data: any } | null>(null);
    const [selectedMaterial, setSelectedMaterial] = useState<string>("ALL");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE_URL}/api/admin/analytics`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || `HTTP ${res.status}: Server Error`);
            }
            const json = await res.json();
            if (!json.kpis) {
                throw new Error("Invalid analytics payload received from server");
            }
            setData(json);
        } catch (err: any) {
            console.error("Failed to load analytics", err);
            setError(err.message || "Failed to load analytics from backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                <p className="text-sm text-slate-400">Loading Ministry of Mines Urban Mining DPI...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white gap-4 p-6 text-center">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl max-w-md">
                    <p className="text-red-400 font-semibold mb-1">Backend Connection Issue</p>
                    <p className="text-xs text-slate-400 mb-4">{error || "Unable to retrieve analytics data"}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 lg:p-10 font-sans">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        <span>Ministry of Mines</span>
                        <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Urban Mining DPI
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Real-time critical mineral recovery, informal workforce formalization, and EPR tracking.
                    </p>
                </div>

                {/* Filter Dropdown */}
                <div className="mt-4 md:mt-0 flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-lg">
                    <Filter className="w-4 h-4 text-slate-400 ml-1" />
                    <select
                        value={selectedMaterial}
                        onChange={(e) => setSelectedMaterial(e.target.value)}
                        className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none pr-2"
                    >
                        <option value="ALL" className="bg-slate-900">All Critical Minerals</option>
                        <option value="Copper" className="bg-slate-900">Copper</option>
                        <option value="Brass" className="bg-slate-900">Brass</option>
                        <option value="Aluminium" className="bg-slate-900">Aluminium</option>
                        <option value="E-waste" className="bg-slate-900">E-waste PCBs</option>
                        <option value="Lithium" className="bg-slate-900">Lithium-ion Batteries</option>
                    </select>
                </div>
            </header>

            {/* KPI Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Secondary Metals Recovered</p>
                            <h3 className="text-3xl font-bold text-white mt-2">
                                {data.kpis.metals_recovered_tonnes} <span className="text-lg text-slate-400 font-normal">MT</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Pickaxe className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Informal Workers</p>
                            <h3 className="text-3xl font-bold text-white mt-2">
                                {data.kpis.active_informal_workers.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Carbon Emissions Avoided</p>
                            <h3 className="text-3xl font-bold text-emerald-400 mt-2">
                                {data.kpis.carbon_saved_mt} <span className="text-lg text-slate-400 font-normal">MT CO₂e</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            <Leaf className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Geospatial Map Visualizer */}
            <section className="flex-1 min-h-[500px] flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                <div className="mb-3 px-2">
                    <h2 className="text-lg font-bold text-white">Critical Mineral Spatial Heatmap</h2>
                    <p className="text-xs text-slate-400">PostGIS aggregation of verified urban collection points</p>
                </div>
                <div className="flex-1 w-full relative min-h-[450px]">
                    <HeatmapMap geojsonData={data.spatial_data} selectedMaterial={selectedMaterial} />
                </div>
            </section>
        </div>
    );
}