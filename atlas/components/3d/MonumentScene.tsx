"use client"

import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react"
import {
  useFrame,
  useThree,
  extend,
} from "@react-three/fiber"
import {
  OrbitControls,
  Stars,
  Html,
  Sparkles,
} from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { useSolarStore } from "@/atlas/lib/store"

// ── Types ─────────────────────────────────────────────────────────────────────

export type MonumentItem = {
  id:             string
  slug?:          string | null
  title:          string
  type:           string
  area:           string
  relationsCount: number
}

export type MonumentRelation = {
  fromId: string
  toId:   string
}

export type MonumentData = {
  total:       number
  totalByArea: Record<string, number>
  items:       MonumentItem[]
  relations:   MonumentRelation[]
}

// ── Area config ───────────────────────────────────────────────────────────────

const AREAS = [
  { key: "ACADEMIA",   color: "#C8A45A", speed: 0.18, tilt: 15  },
  { key: "ARTES",      color: "#E07854", speed: 0.13, tilt: 35  },
  { key: "COMPUTACAO", color: "#4A8FA8", speed: 0.22, tilt: 55  },
  { key: "AULAS",      color: "#5A8A6A", speed: 0.10, tilt: 72  },
  { key: "CULTURA",    color: "#9A6AAA", speed: 0.16, tilt: 90  },
  { key: "ATLAS",      color: "#A8B8C8", speed: 0.08, tilt: 110 },
]

const AREA_COLOR_MAP: Record<string, string> = Object.fromEntries(
  AREAS.map((a) => [a.key, a.color])
)

const TYPE_COLOR_MAP: Record<string, string> = {
  PERSON:     "#E8D080",
  WORK:       "#E07854",
  CONCEPT:    "#4A8FA8",
  READING:    "#5A8A6A",
  COURSE:     "#9A6AAA",
  PARTITURA:  "#C87890",
  REPERTOIRE: "#78A8C8",
  default:    "#C8A45A",
}

function getNodeColor(item: MonumentItem): string {
  return TYPE_COLOR_MAP[item.type] ?? TYPE_COLOR_MAP.default!
}

function getPhase(total: number): 1 | 2 | 3 {
  if (total <= 50)  return 1
  if (total <= 200) return 2
  return 3
}

// ── Ring radii per area index ─────────────────────────────────────────────────

function getRingRadius(index: number, phase: 1 | 2 | 3): number {
  const base = 3.2 + index * 1.4
  if (phase === 3) return base * 1.35
  return base
}

// ── Solar Core ────────────────────────────────────────────────────────────────

function SolarCore({ total }: { total: number }) {
  const meshRef   = useRef<THREE.Mesh>(null!)
  const glowRef   = useRef<THREE.Mesh>(null!)
  const pointsRef = useRef<THREE.Points>(null!)
  const lightRef  = useRef<THREE.PointLight>(null!)
  const band1Ref  = useRef<THREE.Mesh>(null!)
  const band2Ref  = useRef<THREE.Mesh>(null!)

  const coreSize = Math.max(0.5, Math.min(1.6, 0.5 + total * 0.003))

  // Particle geometry — 800 points with size variation
  const { particles, sizes } = useMemo(() => {
    const count = 800
    const pos   = new Float32Array(count * 3)
    const sz    = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r     = 0.9 + Math.random() * 3.2
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      sz[i] = 0.02 + Math.random() * 0.06
    }
    return { particles: pos, sizes: sz }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.85 + Math.sin(t * 1.2) * 0.15

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.06
      meshRef.current.rotation.z = Math.sin(t * 0.3) * 0.04
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = pulse
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.06 + Math.sin(t * 0.9) * 0.04
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2.5 + Math.sin(t * 1.6) * 0.8
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = -t * 0.04
      pointsRef.current.rotation.x =  t * 0.025
    }
    if (band1Ref.current) {
      band1Ref.current.rotation.y = t * 0.12
    }
    if (band2Ref.current) {
      band2Ref.current.rotation.y = -t * 0.09
      band2Ref.current.rotation.x = Math.PI / 3
    }
  })

  return (
    <group>
      {/* Core sphere — physical material for clearcoat */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[coreSize, 48, 48]} />
        <meshPhysicalMaterial
          color="#C8A45A"
          emissive="#B8902A"
          emissiveIntensity={0.85}
          roughness={0.18}
          metalness={0.75}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          reflectivity={0.8}
        />
      </mesh>

      {/* Equatorial band 1 */}
      <mesh ref={band1Ref}>
        <torusGeometry args={[coreSize * 1.15, coreSize * 0.04, 8, 64]} />
        <meshStandardMaterial color="#C8A45A" emissive="#C8A45A" emissiveIntensity={0.5} transparent opacity={0.55} />
      </mesh>

      {/* Equatorial band 2 — tilted */}
      <mesh ref={band2Ref}>
        <torusGeometry args={[coreSize * 1.28, coreSize * 0.025, 6, 64]} />
        <meshStandardMaterial color="#E8C870" emissive="#E8C870" emissiveIntensity={0.3} transparent opacity={0.35} />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[coreSize * 1.5, 16, 16]} />
        <meshStandardMaterial
          color="#C8A45A"
          emissive="#C8A45A"
          emissiveIntensity={0.4}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Point light at core */}
      <pointLight ref={lightRef} color="#C8A45A" intensity={3} distance={22} decay={2} />

      {/* Secondary warm fill light */}
      <pointLight color="#FF8040" intensity={0.6} distance={8} decay={2.5} />

      {/* Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          color="#C8A45A"
          size={0.045}
          transparent
          opacity={0.55}
          sizeAttenuation
          vertexColors={false}
        />
      </points>
    </group>
  )
}

// ── Node Mesh (smooth hover lerp) ─────────────────────────────────────────────

function NodeMesh({
  item, angle, radius, isHovered, onHover, onClick,
}: {
  item:      MonumentItem
  angle:     number
  radius:    number
  isHovered: boolean
  onHover:   (id: string | null) => void
  onClick:   (item: MonumentItem) => void
}) {
  const meshRef   = useRef<THREE.Mesh>(null!)
  const matRef    = useRef<THREE.MeshStandardMaterial>(null!)
  const scaleRef  = useRef(1)
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  const baseSize = Math.max(0.07, Math.min(0.28, 0.07 + item.relationsCount * 0.025))
  const nodeColor = getNodeColor(item)
  const target = isHovered ? 1.55 : 1.0

  useFrame(() => {
    scaleRef.current += (target - scaleRef.current) * 0.12
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scaleRef.current)
    }
    if (matRef.current) {
      const targetEm = isHovered ? 1.4 : 0.4
      matRef.current.emissiveIntensity += (targetEm - matRef.current.emissiveIntensity) * 0.1
    }
  })

  return (
    <group position={[x, 0, z]}>
      <mesh
        ref={meshRef}
        onPointerEnter={(e) => { e.stopPropagation(); onHover(item.id) }}
        onPointerLeave={(e) => { e.stopPropagation(); onHover(null) }}
        onClick={(e) => { e.stopPropagation(); onClick(item) }}
      >
        <sphereGeometry args={[baseSize, 14, 14]} />
        <meshStandardMaterial
          ref={matRef}
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={0.4}
          roughness={0.35}
          metalness={0.5}
        />
      </mesh>

      {isHovered && (
        <Html distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background:  "rgba(13,13,15,0.94)",
              border:      "1px solid rgba(200,164,90,0.45)",
              padding:     "5px 10px",
              fontFamily:  "IBM Plex Mono, monospace",
              fontSize:    "10px",
              color:       "#E8E4DC",
              whiteSpace:  "nowrap",
              transform:   "translateX(-50%)",
              borderRadius: "1px",
              letterSpacing: "0.04em",
            }}
          >
            {item.title}
            <br />
            <span style={{ color: "#8A8678", fontSize: "8px", letterSpacing: "0.08em" }}>
              {item.type} · {item.area}
            </span>
          </div>
        </Html>
      )}
    </group>
  )
}

// ── Orbital Ring ──────────────────────────────────────────────────────────────

function OrbitalRing({
  areaIndex,
  radius,
  color,
  speed,
  tilt,
  items,
  phase,
  onItemClick,
  onItemHover,
  hoveredId,
}: {
  areaIndex:   number
  radius:      number
  color:       string
  speed:       number
  tilt:        number
  items:       MonumentItem[]
  phase:       1 | 2 | 3
  onItemClick: (item: MonumentItem) => void
  onItemHover: (id: string | null) => void
  hoveredId:   string | null
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const tiltRad  = (tilt * Math.PI) / 180

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * speed
    }
  })

  // Ring line geometry
  const ringPoints = useMemo(() => {
    const segments = 128
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(
        Math.cos(a) * radius,
        0,
        Math.sin(a) * radius,
      ))
    }
    return pts
  }, [radius])

  const ringGeom = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(ringPoints)
    return g
  }, [ringPoints])

  // Phase 2+: constellation connections between items on the ring
  const constellationGeom = useMemo(() => {
    if (phase < 2 || items.length < 2) return null
    const pts: number[] = []
    for (let i = 0; i < items.length - 1; i++) {
      const a1 = (i / items.length) * Math.PI * 2
      const a2 = ((i + 1) / items.length) * Math.PI * 2
      pts.push(
        Math.cos(a1) * radius, 0, Math.sin(a1) * radius,
        Math.cos(a2) * radius, 0, Math.sin(a2) * radius,
      )
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [items.length, radius, phase])

  return (
    <group rotation={[tiltRad, areaIndex * 0.8, 0]}>
      <group ref={groupRef}>
        {/* Ring line */}
        <line>
          <primitive object={ringGeom} attach="geometry" />
          <lineBasicMaterial color={color} transparent opacity={0.25} />
        </line>

        {/* Constellation lines — Phase 2+ */}
        {constellationGeom && (
          <lineSegments>
            <primitive object={constellationGeom} attach="geometry" />
            <lineBasicMaterial color={color} transparent opacity={0.12} />
          </lineSegments>
        )}

        {/* Item nodes */}
        {items.map((item, i) => (
          <NodeMesh
            key={item.id}
            item={item}
            angle={(i / Math.max(items.length, 1)) * Math.PI * 2}
            radius={radius}
            isHovered={hoveredId === item.id}
            onHover={onItemHover}
            onClick={onItemClick}
          />
        ))}
      </group>
    </group>
  )
}

// ── Connection Lines ──────────────────────────────────────────────────────────

function ConnectionLines({
  items,
  relations,
  hoveredId,
  phase,
}: {
  items:     MonumentItem[]
  relations: MonumentRelation[]
  hoveredId: string | null
  phase:     1 | 2 | 3
}) {
  const idToItem = useMemo(() => {
    const m = new Map<string, MonumentItem>()
    items.forEach((it) => m.set(it.id, it))
    return m
  }, [items])

  // Compute 3D position for each item on its ring
  const idToPos = useMemo(() => {
    const m = new Map<string, THREE.Vector3>()
    AREAS.forEach((area, areaIndex) => {
      const areaItems = items.filter((it) => it.area === area.key)
      const radius = getRingRadius(areaIndex, phase)
      const tiltRad = (area.tilt * Math.PI) / 180

      areaItems.forEach((item, i) => {
        const angle = (i / Math.max(areaItems.length, 1)) * Math.PI * 2
        const lx = Math.cos(angle) * radius
        const lz = Math.sin(angle) * radius

        // Apply tilt + ring group rotation (simplified — approximate positions)
        const qTilt = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(tiltRad, areaIndex * 0.8, 0)
        )
        const v = new THREE.Vector3(lx, 0, lz).applyQuaternion(qTilt)
        m.set(item.id, v)
      })
    })
    return m
  }, [items, phase])

  const { activeGeom, dimGeom } = useMemo(() => {
    const activeLines: number[] = []
    const dimLines:    number[] = []

    relations.forEach(({ fromId, toId }) => {
      const a = idToPos.get(fromId)
      const b = idToPos.get(toId)
      if (!a || !b) return
      const isActive = hoveredId === fromId || hoveredId === toId
      const target = isActive ? activeLines : dimLines
      target.push(a.x, a.y, a.z, b.x, b.y, b.z)
    })

    const make = (arr: number[]) => {
      const g = new THREE.BufferGeometry()
      g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3))
      return g
    }

    return { activeGeom: make(activeLines), dimGeom: make(dimLines) }
  }, [idToPos, relations, hoveredId])

  return (
    <group>
      <lineSegments geometry={dimGeom}>
        <lineBasicMaterial color="#C8A45A" transparent opacity={0.08} />
      </lineSegments>
      <lineSegments geometry={activeGeom}>
        <lineBasicMaterial color="#C8A45A" transparent opacity={0.6} />
      </lineSegments>
    </group>
  )
}

// ── Camera fly-in ─────────────────────────────────────────────────────────────

function CameraController({ onEnterAtlas }: { onEnterAtlas: () => void }) {
  const { camera } = useThree()

  // Fly-in on mount → scroll-based pull-back after landing
  useEffect(() => {
    let cleanup: (() => void) | undefined

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)

      // Start far, fly in smoothly
      camera.position.set(0, 16, 58)
      camera.lookAt(0, 0, 0)

      const flyIn = gsap.to(camera.position, {
        x: 0, y: 8, z: 22,
        duration: 3.2,
        ease: "power3.out",
        onComplete: () => {
          // After landing, set up scroll-based pull-back with damped scrub
          const pullBack = gsap.to(camera.position, {
            z: 34,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: document.body,
              start: "top top",
              end:   "32% top",
              scrub: 2.0,   // damped scrub — lags behind scroll for ease feel
            },
          })
          cleanup = () => {
            pullBack.kill()
            ScrollTrigger.getAll().forEach((t) => t.kill())
          }
        },
      })

      cleanup = () => {
        flyIn.kill()
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }).catch(console.error)

    return () => cleanup?.()
  }, [camera])

  return null
}

// ── Phase 3 Architecture shell ────────────────────────────────────────────────

function ArchitectureShell() {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.015
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer dodecahedron wireframe */}
      <mesh>
        <dodecahedronGeometry args={[14, 0]} />
        <meshBasicMaterial color="#2A2A3A" wireframe transparent opacity={0.15} />
      </mesh>
      {/* Structural pillars */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 11, 0, Math.sin(angle) * 11]}>
            <cylinderGeometry args={[0.04, 0.04, 16, 6]} />
            <meshStandardMaterial color="#C8A45A" emissive="#C8A45A" emissiveIntensity={0.2} />
          </mesh>
        )
      })}
    </group>
  )
}

// ── Main Scene ────────────────────────────────────────────────────────────────

export function MonumentScene({
  data,
  isMobile,
  onItemClick,
  onEnterAtlas,
}: {
  data:         MonumentData
  isMobile:     boolean
  onItemClick:  (item: MonumentItem) => void
  onEnterAtlas: () => void
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const phase = getPhase(data.total)

  const itemsByArea = useMemo(() => {
    const m: Record<string, MonumentItem[]> = {}
    AREAS.forEach((a) => {
      m[a.key] = data.items.filter((it) => it.area === a.key)
    })
    return m
  }, [data.items])

  return (
    <>
      <color attach="background" args={["#0A0A0D"]} />
      <fog attach="fog" args={["#0A0A0D", 35, 90]} />

      <ambientLight intensity={0.08} color="#A090C0" />
      <directionalLight position={[10, 20, 5]} intensity={0.25} color="#C8B880" />

      <Stars radius={100} depth={60} count={5000} factor={4} saturation={0.1} fade speed={0.3} />

      {/* Ambient nebula sparkles */}
      <Sparkles
        count={120}
        scale={40}
        size={1.5}
        speed={0.2}
        opacity={0.25}
        color="#C8A45A"
      />

      {/* Core */}
      <SolarCore total={data.total} />

      {/* Orbital rings */}
      {AREAS.map((area, i) => (
        <OrbitalRing
          key={area.key}
          areaIndex={i}
          radius={getRingRadius(i, phase)}
          color={area.color}
          speed={area.speed}
          tilt={area.tilt}
          items={isMobile ? [] : (itemsByArea[area.key] ?? [])}
          phase={phase}
          onItemClick={onItemClick}
          onItemHover={setHoveredId}
          hoveredId={hoveredId}
        />
      ))}

      {/* Connection lines — Phase 2+ and not mobile */}
      {phase >= 2 && !isMobile && (
        <ConnectionLines
          items={data.items}
          relations={data.relations}
          hoveredId={hoveredId}
          phase={phase}
        />
      )}

      {/* Architecture shell — Phase 3 */}
      {phase === 3 && <ArchitectureShell />}

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={50}
        autoRotate
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.08}
        zoomSpeed={0.5}
        makeDefault
      />

      <CameraController onEnterAtlas={onEnterAtlas} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.35}
          luminanceSmoothing={0.85}
          intensity={1.5}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}
