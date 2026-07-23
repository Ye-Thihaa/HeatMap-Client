import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Link } from "@tanstack/react-router";
import { useScroll, useTransform, motion, type MotionValue } from "framer-motion";
import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import * as THREE from "three";

type HeatStatus = "low" | "moderate" | "high" | "extreme";

const STATUS_COLOR: Record<HeatStatus, string> = {
  low: "#4ade80",
  moderate: "#facc15",
  high: "#fb923c",
  extreme: "#f43f5e",
};

const TEMP_LABELS: { lat: number; lng: number; temp: string; color: string }[] = [
  { lat: 40.7, lng: -74.0, temp: "38°", color: STATUS_COLOR.high },
  { lat: 51.5, lng: -0.1, temp: "22°", color: STATUS_COLOR.low },
  { lat: 35.7, lng: 139.7, temp: "34°", color: STATUS_COLOR.moderate },
  { lat: 19.4, lng: -99.1, temp: "41°", color: STATUS_COLOR.extreme },
  { lat: -33.9, lng: 151.2, temp: "28°", color: STATUS_COLOR.moderate },
  { lat: 28.6, lng: 77.2, temp: "44°", color: STATUS_COLOR.extreme },
  { lat: -23.5, lng: -46.6, temp: "36°", color: STATUS_COLOR.high },
  { lat: 1.35, lng: 103.8, temp: "33°", color: STATUS_COLOR.high },
  { lat: 30.0, lng: 31.2, temp: "42°", color: STATUS_COLOR.extreme },
  { lat: 55.7, lng: 37.6, temp: "19°", color: STATUS_COLOR.low },
  { lat: 34.0, lng: -118.2, temp: "32°", color: STATUS_COLOR.moderate },
  { lat: 41.0, lng: 28.9, temp: "37°", color: STATUS_COLOR.high },
  { lat: -34.6, lng: -58.4, temp: "30°", color: STATUS_COLOR.moderate },
];

function latLngToVec3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function generateOutlineTexture(): Promise<THREE.CanvasTexture> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";
    img.onload = () => {
      const w = 1024, h = 512;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      ctx.drawImage(img, 0, 0, w, h);
      const src = ctx.getImageData(0, 0, w, h);
      const edgeData = new Uint8ClampedArray(src.data.length);

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = (y * w + x) * 4;
          const r = (y * w + x) * 4;
          const gx =
            -src.data[r - w * 4 - 4] + src.data[r - w * 4 + 4]
            - 2 * src.data[r - 4] + 2 * src.data[r + 4]
            - src.data[r + w * 4 - 4] + src.data[r + w * 4 + 4];
          const gy =
            -src.data[r - w * 4 - 4] - 2 * src.data[r - w * 4] - src.data[r - w * 4 + 4]
            + src.data[r + w * 4 - 4] + 2 * src.data[r + w * 4] + src.data[r + w * 4 + 4];
          const mag = Math.sqrt(gx * gx + gy * gy);
          if (mag > 40) {
            edgeData[i] = 255;
            edgeData[i + 1] = 255;
            edgeData[i + 2] = 255;
            edgeData[i + 3] = 200;
          }
        }
      }

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        ctx.moveTo(0, (90 - lat) / 180 * h);
        ctx.lineTo(w, (90 - lat) / 180 * h);
        ctx.stroke();
      }
      for (let lng = -180; lng <= 180; lng += 20) {
        ctx.beginPath();
        ctx.moveTo((lng + 180) / 360 * w, 0);
        ctx.lineTo((lng + 180) / 360 * w, h);
        ctx.stroke();
      }

      ctx.putImageData(new ImageData(edgeData, w, h), 0, 0);

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.onerror = () => {
      // fallback: grid-only texture
      const w = 1024, h = 512;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        ctx.moveTo(0, (90 - lat) / 180 * h);
        ctx.lineTo(w, (90 - lat) / 180 * h);
        ctx.stroke();
      }
      for (let lng = -180; lng <= 180; lng += 20) {
        ctx.beginPath();
        ctx.moveTo((lng + 180) / 360 * w, 0);
        ctx.lineTo((lng + 180) / 360 * w, h);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      resolve(tex);
    };
  });
}

function HeatGlobe({ progress }: { progress: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null!);
  const radius = 1.6;
  const [outlineTex, setOutlineTex] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    generateOutlineTexture().then(setOutlineTex);
  }, []);

  useFrame((_, dt) => {
    const p = progress.get();
    if (group.current) {
      group.current.rotation.y += dt * 0.12;
      group.current.position.x = -1.4 + p * 2.8;
    }
  });

  const labelData = useMemo(
    () =>
      TEMP_LABELS.map((t) => ({
        pos: latLngToVec3(t.lat, t.lng, radius * 1.38),
        ...t,
      })),
    [],
  );

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[radius * 0.99, 48, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.04} />
      </mesh>

      {outlineTex && (
        <mesh>
          <sphereGeometry args={[radius, 48, 48]} />
          <meshBasicMaterial
            map={outlineTex}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>
      )}

      {labelData.map((d, i) => (
        <Text
          key={i}
          position={d.pos}
          fontSize={0.09}
          color={d.color}
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
        >
          {d.temp}
        </Text>
      ))}
    </group>
  );
}

export function Hero3D() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="relative h-[200vh] bg-emerald-500">
      <div className="sticky top-0 h-screen overflow-hidden">
        {mounted ? (
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            dpr={[1, 1.8]}
            className="!absolute inset-0"
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 4]} intensity={0.6} />
            <Suspense fallback={null}>
              <HeatGlobe progress={progress} />
            </Suspense>
          </Canvas>
        ) : null}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 rounded-full border-border border border-white/20 bg-emerald-800/40 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white backdrop-blur"
          >
            A Yate Sitt — AI Urban Heat Intelligence
          </motion.p>
          <style>{`@keyframes heatGlow{0%,100%{color:#EF4444;text-shadow:0 0 10px rgba(239,68,68,0.6)}50%{color:#F59E0B;text-shadow:0 0 16px rgba(245,158,11,0.7)}}.heat-pulse{animation:heatGlow 1.5s ease-in-out infinite}`}</style>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="max-w-4xl font-display text-5xl font-semibold leading-[1.05] text-white sm:text-7xl"
          >
            Your city is <span className="heat-pulse">heating up</span>.
            <br />
            See it. Act on it.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 max-w-2xl text-base text-white/70 sm:text-lg"
          >
            Live heat-risk mapping, cooling-center navigation, and AI-guided
            interventions for citizens and city planners — grounded in real
            temperature, canopy, and density data.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <Link
              to="/app"
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-leaf px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              Try it Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-xs uppercase tracking-widest text-white/70"
          >
            ↓ Scroll to See More
          </motion.p>
        </div>
      </div>
    </section>
  );
}