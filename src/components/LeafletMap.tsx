import { useEffect, useRef } from "react";
import L from "leaflet";
import { Maximize, ZoomIn, ZoomOut, Compass } from "lucide-react";

export interface Facility {
  id: string;
  name: string;
  type: "hospital" | "shelter" | "police" | "fire_station";
  lat: number;
  lng: number;
  distance: number;
  address?: string;
  phone?: string;
}

interface LeafletMapProps {
  dashLat: string;
  dashLng: string;
  userLat: string | null;
  userLng: string | null;
  facilities?: Facility[];
  selectedFacilityId?: string | null;
  onMapClick: (lat: string, lng: string) => void;
}

export default function LeafletMap({
  dashLat,
  dashLng,
  userLat,
  userLng,
  facilities = [],
  selectedFacilityId = null,
  onMapClick,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const disasterMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const facilityMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map instance
    const initialLat = parseFloat(dashLat) || 34.0522;
    const initialLng = parseFloat(dashLng) || -118.2437;
    
    const map = L.map(mapContainerRef.current, {
      zoomControl: false, // Use our own custom styled zoom buttons for cohesive theme
      attributionControl: true,
    }).setView([initialLat, initialLng], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Handle clicks
    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat.toFixed(4), e.latlng.lng.toFixed(4));
    });

    // Add CSS fix to ensure map tiles display correctly under tailwind
    const container = mapContainerRef.current;
    if (container) {
      container.style.zIndex = "1";
    }

    return () => {
      map.remove();
      mapRef.current = null;
      disasterMarkerRef.current = null;
      userMarkerRef.current = null;
      facilityMarkersRef.current.forEach((marker) => {
        try {
          map.removeLayer(marker);
        } catch (e) {}
      });
      facilityMarkersRef.current.clear();
    };
  }, []);

  // Sync / Update Disaster Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const latNum = parseFloat(dashLat);
    const lngNum = parseFloat(dashLng);

    if (isNaN(latNum) || isNaN(lngNum)) return;

    const disasterIcon = L.divIcon({
      html: `<div class="relative flex items-center justify-center w-10 h-10">
               <span class="absolute inline-flex w-full h-full rounded-full bg-red-500 opacity-30 animate-ping"></span>
               <span class="relative inline-flex items-center justify-center rounded-full h-7 w-7 bg-red-600 border border-white text-white font-extrabold text-sm shadow-xl">⚠️</span>
             </div>`,
      className: "custom-leaflet-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (disasterMarkerRef.current) {
      disasterMarkerRef.current.setLatLng([latNum, lngNum]);
      disasterMarkerRef.current.getPopup()?.setContent(`
        <div style="font-family: monospace; font-size: 11px; color: #0f172a;">
          <strong style="color: #dc2626;">ALERT INCIDENT AXIS</strong><br/>
          Lat: ${latNum.toFixed(4)}<br/>
          Lng: ${lngNum.toFixed(4)}<br/>
          <span style="font-size: 9px; color: #64748b;">(Click anywhere on map to reposition)</span>
        </div>
      `);
    } else {
      disasterMarkerRef.current = L.marker([latNum, lngNum], { icon: disasterIcon })
        .addTo(map)
        .bindPopup(
          `
          <div style="font-family: monospace; font-size: 11px; color: #0f172a;">
            <strong style="color: #dc2626;">ALERT INCIDENT AXIS</strong><br/>
            Lat: ${latNum.toFixed(4)}<br/>
            Lng: ${lngNum.toFixed(4)}<br/>
            <span style="font-size: 9px; color: #64748b;">(Click anywhere on map to reposition)</span>
          </div>
          `
        );
    }

    // Pan map to new incident center
    map.panTo([latNum, lngNum]);
  }, [dashLat, dashLng]);

  // Sync / Update User Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLat || !userLng) return;

    const uLat = parseFloat(userLat);
    const uLng = parseFloat(userLng);

    if (isNaN(uLat) || isNaN(uLng)) return;

    const userIcon = L.divIcon({
      html: `<div class="relative flex items-center justify-center w-8 h-8">
               <span class="absolute inline-flex w-full h-full rounded-full bg-emerald-500 opacity-60 animate-ping"></span>
               <span class="relative inline-flex rounded-full h-4.5 w-4.5 bg-emerald-600 border-2 border-white shadow-md"></span>
             </div>`,
      className: "custom-leaflet-marker-user",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([uLat, uLng]);
      userMarkerRef.current.getPopup()?.setContent(`
        <div style="font-family: monospace; font-size: 11px; color: #0f172a;">
          <strong style="color: #059669;">YOUR STATION POSITION</strong><br/>
          Lat: ${uLat.toFixed(4)}<br/>
          Lng: ${uLng.toFixed(4)}
        </div>
      `);
    } else {
      userMarkerRef.current = L.marker([uLat, uLng], { icon: userIcon })
        .addTo(map)
        .bindPopup(
          `
          <div style="font-family: monospace; font-size: 11px; color: #0f172a;">
            <strong style="color: #059669;">YOUR STATION POSITION</strong><br/>
            Lat: ${uLat.toFixed(4)}<br/>
            Lng: ${uLng.toFixed(4)}
          </div>
          `
        );
    }
  }, [userLat, userLng]);

  // Sync / Update Nearby Facilities Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing facility markers
    facilityMarkersRef.current.forEach((marker) => {
      try {
        map.removeLayer(marker);
      } catch (e) {}
    });
    facilityMarkersRef.current.clear();

    // Map facility types to icons and colors
    const typeConfigs: Record<string, { emoji: string; color: string; label: string }> = {
      hospital: { emoji: "🏥", color: "#e11d48", label: "HOSPITAL" },
      shelter: { emoji: "⛺", color: "#10b981", label: "SHELTER" },
      police: { emoji: "👮", color: "#2563eb", label: "POLICE" },
      fire_station: { emoji: "🔥", color: "#f59e0b", label: "FIRE STATION" },
    };

    // Add new facility markers
    facilities.forEach((fac) => {
      const config = typeConfigs[fac.type] || { emoji: "📍", color: "#64748b", label: fac.type.toUpperCase() };
      
      const facIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center w-8 h-8 rounded-full border border-white text-white shadow-lg font-bold text-sm" style="background-color: ${config.color}">
                 ${config.emoji}
               </div>`,
        className: "custom-leaflet-marker-facility",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const distStr = fac.distance >= 1000 
        ? `${(fac.distance / 1000).toFixed(2)} km` 
        : `${Math.round(fac.distance)} m`;

      const popupHtml = `
        <div style="font-family: monospace; font-size: 11px; color: #0f172a; max-width: 200px;">
          <strong style="color: ${config.color};">${config.label}: ${fac.name}</strong><br/>
          <strong>Distance:</strong> ${distStr}<br/>
          ${fac.address ? `<strong>Address:</strong> ${fac.address}<br/>` : ""}
          ${fac.phone ? `<strong>Phone:</strong> ${fac.phone}<br/>` : ""}
          <strong>Lat/Lng:</strong> ${fac.lat.toFixed(4)}, ${fac.lng.toFixed(4)}
        </div>
      `;

      const marker = L.marker([fac.lat, fac.lng], { icon: facIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      facilityMarkersRef.current.set(fac.id, marker);
    });
  }, [facilities]);

  // Handle selected facility focus
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedFacilityId) return;

    const marker = facilityMarkersRef.current.get(selectedFacilityId);
    if (marker) {
      const latlng = marker.getLatLng();
      map.setView(latlng, 15);
      marker.openPopup();
    }
  }, [selectedFacilityId]);

  // Helper custom zoom handlers
  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleFitBounds = () => {
    const map = mapRef.current;
    if (!map) return;

    const latNum = parseFloat(dashLat);
    const lngNum = parseFloat(dashLng);

    if (userLat && userLng) {
      const uLat = parseFloat(userLat);
      const uLng = parseFloat(userLng);
      const bounds = L.latLngBounds([[latNum, lngNum], [uLat, uLng]]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([latNum, lngNum], 14);
    }
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-900 group">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px] md:min-h-[380px] bg-slate-950" />

      {/* Custom styled control overlay */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        {/* Zoom In Button */}
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shadow-lg hover:border-red-500/50 transition cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {/* Zoom Out Button */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shadow-lg hover:border-red-500/50 transition cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        {/* Fit Bounds / Show All Button */}
        <button
          type="button"
          onClick={handleFitBounds}
          className="w-8 h-8 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shadow-lg hover:border-red-500/50 transition cursor-pointer"
          title="Recenter Map"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* Floating Status Marker Label */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-900 text-[10px] font-mono text-slate-400 pointer-events-none flex items-center gap-1.5 shadow-lg">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span>Incident Zone: {parseFloat(dashLat).toFixed(4)}, {parseFloat(dashLng).toFixed(4)}</span>
      </div>

      {userLat && userLng && (
        <div className="absolute top-12 left-4 z-[1000] bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-900 text-[10px] font-mono text-slate-400 pointer-events-none flex items-center gap-1.5 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Device Sync: {parseFloat(userLat).toFixed(4)}, {parseFloat(userLng).toFixed(4)}</span>
        </div>
      )}
    </div>
  );
}
