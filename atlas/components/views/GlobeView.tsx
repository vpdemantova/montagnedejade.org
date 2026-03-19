"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"

// ── Types ─────────────────────────────────────────────────────────────────────

export type GlobeItem = {
  id:    string
  title: string
  area:  string
  type:  string
}

// ── Area geographic anchors ────────────────────────────────────────────────────

const AREA_ANCHORS: Record<string, { lat: number; lon: number; color: string }> = {
  ACADEMIA:   { lat: -22.9,  lon: -43.17,  color: "#C8A45A" },  // Rio
  ARTES:      { lat:  48.85, lon:   2.35,  color: "#E07854" },  // Paris
  CULTURA:    { lat: -23.55, lon: -46.63,  color: "#9A6AAA" },  // São Paulo
  OBRAS:      { lat:  41.89, lon:  12.49,  color: "#A0B0C0" },  // Roma
  PESSOAS:    { lat:  51.5,  lon:  -0.12,  color: "#E8D080" },  // Londres
  COMPUTACAO: { lat:  37.77, lon: -122.41, color: "#4A8FA8" },  // SF
  AULAS:      { lat:  52.52, lon:  13.4,   color: "#5A8A6A" },  // Berlim
  ATLAS:      { lat:  35.69, lon: 139.69,  color: "#C8A45A" },  // Tóquio
  COMPASS:    { lat:  -33.8, lon: 151.2,   color: "#39FF14" },  // Sydney
}

const DEFAULT_ANCHOR = { lat: 0, lon: 0, color: "#C8A45A" }

function latLonToXYZ(lat: number, lon: number, r: number): [number, number, number] {
  const phi   = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return [
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  ]
}

// ── Simple LCG rand seeded by string ─────────────────────────────────────────

function seededRand(seed: string): () => number {
  let s = seed.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 1)
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

// ── Globe sphere ──────────────────────────────────────────────────────────────

const OCEAN_MAT  = new THREE.MeshStandardMaterial({ color: "#0a1828", roughness: 0.85, metalness: 0.1 })
const ATMOS_MAT  = new THREE.MeshStandardMaterial({
  color: "#1a4a80", emissive: "#0a2440", emissiveIntensity: 0.3,
  transparent: true, opacity: 0.14, side: THREE.BackSide, depthWrite: false,
})
const GRID_MAT   = new THREE.LineBasicMaterial({ color: "#1a4070", transparent: true, opacity: 0.28 })

function GlobeSphere() {
  const groupRef = useRef<THREE.Group>(null!)

  // lat/lon grid lines
  const gridGeom = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const R = 4.0
    const addLine = (points: THREE.Vector3[]) => {
      for (let i = 0; i < points.length - 1; i++) {
        pts.push(points[i]!, points[i + 1]!)
      }
    }
    // Latitude lines every 30°
    for (let lat = -60; lat <= 60; lat += 30) {
      const line: THREE.Vector3[] = []
      for (let lon = 0; lon <= 360; lon += 5) {
        const [x, y, z] = latLonToXYZ(lat, lon - 180, R)
        line.push(new THREE.Vector3(x, y, z))
      }
      addLine(line)
    }
    // Longitude lines every 30°
    for (let lon = 0; lon < 360; lon += 30) {
      const line: THREE.Vector3[] = []
      for (let lat = -90; lat <= 90; lat += 5) {
        const [x, y, z] = latLonToXYZ(lat, lon - 180, R)
        line.push(new THREE.Vector3(x, y, z))
      }
      addLine(line)
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts)
    return g
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.06
    }
  })

  return (
    <group ref={groupRef}>
      {/* Ocean sphere */}
      <mesh material={OCEAN_MAT}>
        <sphereGeometry args={[4.0, 48, 48]} />
      </mesh>
      {/* Grid lines */}
      <lineSegments geometry={gridGeom} material={GRID_MAT} />
      {/* Atmosphere */}
      <mesh material={ATMOS_MAT}>
        <sphereGeometry args={[4.55, 24, 24]} />
      </mesh>
    </group>
  )
}

// ── Item dots ─────────────────────────────────────────────────────────────────

function ItemDots({ items }: { items: GlobeItem[] }) {
  const groupRef = useRef<THREE.Group>(null!)

  const dots = useMemo(() => {
    const R = 4.06
    const SCATTER = 18  // degrees of scatter around anchor
    return items.map((item) => {
      const anchor = AREA_ANCHORS[item.area] ?? DEFAULT_ANCHOR
      const rand = seededRand(item.id)
      const lat = anchor.lat + (rand() - 0.5) * SCATTER * 2
      const lon = anchor.lon + (rand() - 0.5) * SCATTER * 2
      const [x, y, z] = latLonToXYZ(lat, lon, R)
      return { x, y, z, color: anchor.color, title: item.title, area: item.area }
    })
  }, [items])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.06
    }
  })

  return (
    <group ref={groupRef}>
      {dots.map((dot, i) => (
        <mesh key={i} position={[dot.x, dot.y, dot.z]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial
            color={dot.color}
            emissive={dot.color}
            emissiveIntensity={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Area label rings ──────────────────────────────────────────────────────────

function AreaPins({ items }: { items: GlobeItem[] }) {
  const groupRef = useRef<THREE.Group>(null!)

  const pins = useMemo(() => {
    const R = 4.08
    const seen = new Set<string>()
    const result: { x: number; y: number; z: number; color: string }[] = []
    for (const item of items) {
      if (seen.has(item.area)) continue
      seen.add(item.area)
      const anchor = AREA_ANCHORS[item.area] ?? DEFAULT_ANCHOR
      const [x, y, z] = latLonToXYZ(anchor.lat, anchor.lon, R)
      result.push({ x, y, z, color: anchor.color })
    }
    return result
  }, [items])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.06
    }
  })

  return (
    <group ref={groupRef}>
      {pins.map((pin, i) => (
        <mesh key={i} position={[pin.x, pin.y, pin.z]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial
            color={pin.color}
            emissive={pin.color}
            emissiveIntensity={1.6}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Scene ─────────────────────────────────────────────────────────────────────

function GlobeScene({ items }: { items: GlobeItem[] }) {
  return (
    <>
      <color attach="background" args={["#07090e"]} />
      <fog attach="fog" args={["#07090e", 18, 55]} />

      <ambientLight intensity={0.08} color="#4477AA" />
      <directionalLight position={[8, 12, 6]}  intensity={0.9} color="#C8D8F0" />
      <directionalLight position={[-6, -4, -8]} intensity={0.25} color="#3050A0" />
      <pointLight position={[0, 0, 0]} color="#1a4080" intensity={0.5} distance={10} />

      <GlobeSphere />
      <ItemDots items={items} />
      <AreaPins  items={items} />

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={22}
        autoRotate={false}
        enableDamping
        dampingFactor={0.07}
        zoomSpeed={0.5}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.85} intensity={1.8} mipmapBlur />
      </EffectComposer>
    </>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export function GlobeView({ items, height = "60vh" }: { items: GlobeItem[]; height?: string }) {
  return (
    <div style={{ width: "100%", height, minHeight: 460 }} className="bg-[#07090e]">
      <Canvas
        camera={{ position: [0, 3, 12], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <GlobeScene items={items} />
      </Canvas>
    </div>
  )
}
