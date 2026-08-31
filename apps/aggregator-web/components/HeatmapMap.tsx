"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface HeatmapProps {
    geojsonData: any;
    selectedMaterial: string;
}

export default function HeatmapMap({ geojsonData, selectedMaterial }: HeatmapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [78.9629, 20.5937], // Center coordinates of India
            zoom: 4.2,
        });

        mapRef.current = map;

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

            // Heatmap Layer
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
                        100, 1
                    ],
                    "heatmap-intensity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        0, 1,
                        9, 3
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
                        1, "rgb(178,24,43)"
                    ],
                    "heatmap-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        0, 4,
                        9, 20
                    ],
                    "heatmap-opacity": 0.85,
                },
            });
        });

        return () => map.remove();
    }, []);

    // Dynamically update map points when material filter changes
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

    return <div ref={mapContainer} className="w-full h-full min-h-[480px] rounded-xl overflow-hidden shadow-2xl" />;
}