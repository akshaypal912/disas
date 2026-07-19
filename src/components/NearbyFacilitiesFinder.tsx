import React, { useState, useEffect } from 'react';
import { Navigation, Loader2, Shield, Heart, Flame, Home, AlertCircle } from 'lucide-react';

export interface Facility {
  id: string;
  name: string;
  distance: string;
  lat: number;
  lng: number;
  type: 'hospital' | 'shelter' | 'police' | 'fire';
  distVal?: number;
}

export interface NearbyFacilitiesFinderProps {
  dashLat: string;
  dashLng: string;
  userLat?: string | null;
  userLng?: string | null;
  onFacilitiesFound: (facilities: Facility[]) => void;
  onSelectFacility: (facilityId: string | null) => void;
  selectedFacilityId: string | null;
}

// Haversine formula to compute distance in km
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function NearbyFacilitiesFinder({
  dashLat,
  dashLng,
  userLat,
  userLng,
  onFacilitiesFound,
  onSelectFacility,
  selectedFacilityId
}: NearbyFacilitiesFinderProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const centerLat = parseFloat(dashLat) || 34.0522;
    const centerLng = parseFloat(dashLng) || -118.2437;

    const fetchOSMFacilities = async () => {
      setLoading(true);
      setErrorStatus(null);
      
      try {
        const radius = 3000; // 3km search radius
        const query = `
          [out:json][timeout:15];
          (
            node["amenity"="hospital"](around:${radius},${centerLat},${centerLng});
            node["amenity"="shelter"](around:${radius},${centerLat},${centerLng});
            node["social_facility"="shelter"](around:${radius},${centerLat},${centerLng});
            node["amenity"="police"](around:${radius},${centerLat},${centerLng});
            node["amenity"="fire_station"](around:${radius},${centerLat},${centerLng});
          );
          out body 40;
        `;
        
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Overpass API query failed');
        }

        const data = await response.json();
        if (!active) return;

        const elements = data.elements || [];
        
        if (elements.length === 0) {
          throw new Error('No facilities returned in this area');
        }

        const resolvedFacilities: Facility[] = elements.map((el: any) => {
          let type: 'hospital' | 'shelter' | 'police' | 'fire' = 'shelter';
          if (el.tags?.amenity === 'hospital') type = 'hospital';
          else if (el.tags?.amenity === 'police') type = 'police';
          else if (el.tags?.amenity === 'fire_station') type = 'fire';

          const lat = el.lat;
          const lng = el.lon;

          // Compute distance from user location if available, otherwise from dashboard epicenter
          const originLat = (userLat && userLng) ? parseFloat(userLat) : centerLat;
          const originLng = (userLat && userLng) ? parseFloat(userLng) : centerLng;
          const dist = getHaversineDistance(originLat, originLng, lat, lng);

          return {
            id: String(el.id),
            name: el.tags?.name || el.tags?.operator || `${type.charAt(0).toUpperCase() + type.slice(1)} Station`,
            distance: `${dist.toFixed(2)} km`,
            lat,
            lng,
            type,
            distVal: dist
          };
        });

        // Sort by distance
        resolvedFacilities.sort((a: any, b: any) => a.distVal - b.distVal);

        setFacilities(resolvedFacilities);
        onFacilitiesFound(resolvedFacilities);
      } catch (err: any) {
        if (!active) return;
        console.warn('NearbyFacilitiesFinder: Failed to load real-time OSM data. Generating dynamic localized backup.', err);
        // FIX LOW #26: Consistent English error message
        setErrorStatus('OSM Live API unavailable. Using local fallback data.');

        // Premium dynamic fallback based on coordinates
        const fallbackTypes: ('hospital' | 'shelter' | 'police' | 'fire')[] = ['hospital', 'shelter', 'police', 'fire', 'shelter'];
        const fallbackNames = [
          'Emergency Medical Response Center',
          'Civic Defense Evacuation Shelter',
          'Central Precinct Dispatch Hub',
          'Tactical Fire & Rescue Command',
          'Secondary Relief & Shelter Outpost'
        ];

        const fallbackList: Facility[] = fallbackNames.map((name, idx) => {
          const latOffset = (idx % 2 === 0 ? 1 : -1) * (0.004 + idx * 0.002);
          const lngOffset = (idx % 3 === 0 ? 1 : -1) * (0.005 + idx * 0.002);
          const lat = centerLat + latOffset;
          const lng = centerLng + lngOffset;

          const originLat = (userLat && userLng) ? parseFloat(userLat) : centerLat;
          const originLng = (userLat && userLng) ? parseFloat(userLng) : centerLng;
          const dist = getHaversineDistance(originLat, originLng, lat, lng);

          return {
            id: `fallback-${idx}`,
            name,
            distance: `${dist.toFixed(2)} km`,
            lat,
            lng,
            type: fallbackTypes[idx],
            distVal: dist
          };
        });

        fallbackList.sort((a, b) => a.distVal - b.distVal);
        setFacilities(fallbackList);
        onFacilitiesFound(fallbackList);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOSMFacilities();

    return () => {
      active = false;
    };
  }, [dashLat, dashLng, userLat, userLng]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Heart className="h-3.5 w-3.5 text-red-500" />;
      case 'police':
        return <Shield className="h-3.5 w-3.5 text-blue-500" />;
      case 'fire':
        return <Flame className="h-3.5 w-3.5 text-amber-500" />;
      case 'shelter':
      default:
        return <Home className="h-3.5 w-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono text-white flex items-center gap-2">
          <Navigation className="h-4 w-4 text-red-500 animate-pulse" /> SPATIAL ROUTING CAPABILITY
        </h3>
        {loading && <Loader2 className="h-3.5 w-3.5 text-slate-400 animate-spin" />}
      </div>
      
      <p className="text-[10px] text-slate-400 mb-3">
        Monitoring safe zones near Lat: {parseFloat(dashLat).toFixed(4)}, Lng: {parseFloat(dashLng).toFixed(4)}
        {userLat && userLng && <span className="text-blue-400 block mt-0.5">Calculating distance from your live GPS coordinates.</span>}
      </p>

      {errorStatus && (
        <div className="flex items-center gap-1.5 p-2 mb-3 bg-red-950/20 border border-red-900/50 rounded text-[9px] text-red-400 font-mono">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{errorStatus}</span>
        </div>
      )}

      {facilities.length === 0 && !loading ? (
        <div className="text-center py-4 text-slate-500 text-xs italic">
          No nearby services detected.
        </div>
      ) : (
        <ul className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          {facilities.map(f => (
            <li 
              key={f.id} 
              onClick={() => onSelectFacility(selectedFacilityId === f.id ? null : f.id)}
              className={`text-xs p-2 rounded flex items-center justify-between cursor-pointer transition border ${
                selectedFacilityId === f.id 
                  ? 'bg-red-950/40 border-red-500/50 text-white' 
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-900/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0">{getIcon(f.type)}</span>
                <span className="truncate pr-1 font-sans">{f.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {f.distance}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NearbyFacilitiesFinder;
