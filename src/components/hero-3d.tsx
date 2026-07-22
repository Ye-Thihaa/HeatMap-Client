import { Canvas, useFrame } from "@react-three/fiber";
import { useScroll, useTransform, motion, type MotionValue } from "framer-motion";
import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import * as THREE from "three";

type HeatStatus = "low" | "moderate" | "high" | "extreme";

type CityMarker = {
  lat: number;
  lng: number;
  status: HeatStatus;
};

const STATUS_COLOR: Record<HeatStatus, string> = {
  low: "#4ade80",
  moderate: "#facc15",
  high: "#fb923c",
  extreme: "#f43f5e",
};

// Rough real-world coordinates so the dots read as an actual world map, not random noise.
const MARKERS: CityMarker[] = [
  { lat: 40.7, lng: -74.0, status: "high" }, // New York
  { lat: 51.5, lng: -0.1, status: "low" }, // London
  { lat: 35.7, lng: 139.7, status: "moderate" }, // Tokyo
  { lat: 19.4, lng: -99.1, status: "extreme" }, // Mexico City
  { lat: -33.9, lng: 151.2, status: "moderate" }, // Sydney
  { lat: 28.6, lng: 77.2, status: "extreme" }, // Delhi
  { lat: -23.5, lng: -46.6, status: "high" }, // Sao Paulo
  { lat: 1.35, lng: 103.8, status: "high" }, // Singapore
  { lat: 30.0, lng: 31.2, status: "extreme" }, // Cairo
  { lat: 55.7, lng: 37.6, status: "low" }, // Moscow
  { lat: -1.3, lng: 36.8, status: "moderate" }, // Nairobi
  { lat: 34.0, lng: -118.2, status: "moderate" }, // Los Angeles
  { lat: 41.0, lng: 28.9, status: "high" }, // Istanbul
  { lat: -34.6, lng: -58.4, status: "moderate" }, // Buenos Aires
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

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function GlowDot({
  position,
  color,
  texture,
}: {
  position: THREE.Vector3;
  color: string;
  texture: THREE.Texture;
}) {
  const core = useRef<THREE.Mesh>(null!);
  const glow = useRef<THREE.Sprite>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.6 + Math.sin(t * 1.6 + phase) * 0.3;
    if (glow.current) {
      glow.current.scale.setScalar(0.16 + pulse * 0.08);
      (glow.current.material as THREE.SpriteMaterial).opacity = 0.3 + pulse * 0.2;
    }
    if (core.current) {
      core.current.scale.setScalar(0.9 + pulse * 0.3);
    }
  });

  return (
    <group position={position}>
      <mesh ref={core}>
        <sphereGeometry args={[0.026, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <sprite ref={glow} scale={[0.22, 0.22, 0.22]}>
        <spriteMaterial
          map={texture}
          color={color}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

function HeatGlobe({ progress }: { progress: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null!);
  const radius = 1.6;
  const glowTexture = useMemo(() => makeGlowTexture(), []);

  useFrame((_, dt) => {
    const p = progress.get();
    if (group.current) {
      // idle rotation, speeding up as the user scrolls through the hero
      group.current.rotation.y += dt * (0.1 + p * 0.55);
      // drift left to right across the hero as the user scrolls
      group.current.position.x = -1.4 + p * 2.8;
    }
  });

  const markers = useMemo(
    () =>
      MARKERS.map((m) => ({
        pos: latLngToVec3(m.lat, m.lng, radius + 0.015),
        color: STATUS_COLOR[m.status],
      })),
    [],
  );

  return (
    <group ref={group}>
      {/* solid faint world sphere */}
      <mesh>
        <sphereGeometry args={[radius * 0.99, 48, 48]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.05} roughness={1} />
      </mesh>
      {/* wireframe world lines */}
      <mesh>
        <sphereGeometry args={[radius, 32, 24]} />
        <meshBasicMaterial color="#f1f5f9" wireframe transparent opacity={0.18} />
      </mesh>

      {markers.map((m, i) => (
        <GlowDot key={i} position={m.pos} color={m.color} texture={glowTexture} />
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
    <section ref={ref} className="relative h-[200vh] bg-[#05070d]">
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
            className="mb-4 rounded-full border border-white/25 bg-black/30 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/80 backdrop-blur"
          >
            AI Urban Heat Intelligence
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="max-w-4xl font-display text-5xl font-semibold leading-[1.05] text-white sm:text-7xl"
          >
            Your city is <span className="text-orange-400">heating up</span>.
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 text-xs uppercase tracking-widest text-white/50"
          >
            ↓ scroll to feel the heat
          </motion.p>
        </div>
      </div>
    </section>
  );
}