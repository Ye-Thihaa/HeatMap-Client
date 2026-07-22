import Map, { Marker, type MapRef } from "react-map-gl/maplibre";
import { useMemo, useRef, useEffect, useState } from "react";
import type { CoolingCenter, HeatZoneSummary } from "@/lib/types";
import { RISK_COLORS } from "@/lib/api-client";
import { motion } from "framer-motion";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface Props {
  zones: HeatZoneSummary[];
  centers?: CoolingCenter[];
  selectedZoneId?: string | null;
  onSelectZone?: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  routeTo?: { lat: number; lng: number } | null;
}

export function HeatMap({
  zones,
  centers = [],
  selectedZoneId,
  onSelectZone,
  userLocation,
  onMapClick,
  routeTo,
}: Props) {
  const ref = useRef<MapRef>(null);
  const validZones = useMemo(
    () => zones.filter((z) => Number.isFinite(z.centroid_lat) && Number.isFinite(z.centroid_lng)),
    [zones],
  );
  const validCenters = useMemo(
    () => centers.filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng)),
    [centers],
  );
  const validUser =
    userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)
      ? userLocation
      : null;
  const validRouteTo =
    routeTo && Number.isFinite(routeTo.lat) && Number.isFinite(routeTo.lng) ? routeTo : null;

  const center = useMemo(() => {
    if (validZones.length === 0) return { lat: 40.7128, lng: -74.006 };
    const lat = validZones.reduce((s, z) => s + z.centroid_lat, 0) / validZones.length;
    const lng = validZones.reduce((s, z) => s + z.centroid_lng, 0) / validZones.length;
    return { lat, lng };
  }, [validZones]);

  useEffect(() => {
    if (!selectedZoneId || !ref.current) return;
    const z = validZones.find((x) => x.id === selectedZoneId);
    if (z) ref.current.flyTo({ center: [z.centroid_lng, z.centroid_lat], zoom: 14, duration: 900 });
  }, [selectedZoneId, validZones]);

  const [mapReady, setMapReady] = useState(false);
  const routeSvg = useMemo(() => {
    if (!validUser || !validRouteTo || !ref.current || !mapReady) return null;
    try {
      const from = ref.current.project([validUser.lng, validUser.lat]);
      const to = ref.current.project([validRouteTo.lng, validRouteTo.lat]);
      if (![from.x, from.y, to.x, to.y].every(Number.isFinite)) return null;
      return { from, to };
    } catch {
      return null;
    }
  }, [validUser, validRouteTo, mapReady]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border/60">
      <Map
        ref={ref}
        mapStyle={MAP_STYLE}
        initialViewState={{ latitude: center.lat, longitude: center.lng, zoom: 12.5 }}
        onLoad={() => setMapReady(true)}
        onClick={(e) => onMapClick?.(e.lngLat.lat, e.lngLat.lng)}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {validZones.map((z) => {
          const isDanger = z.risk_level === "high" || z.risk_level === "severe";
          const isSelected = selectedZoneId === z.id;
          return (
            <Marker
              key={z.id}
              latitude={z.centroid_lat}
              longitude={z.centroid_lng}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onSelectZone?.(z.id);
              }}
            >
              <button
                className={`group relative grid h-10 w-10 place-items-center rounded-full text-[10px] font-semibold text-black transition-transform ${
                  isSelected ? "scale-125" : "hover:scale-110"
                } ${isDanger ? "pulse-heat" : ""}`}
                style={{ backgroundColor: RISK_COLORS[z.risk_level] }}
                title={`${z.name} · ${z.current_temp_c}°C`}
              >
                {Math.round(z.current_temp_c)}°
                {isDanger && (
                  <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                    <span
                      className="absolute inset-y-0 -inset-x-full block bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      style={{ animation: "shimmer 2.5s linear infinite" }}
                    />
                  </span>
                )}
              </button>
            </Marker>
          );
        })}
        {validCenters.map((c) => (
          <Marker key={c.id} latitude={c.lat} longitude={c.lng} anchor="bottom">
            <div className="flex flex-col items-center">
              <div
                className="grid h-8 w-8 place-items-center rounded-full bg-cool text-black shadow-lg pulse-cool"
                title={c.name}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
                </svg>
              </div>
            </div>
          </Marker>
        ))}
        {validUser && (
          <Marker latitude={validUser.lat} longitude={validUser.lng} anchor="center">
            <div className="h-4 w-4 rounded-full border-2 border-white bg-accent shadow-lg" />
          </Marker>
        )}
      </Map>

      {routeSvg && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <motion.line
            x1={routeSvg.from.x}
            y1={routeSvg.from.y}
            x2={routeSvg.to.x}
            y2={routeSvg.to.y}
            stroke="var(--color-cool)"
            strokeWidth="3"
            strokeDasharray="8 8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2 }}
          />
        </svg>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 flex gap-2 text-xs">
        {(["low", "moderate", "high", "severe"] as const).map((r) => (
          <div key={r} className="flex items-center gap-1.5 rounded-full glass px-2.5 py-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[r] }} />
            <span className="capitalize text-muted-foreground">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}