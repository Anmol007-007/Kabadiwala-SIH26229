"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface HeatmapProps {
  geojsonData: any;
  selectedMaterial: string;
}

const URBAN_MINING_HUBS = [
  { name: "Delhi NCR (Mayapuri/Okhla)", x: 44, y: 28, material: "Copper", weight: 850, formalWorkers: 1240 },
  { name: "Moradabad Brass Corridor", x: 48, y: 29, material: "Brass", weight: 920, formalWorkers: 1800 },
  { name: "Mumbai (Dharavi/Kurla)", x: 28, y: 64, material: "Aluminium", weight: 640, formalWorkers: 950 },
  { name: "Bengaluru (Electronic City)", x: 42, y: 82, material: "E-waste", weight: 510, formalWorkers: 720 },
  { name: "Kolkata (Taratala Hub)", x: 74, y: 48, material: "Lithium", weight: 380, formalWorkers: 540 },
  { name: "Chennai Auto Cluster", x: 48, y: 86, material: "Copper", weight: 490, formalWorkers: 610 },
  { name: "Ahmedabad Industrial", x: 26, y: 46, material: "Aluminium", weight: 530, formalWorkers: 680 },
];

export default function HeatmapMap({ geojsonData, selectedMaterial }: HeatmapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [activeHub, setActiveHub] = useState<any>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  useEffect(() => {
    if (!token) {
      setUseFallback(true);
      return;
    }

    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [78.9629, 20.5937],
        zoom: 4.2,
      });

      mapRef.current = map;

      map.on("error", () => {
        setUseFallback(true);
      });

      map.on("load", () => {
        const rawFeatures = geojsonData?.features || [];
        const filteredFeatures =
          selectedMaterial === "ALL"
            ? rawFeatures
            : rawFeatures.filter(
                (f: any) => f.properties?.material_type === selectedMaterial
              );

        map.addSource("scrap-points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: filteredFeatures || [],
          },
        });

        map.addLayer({
          id: "scrap-heat",
          type: "heatmap",
          source: "scrap-points",
          maxzoom: 15,
          paint: {
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["get", "weight_kg"],
              0, 0,
              100, 1,
            ],
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0, 1,
              9, 3,
            ],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0, "rgba(33,102,172,0)",
              0.2, "rgb(103,169,207)",
              0.4, "rgb(209,229,240)",
              0.6, "rgb(253,219,199)",
              0.8, "rgb(239,138,98)",
              1, "rgb(178,24,43)",
            ],
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0, 4,
              9, 20,
            ],
            "heatmap-opacity": 0.85,
          },
        });
      });

      return () => map.remove();
    } catch {
      setUseFallback(true);
    }
  }, [token]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.getSource("scrap-points")) return;

    const filteredFeatures =
      selectedMaterial === "ALL"
        ? geojsonData?.features || []
        : (geojsonData?.features || []).filter(
            (f: any) => f.properties?.material_type === selectedMaterial
          );

    (mapRef.current.getSource("scrap-points") as mapboxgl.GeoJSONSource).setData({
      type: "FeatureCollection",
      features: filteredFeatures || [],
    });
  }, [selectedMaterial, geojsonData]);

  const filteredHubs =
    selectedMaterial === "ALL"
      ? URBAN_MINING_HUBS
      : URBAN_MINING_HUBS.filter((h) => h.material === selectedMaterial);

  if (useFallback) {
    return (
      <div className="w-full h-full min-h-[480px] rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-6 select-none shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.06),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-slate-200">
            PostGIS Geospatial Engine &bull; India Grid
          </span>
          <span className="text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-mono">
            {filteredHubs.length} Active Clusters
          </span>
        </div>

        <div className="relative w-full max-w-lg aspect-[4/3] flex items-center justify-center">
          <div className="absolute w-[85%] aspect-square rounded-full border border-slate-800/80 pointer-events-none" />
          <div className="absolute w-[60%] aspect-square rounded-full border border-slate-800/60 pointer-events-none" />
          <div className="absolute w-[35%] aspect-square rounded-full border border-amber-500/20 pointer-events-none" />

          {filteredHubs.map((hub, idx) => (
            <div
              key={idx}
              style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
              onClick={() => setActiveHub(hub)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 group-hover:bg-amber-500/40 animate-ping absolute inset-0 -m-1 pointer-events-none" />
              <div className="relative w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-slate-950 shadow-lg shadow-amber-500/50 flex items-center justify-center group-hover:scale-125 transition-transform">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              <div className="absolute left-5 top-0 whitespace-nowrap bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded-text-[10px] font-semibold text-slate-200 shadow-md pointer-events-none group-hover:border-amber-500/50">
                {hub.name.split(" ")[0]} ({hub.weight}kg)
              </div>
            </div>
          ))}
        </div>

        {activeHub && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-30 bg-slate-900/95 border border-amber-500/40 p-4 rounded-xl shadow-2xl backdrop-blur-md max-w-sm">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <h4 className="font-bold text-xs text-white">{activeHub.name}</h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">
                {activeHub.material}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2 text-[11px]">
              <div>
                <span className="text-slate-400">Total Recovered:</span>
                <p className="font-black text-amber-400 text-sm">{activeHub.weight} kg</p>
              </div>
              <div>
                <span className="text-slate-400">Formalized Kabadiwalas:</span>
                <p className="font-black text-emerald-400 text-sm">{activeHub.formalWorkers}</p>
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-4 text-[11px] text-slate-400 font-mono bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> High Inward Density
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Verified Aggregators
          </span>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full min-h-[480px] rounded-xl overflow-hidden shadow-2xl" />;
}