import { Suspense, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Vertex/fragment shader: a sphere whose surface color interpolates from cool
// blue to warm red based on a uProgress uniform (0 = cool, 1 = hot), plus a
// handful of glowing "hot zone" points that fade in as progress increases —
// foreshadowing the heat map the user is about to land on.
const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  vec3 cool = vec3(0.180, 0.400, 0.706); // #2E66B4-ish cool blue
  vec3 warm = vec3(0.937, 0.267, 0.267); // #EF4444 heat red

  float hotspot(vec3 p, vec3 center, float radius) {
    return smoothstep(radius, 0.0, distance(p, center));
  }

  void main() {
    float lightFactor = 0.55 + 0.45 * max(dot(vNormal, normalize(vec3(0.4, 0.6, 0.8))), 0.0);
    vec3 base = mix(cool, warm, uProgress);

    // A few fixed hotspot centers on the unit sphere that glow in as uProgress rises.
    float h = 0.0;
    h += hotspot(vPosition, vec3(0.6, 0.5, 0.3), 0.5);
    h += hotspot(vPosition, vec3(-0.4, -0.3, 0.7), 0.45);
    h += hotspot(vPosition, vec3(0.1, -0.6, -0.5), 0.5);
    h = clamp(h, 0.0, 1.0) * uProgress;

    vec3 glow = vec3(1.0, 0.75, 0.3);
    vec3 color = mix(base * lightFactor, glow, h * 0.6);

    gl_FragColor = vec4(color, 1.0);
  }
`

function HeatSphere({ progress }: { progress: MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Slow ambient rotation, independent of scroll.
      meshRef.current.rotation.y += delta * 0.12
      meshRef.current.rotation.x = 0.15
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value +=
        (progress.current - materialRef.current.uniforms.uProgress.value) * 0.08
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.6, 6]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uProgress: { value: 0 }, uTime: { value: 0 } }}
      />
    </mesh>
  )
}

/**
 * Renders the scroll-bound 3D hero object. `scrollProgress` is a ref (0-1) so
 * the canvas doesn't re-render on every scroll tick — useFrame reads it each
 * animation frame instead, which keeps this smooth even on modest hardware.
 */
export function Hero3D({ scrollProgress }: { scrollProgress: MutableRefObject<number> }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'low-power' }}
    >
      <Suspense fallback={null}>
        <HeatSphere progress={scrollProgress} />
      </Suspense>
    </Canvas>
  )
}
