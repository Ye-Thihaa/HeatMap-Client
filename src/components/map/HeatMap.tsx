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
  /** The user's actual GPS location — renders as a blue "you are here" dot.
   *  This should ONLY ever be set from navigator.geolocation, never from a
   *  map click, so it stays fixed once known. */
  userLocation?: { lat: number; lng: number } | null;
  /** A manually-dropped pin (e.g. from clicking the map) used as an
   *  alternate search origin. Renders as a distinct pin marker, separate
   *  from the GPS dot, so clicking the map never moves the blue dot. */
  pinLocation?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  routeTo?: { lat: number; lng: number } | null;
}

export function HeatMap({
  zones,
  centers = [],
  selectedZoneId,
  onSelectZone,
  userLocation,
  pinLocation,
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
  const validPin =
    pinLocation && Number.isFinite(pinLocation.lat) && Number.isFinite(pinLocation.lng)
      ? pinLocation
      : null;
  const validRouteTo =
    routeTo && Number.isFinite(routeTo.lat) && Number.isFinite(routeTo.lng) ? routeTo : null;

  const center = useMemo(() => {
    if (validZones.length === 0) return { lat: 40.7128, lng: -74.006 };
    const lat = validZones.reduce((s, z) => s + z.centroid_lat, 0) / validZones.length;
    const lng = validZones.reduce((s, z) => s + z.centroid_lng, 0) / validZones.length;
    return { lat, lng };
  }, [validZones]);

  // Fly to the user's GPS location once known. Deliberately does NOT depend
  // on pinLocation — dropping a manual pin should never move the camera or
  // the blue dot, only the pin marker itself.
  useEffect(() => {
    if (!validUser || !ref.current) return;
    ref.current.flyTo({ center: [validUser.lng, validUser.lat], zoom: 13, duration: 900 });
  }, [validUser?.lat, validUser?.lng]);

  useEffect(() => {
    if (!selectedZoneId || !ref.current) return;
    const z = validZones.find((x) => x.id === selectedZoneId);
    if (z) ref.current.flyTo({ center: [z.centroid_lng, z.centroid_lat], zoom: 14, duration: 900 });
  }, [selectedZoneId, validZones]);

  const [mapReady, setMapReady] = useState(false);
  // Route line now draws from whichever origin is actually active for
  // search — the pin if one's been dropped, otherwise the GPS location.
  const routeOrigin = validPin ?? validUser;
  const routeSvg = useMemo(() => {
    if (!routeOrigin || !validRouteTo || !ref.current || !mapReady) return null;
    try {
      const from = ref.current.project([routeOrigin.lng, routeOrigin.lat]);
      const to = ref.current.project([validRouteTo.lng, validRouteTo.lat]);
      if (![from.x, from.y, to.x, to.y].every(Number.isFinite)) return null;
      return { from, to };
    } catch {
      return null;
    }
  }, [routeOrigin, validRouteTo, mapReady]);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
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
          const color = RISK_COLORS[z.risk_level];
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
                type="button"
                aria-label={`${z.name}, ${z.risk_level} risk, ${z.current_temp_c}°C`}
                title={`${z.name} · ${z.current_temp_c}°C`}
                className={`group relative grid place-items-center rounded-full transition-transform ${
                  isSelected ? "h-7 w-7 scale-110" : "h-5 w-5 hover:scale-110"
                }`}
              >
                <span
                  className="pointer-events-none absolute inset-0 rounded-full opacity-60"
                  style={{
                    backgroundColor: color,
                    animation: "ambient-pulse 3s ease-in-out infinite",
                  }}
                />
                {isDanger && (
                  <span
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: color,
                      animation: "danger-pulse 1.6s ease-out infinite",
                    }}
                  />
                )}
                <span
                  className="relative h-full w-full rounded-full border-2 border-white/80 shadow-lg transition-transform duration-300"
                  style={{ backgroundColor: color, transformOrigin: "center" }}
                />
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

        {/* User's actual GPS location — fixed blue dot, only ever set via
            navigator.geolocation in the parent page. Never moves on map
            click; that's what pinLocation below is for. */}
        {validUser && (
          <Marker latitude={validUser.lat} longitude={validUser.lng} anchor="center">
            <div className="relative grid h-5 w-5 place-items-center" title="Your location">
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-blue-500"
                style={{ animation: "user-location-pulse 2s ease-out infinite" }}
              />
              <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.4)]" />
            </div>
          </Marker>
        )}

        {/* Manually-dropped pin (from clicking the map) — visually distinct
            teardrop shape, orange/amber, so it's unmistakably NOT the blue
            "you are here" dot. Used as an alternate search origin only. */}
        {validPin && (
          <Marker latitude={validPin.lat} longitude={validPin.lng} anchor="bottom">
            <div className="drop-in" title="Search from this point">
              <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
                <path
                  d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z"
                  fill="#F59E0B"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <circle cx="14" cy="14" r="5" fill="white" />
              </svg>
            </div>
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

      <style>{`
        @keyframes ambient-pulse {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.6); opacity: 0.15; }
        }
        @keyframes danger-pulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes user-location-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes drop-in-bounce {
          0% { transform: translateY(-16px); opacity: 0; }
          60% { transform: translateY(2px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .drop-in {
          transform-origin: bottom center;
          animation: drop-in-bounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}