import Map, { Marker, Source, Layer, type MapRef } from "react-map-gl/maplibre";
import { useMemo, useRef, useEffect, useState } from "react";
import type { CoolingCenter, HeatZoneSummary } from "@/lib/types";
import { RISK_COLORS } from "@/lib/api-client";
import { useGreenerMapStyle } from "../lib/map-style";
import { useLanguage } from "@/lib/i18n/language-context";
import { motion } from "framer-motion";

const LEGEND_KEY = {
  low: "legend.low",
  moderate: "legend.moderate",
  high: "legend.high",
  severe: "legend.severe",
} as const;

// Fallback default: Yangon, used only when there's no user location AND no
// zones at all to derive a center from.
const DEFAULT_CENTER = { lat: 16.8, lng: 96.15 };

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  emergency?: boolean;
  phone?: string | null;
}

interface Props {
  zones: HeatZoneSummary[];
  centers?: CoolingCenter[];
  hospitals?: Hospital[];
  selectedZoneId?: string | null;
  onSelectZone?: (id: string) => void;
  onSelectHospital?: (hospital: Hospital) => void;
  userLocation?: { lat: number; lng: number } | null;
  pinLocation?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  routeTo?: { lat: number; lng: number } | null;
  // Real road-following geometry from POST /route/directions, as returned
  // by OSRM: an array of [lng, lat] pairs. If this is set, it's rendered as
  // a real reprojecting map layer instead of the old straight-line SVG
  // overlay. The straight dashed line still shows as a "calculating..."
  // placeholder while routeTo is set but this hasn't arrived yet.
  routeGeometry?: [number, number][] | null;
}

export function HeatMap({
  zones,
  centers = [],
  hospitals = [],
  selectedZoneId,
  onSelectZone,
  onSelectHospital,
  userLocation,
  pinLocation,
  onMapClick,
  routeTo,
  routeGeometry,
}: Props) {
  const mapStyle = useGreenerMapStyle();
  const { t } = useLanguage();
  const ref = useRef<MapRef>(null);
  const validZones = useMemo(
    () => zones.filter((z) => Number.isFinite(z.centroid_lat) && Number.isFinite(z.centroid_lng)),
    [zones],
  );
  const validCenters = useMemo(
    () => centers.filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng)),
    [centers],
  );
  const validHospitals = useMemo(
    () => hospitals.filter((h) => Number.isFinite(h.lat) && Number.isFinite(h.lng)),
    [hospitals],
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

  // IMPORTANT: do NOT average every zone's lat/lng together. Once zones span
  // multiple distant cities (e.g. Yangon + Phoenix), the average lands
  // somewhere geographically meaningless between them (mid-ocean) — the map
  // would center on empty water and nothing would be visible, even though
  // the data itself is completely correct. Instead: prefer the user's real
  // location if known, otherwise the first zone's location, otherwise a
  // fixed sane default.
  const center = useMemo(() => {
    if (validUser) return validUser;
    if (validZones.length > 0) {
      return { lat: validZones[0].centroid_lat, lng: validZones[0].centroid_lng };
    }
    return DEFAULT_CENTER;
  }, [validUser, validZones]);

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
  const routeOrigin = validPin ?? validUser;

  // Straight-line placeholder — only used while a real route is being
  // fetched (routeTo set, routeGeometry not yet available).
  const routeSvg = useMemo(() => {
    if (routeGeometry || !routeOrigin || !validRouteTo || !ref.current || !mapReady) return null;
    try {
      const from = ref.current.project([routeOrigin.lng, routeOrigin.lat]);
      const to = ref.current.project([validRouteTo.lng, validRouteTo.lat]);
      if (![from.x, from.y, to.x, to.y].every(Number.isFinite)) return null;
      return { from, to };
    } catch {
      return null;
    }
  }, [routeGeometry, routeOrigin, validRouteTo, mapReady]);

  const routeGeoJson = useMemo(() => {
    if (!routeGeometry || routeGeometry.length < 2) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: routeGeometry },
    };
  }, [routeGeometry]);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      <Map
        ref={ref}
        mapStyle={mapStyle}
        initialViewState={{ latitude: center.lat, longitude: center.lng, zoom: 12.5 }}
        onLoad={() => setMapReady(true)}
        onClick={(e) => onMapClick?.(e.lngLat.lat, e.lngLat.lng)}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {/* Real routed path — a proper map layer, reprojects correctly as
            the map pans/zooms, unlike the old fixed-position SVG line. */}
        {routeGeoJson && (
          <Source id="route" type="geojson" data={routeGeoJson}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                "line-color": "#0EA5A0",
                "line-width": 4,
                "line-opacity": 0.85,
              }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </Source>
        )}

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
                aria-label={t("map.zoneMarkerAria", {
                  name: z.name,
                  risk: t(LEGEND_KEY[z.risk_level]),
                  temp: z.current_temp_c,
                })}
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
          <Marker
            key={c.id}
            latitude={c.lat}
            longitude={c.lng}
            anchor="bottom"
          >
            <div className="flex flex-col items-center" title={c.name}>
              {c.type === "water_station" ? (
                <div className="grid h-7 w-7 place-items-center rounded-full bg-sky-400 text-white shadow-lg">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8 8 5 11.5 5 15a7 7 0 0 0 14 0c0-3.5-3-7-7-13z" />
                  </svg>
                </div>
              ) : (
                <div className="grid h-8 w-8 place-items-center rounded-full bg-safe text-black shadow-lg animate-pulse">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
                  </svg>
                </div>
              )}
              {c.sponsor_name && (
                <span className="mt-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-ink-700 shadow-sm">
                  {t("map.sponsored")}
                </span>
              )}
            </div>
          </Marker>
        ))}

        {validHospitals.map((h) => (
          <Marker
            key={h.id}
            latitude={h.lat}
            longitude={h.lng}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelectHospital?.(h);
            }}
          >
            <button
              type="button"
              className="flex flex-col items-center"
              title={h.name}
              aria-label={h.name}
            >
              <div
                className={`relative grid h-8 w-8 place-items-center rounded-full bg-rose-600 text-white shadow-lg transition-transform hover:scale-110 ${
                  h.emergency ? "animate-pulse" : ""
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-1 10h-4v4h-4v-4H6v-4h4V5h4v4h4z" />
                </svg>
              </div>
              {h.emergency && (
                <span className="mt-0.5 rounded-full bg-rose-600/90 px-1.5 py-0.5 text-[9px] font-medium text-white shadow-sm">
                  {t("map.emergency") ?? "24/7"}
                </span>
              )}
            </button>
          </Marker>
        ))}

        {validUser && (
          <Marker latitude={validUser.lat} longitude={validUser.lng} anchor="center">
            <div className="relative grid h-5 w-5 place-items-center" title={t("map.yourLocation")}>
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-blue-500"
                style={{ animation: "user-location-pulse 2s ease-out infinite" }}
              />
              <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.4)]" />
            </div>
          </Marker>
        )}

        {validPin && (
          <Marker latitude={validPin.lat} longitude={validPin.lng} anchor="bottom">
            <div className="drop-in" title={t("map.searchFromHere")}>
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

      {/* Straight dashed placeholder line — only shows while a real route
          is still being fetched. */}
      {routeSvg && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <motion.line
            x1={routeSvg.from.x}
            y1={routeSvg.from.y}
            x2={routeSvg.to.x}
            y2={routeSvg.to.y}
            stroke="#0EA5A0"
            strokeWidth="3"
            strokeDasharray="8 8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2 }}
          />
        </svg>
      )}

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