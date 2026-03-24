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
} from "@react-three/fiber"
import {
  OrbitControls,
  Stars,
  Html,
  Sparkles,
} from "@react-three/drei"
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing"
import * as THREE from "three"
import { BlendFunction } from "postprocessing"
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

// ── Area config — slower, more contemplative ──────────────────────────────────

const AREAS = [
  { key: "ACADEMIA",   color: "#C4A052", speed: 0.055, tilt: 15  },
  { key: "ARTES",      color: "#C86848", speed: 0.038, tilt: 35  },
  { key: "COMPUTACAO", color: "#3A7A94", speed: 0.068, tilt: 55  },
  { key: "AULAS",      color: "#4A7A5A", speed: 0.028, tilt: 72  },
  { key: "CULTURA",    color: "#7A5A8A", speed: 0.045, tilt: 90  },
  { key: "ATLAS",      color: "#8898A8", speed: 0.022, tilt: 110 },
]

const TYPE_COLOR_MAP: Record<string, string> = {
  PERSON:     "#D4B860",
  WORK:       "#C06848",
  CONCEPT:    "#3A7898",
  READING:    "#4A7A5A",
  COURSE:     "#7A5888",
  PARTITURA:  "#A86878",
  REPERTOIRE: "#5888A8",
  default:    "#B49040",
}

function getNodeColor(item: MonumentItem): string {
  return TYPE_COLOR_MAP[item.type] ?? TYPE_COLOR_MAP.default!
}

function getPhase(total: number): 1 | 2 | 3 {
  if (total <= 50)  return 1
  if (total <= 200) return 2
  return 3
}

function getRingRadius(index: number, phase: 1 | 2 | 3): number {
  const base = 3.2 + index * 1.4
  return phase === 3 ? base * 1.35 : base
}

// ── Math helpers ──────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

// Very slow ease — good for gradual opacity/scale changes
function easeOutQuint(x: number) {
  return 1 - Math.pow(1 - Math.min(x, 1), 5)
}

// ── Nebula — atmospheric depth planes ─────────────────────────────────────────

function Nebula() {
  const ref0 = useRef<THREE.Mesh>(null!)
  const ref1 = useRef<THREE.Mesh>(null!)
  const ref2 = useRef<THREE.Mesh>(null!)
  const refs = [ref0, ref1, ref2]

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref0.current) ref0.current.rotation.z =  t * 0.008
    if (ref1.current) ref1.current.rotation.z = -t * 0.006
    if (ref2.current) ref2.current.rotation.y =  t * 0.004

    refs.forEach((r, i) => {
      if (!r.current) return
      const mat = r.current.material as THREE.MeshBasicMaterial
      mat.opacity = lerp(
        mat.opacity,
        0.018 + Math.sin(t * 0.08 + i * 2.1) * 0.006,
        0.012
      )
    })
  })

  return (
    <group>
      {/* Warm nebula disc — tilted */}
      <mesh ref={ref0} rotation={[Math.PI / 2.4, 0, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshBasicMaterial
          color="#8040A0"
          transparent
          opacity={0.018}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Cool nebula disc */}
      <mesh ref={ref1} rotation={[Math.PI / 3.5, Math.PI / 5, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshBasicMaterial
          color="#204060"
          transparent
          opacity={0.022}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Gold dust disc */}
      <mesh ref={ref2} rotation={[Math.PI / 1.8, 0, Math.PI / 4]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial
          color="#604020"
          transparent
          opacity={0.014}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

// ── Solar Core ────────────────────────────────────────────────────────────────

function SolarCore({ total }: { total: number }) {
  const meshRef    = useRef<THREE.Mesh>(null!)
  const glowRef    = useRef<THREE.Mesh>(null!)
  const glow2Ref   = useRef<THREE.Mesh>(null!)
  const glow3Ref   = useRef<THREE.Mesh>(null!)
  const pointsRef  = useRef<THREE.Points>(null!)
  const points2Ref = useRef<THREE.Points>(null!)
  const lightRef   = useRef<THREE.PointLight>(null!)
  const fillRef    = useRef<THREE.PointLight>(null!)
  const rimRef     = useRef<THREE.PointLight>(null!)
  const band1Ref   = useRef<THREE.Mesh>(null!)
  const band2Ref   = useRef<THREE.Mesh>(null!)

  const coreSize = Math.max(0.5, Math.min(1.6, 0.5 + total * 0.003))

  const { particles, sizes, particles2, sizes2 } = useMemo(() => {
    // Inner corona particles
    const count = 1200
    const pos   = new Float32Array(count * 3)
    const sz    = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r     = 0.8 + Math.random() * 2.8
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      sz[i] = 0.015 + Math.random() * 0.04
    }
    // Outer dust halo — wider, sparser
    const count2 = 400
    const pos2   = new Float32Array(count2 * 3)
    const sz2    = new Float32Array(count2)
    for (let i = 0; i < count2; i++) {
      const r     = 3.5 + Math.random() * 4.0
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      pos2[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos2[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos2[i * 3 + 2] = r * Math.cos(phi)
      sz2[i] = 0.025 + Math.random() * 0.08
    }
    return { particles: pos, sizes: sz, particles2: pos2, sizes2: sz2 }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Multi-frequency organic breath — very slow
    const breath =
      Math.sin(t * 0.18) * 0.10 +
      Math.sin(t * 0.41) * 0.04 +
      Math.sin(t * 0.79) * 0.018

    const lightBreath =
      Math.sin(t * 0.14) * 0.6 +
      Math.sin(t * 0.33) * 0.25

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.025
      meshRef.current.rotation.z = Math.sin(t * 0.10) * 0.025
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = lerp(mat.emissiveIntensity, 0.70 + breath, 0.025)
    }

    // Three glow layers — each slightly different phase
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = lerp(mat.opacity, 0.06 + breath * 0.5, 0.02)
    }
    if (glow2Ref.current) {
      const mat = glow2Ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = lerp(mat.opacity, 0.028 + Math.sin(t * 0.12) * 0.010, 0.018)
    }
    if (glow3Ref.current) {
      const mat = glow3Ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = lerp(mat.opacity, 0.012 + Math.sin(t * 0.07) * 0.005, 0.015)
    }

    if (lightRef.current) {
      lightRef.current.intensity = lerp(lightRef.current.intensity, 2.2 + lightBreath, 0.02)
    }
    if (fillRef.current) {
      fillRef.current.intensity = lerp(fillRef.current.intensity, 0.45 + Math.sin(t * 0.26) * 0.12, 0.03)
    }
    if (rimRef.current) {
      rimRef.current.intensity = lerp(rimRef.current.intensity, 0.30 + Math.sin(t * 0.19) * 0.08, 0.025)
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y = -t * 0.018
      pointsRef.current.rotation.x =  t * 0.010
      const mat = pointsRef.current.material as THREE.PointsMaterial
      mat.opacity = lerp(mat.opacity, 0.38 + breath * 0.9, 0.02)
    }
    if (points2Ref.current) {
      points2Ref.current.rotation.y = t * 0.008
      points2Ref.current.rotation.z = -t * 0.005
      const mat = points2Ref.current.material as THREE.PointsMaterial
      mat.opacity = lerp(mat.opacity, 0.12 + Math.sin(t * 0.15) * 0.04, 0.018)
    }

    if (band1Ref.current) {
      band1Ref.current.rotation.y = t * 0.055
      const mat = band1Ref.current.material as THREE.MeshStandardMaterial
      mat.opacity = lerp(mat.opacity, 0.35 + breath * 1.4, 0.022)
    }
    if (band2Ref.current) {
      band2Ref.current.rotation.y = -t * 0.038
      band2Ref.current.rotation.x = Math.PI / 3
      const mat = band2Ref.current.material as THREE.MeshStandardMaterial
      mat.opacity = lerp(mat.opacity, 0.18 + Math.sin(t * 0.18) * 0.05, 0.022)
    }
  })

  return (
    <group>
      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[coreSize, 64, 64]} />
        <meshPhysicalMaterial
          color="#C09840"
          emissive="#A07820"
          emissiveIntensity={0.70}
          roughness={0.12}
          metalness={0.80}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          reflectivity={0.9}
          iridescence={0.3}
          iridescenceIOR={1.5}
        />
      </mesh>

      {/* Equatorial band 1 */}
      <mesh ref={band1Ref}>
        <torusGeometry args={[coreSize * 1.18, coreSize * 0.035, 8, 96]} />
        <meshStandardMaterial color="#C8A45A" emissive="#C8A45A" emissiveIntensity={0.55} transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Equatorial band 2 — tilted */}
      <mesh ref={band2Ref}>
        <torusGeometry args={[coreSize * 1.32, coreSize * 0.020, 6, 96]} />
        <meshStandardMaterial color="#E0C060" emissive="#E0C060" emissiveIntensity={0.35} transparent opacity={0.18} depthWrite={false} />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[coreSize * 1.7, 16, 16]} />
        <meshBasicMaterial
          color="#C8A45A"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Mid corona */}
      <mesh ref={glow2Ref}>
        <sphereGeometry args={[coreSize * 2.8, 12, 12]} />
        <meshBasicMaterial
          color="#906030"
          transparent
          opacity={0.028}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer corona — very faint */}
      <mesh ref={glow3Ref}>
        <sphereGeometry args={[coreSize * 5.0, 10, 10]} />
        <meshBasicMaterial
          color="#502010"
          transparent
          opacity={0.012}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Lights */}
      <pointLight ref={lightRef} color="#C8A040" intensity={2.2} distance={28} decay={1.8} />
      <pointLight ref={fillRef}  color="#E06030" intensity={0.45} distance={10} decay={2.2} />
      <pointLight ref={rimRef}   color="#6040C0" intensity={0.30} distance={14} decay={2.0} />

      {/* Inner particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
          <bufferAttribute attach="attributes-size"     args={[sizes,     1]} />
        </bufferGeometry>
        <pointsMaterial
          color="#D0A848"
          size={0.032}
          transparent
          opacity={0.38}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Outer dust halo */}
      <points ref={points2Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles2, 3]} />
          <bufferAttribute attach="attributes-size"     args={[sizes2,     1]} />
        </bufferGeometry>
        <pointsMaterial
          color="#806028"
          size={0.055}
          transparent
          opacity={0.12}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

// ── Node Mesh ─────────────────────────────────────────────────────────────────

// NodeMesh is fully self-contained — hover state is local, writes to shared ref
// This prevents cascading React re-renders across all nodes on every hover change
function NodeMesh({
  item, angle, radius, onClick, birthOffset, hoveredIdRef,
}: {
  item:         MonumentItem
  angle:        number
  radius:       number
  onClick:      (item: MonumentItem) => void
  birthOffset:  number
  hoveredIdRef: React.MutableRefObject<string | null>
}) {
  const meshRef       = useRef<THREE.Mesh>(null!)
  const innerRef      = useRef<THREE.Mesh>(null!)
  const matRef        = useRef<THREE.MeshPhysicalMaterial>(null!)
  const innerMatRef   = useRef<THREE.MeshBasicMaterial>(null!)
  const groupRef      = useRef<THREE.Group>(null!)
  const lightIntRef   = useRef(0)           // track light intensity without re-render
  const scaleRef      = useRef(0)
  const birthRef      = useRef<number | null>(null)
  const isHoveredRef  = useRef(false)       // local hover — no state, no re-render

  // tooltip is the only thing that needs React state
  const [showTooltip, setShowTooltip] = useState(false)

  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  const baseSize  = Math.max(0.07, Math.min(0.26, 0.07 + item.relationsCount * 0.022))
  const nodeColor = getNodeColor(item)
  const floatSeed = angle * 7.3 + radius * 0.4

  const handleEnter = useCallback((e: THREE.Event) => {
    (e as any).stopPropagation()
    isHoveredRef.current  = true
    hoveredIdRef.current  = item.id
    setShowTooltip(true)
  }, [item.id, hoveredIdRef])

  const handleLeave = useCallback((e: THREE.Event) => {
    (e as any).stopPropagation()
    isHoveredRef.current = false
    if (hoveredIdRef.current === item.id) hoveredIdRef.current = null
    setShowTooltip(false)
  }, [item.id, hoveredIdRef])

  useFrame(({ clock }) => {
    const t       = clock.getElapsedTime()
    const hovered = isHoveredRef.current

    if (birthRef.current === null) {
      if (t >= birthOffset) birthRef.current = t
    }
    const age       = birthRef.current !== null ? t - birthRef.current : 0
    const bornScale = easeOutQuint(age / 1.4)

    const targetScale = hovered ? 1.6 : 1.0
    scaleRef.current  = lerp(scaleRef.current, targetScale * bornScale, 0.028)
    if (meshRef.current) meshRef.current.scale.setScalar(scaleRef.current)

    const floatY =
      Math.sin(t * 0.22 + floatSeed) * 0.10 +
      Math.sin(t * 0.51 + floatSeed * 1.4) * 0.04
    if (groupRef.current) {
      groupRef.current.position.y = lerp(groupRef.current.position.y, floatY, 0.022)
    }

    if (matRef.current) {
      const targetEm = hovered ? 1.8 : 0.20 + Math.sin(t * 0.28 + floatSeed) * 0.06
      matRef.current.emissiveIntensity = lerp(matRef.current.emissiveIntensity, targetEm, 0.022)
      matRef.current.opacity           = lerp(matRef.current.opacity ?? 0, bornScale, 0.04)
    }
    if (innerMatRef.current) {
      const targetInnerOp = hovered ? bornScale * 0.6 : bornScale * 0.15
      innerMatRef.current.opacity = lerp(innerMatRef.current.opacity, targetInnerOp, 0.028)
    }
  })

  return (
    <group position={[x, 0, z]}>
      <group ref={groupRef}>
        {/* Inner glow */}
        <mesh ref={innerRef}>
          <sphereGeometry args={[baseSize * 0.55, 8, 8]} />
          <meshBasicMaterial
            ref={innerMatRef}
            color={nodeColor}
            transparent
            opacity={0.15}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Main sphere */}
        <mesh
          ref={meshRef}
          onPointerEnter={handleEnter}
          onPointerLeave={handleLeave}
          onClick={(e) => { (e as any).stopPropagation(); onClick(item) }}
        >
          <sphereGeometry args={[baseSize, 18, 18]} />
          <meshPhysicalMaterial
            ref={matRef}
            color={nodeColor}
            emissive={nodeColor}
            emissiveIntensity={0.20}
            roughness={0.25}
            metalness={0.55}
            clearcoat={0.8}
            clearcoatRoughness={0.15}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>

        {showTooltip && (
          <Html distanceFactor={8} style={{ pointerEvents: "none" }}>
            <div
              style={{
                background:    "rgba(8,8,12,0.92)",
                border:        "1px solid rgba(200,164,90,0.35)",
                padding:       "6px 12px",
                fontFamily:    "IBM Plex Mono, monospace",
                fontSize:      "10px",
                color:         "#DDD8CC",
                whiteSpace:    "nowrap",
                transform:     "translateX(-50%)",
                letterSpacing: "0.04em",
                boxShadow:     "0 4px 24px rgba(0,0,0,0.6)",
              }}
            >
              {item.title}
              <br />
              <span style={{ color: "#706858", fontSize: "8px", letterSpacing: "0.08em" }}>
                {item.type} · {item.area}
              </span>
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}

// ── Orbital Ring ──────────────────────────────────────────────────────────────

function OrbitalRing({
  areaIndex, radius, color, speed, tilt, items, phase,
  onItemClick, hoveredIdRef,
}: {
  areaIndex:    number
  radius:       number
  color:        string
  speed:        number
  tilt:         number
  items:        MonumentItem[]
  phase:        1 | 2 | 3
  onItemClick:  (item: MonumentItem) => void
  hoveredIdRef: React.MutableRefObject<string | null>
}) {
  const groupRef   = useRef<THREE.Group>(null!)
  const ringMatRef = useRef<THREE.LineBasicMaterial>(null!)
  const consMatRef = useRef<THREE.LineBasicMaterial>(null!)
  const tiltRad    = (tilt * Math.PI) / 180

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = t * speed
    }
    if (ringMatRef.current) {
      const target = 0.12 + Math.sin(t * 0.14 + areaIndex * 0.9) * 0.05
      ringMatRef.current.opacity = lerp(ringMatRef.current.opacity, target, 0.018)
    }
    if (consMatRef.current) {
      const target = 0.05 + Math.sin(t * 0.18 + areaIndex * 1.1) * 0.025
      consMatRef.current.opacity = lerp(consMatRef.current.opacity, target, 0.018)
    }
  })

  const ringGeom = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 180; i++) {
      const a = (i / 180) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [radius])

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
        <line>
          <primitive object={ringGeom} attach="geometry" />
          <lineBasicMaterial ref={ringMatRef} color={color} transparent opacity={0.12} />
        </line>

        {constellationGeom && (
          <lineSegments>
            <primitive object={constellationGeom} attach="geometry" />
            <lineBasicMaterial ref={consMatRef} color={color} transparent opacity={0.05} />
          </lineSegments>
        )}

        {items.map((item, i) => (
          <NodeMesh
            key={item.id}
            item={item}
            angle={(i / Math.max(items.length, 1)) * Math.PI * 2}
            radius={radius}
            onClick={onItemClick}
            birthOffset={areaIndex * 0.22 + i * 0.055}
            hoveredIdRef={hoveredIdRef}
          />
        ))}
      </group>
    </group>
  )
}

// ── Connection Lines ───────────────────────────────────────────────────────────

function ConnectionLines({
  items, relations, hoveredIdRef, phase,
}: {
  items:        MonumentItem[]
  relations:    MonumentRelation[]
  hoveredIdRef: React.MutableRefObject<string | null>
  phase:        1 | 2 | 3
}) {
  const dimRef        = useRef<THREE.LineSegments>(null!)
  const activeRef     = useRef<THREE.LineSegments>(null!)
  const opDimRef      = useRef(0.05)
  const opActRef      = useRef(0.0)
  const prevHoveredId = useRef<string | null>(null)

  const idToPos = useMemo(() => {
    const m = new Map<string, THREE.Vector3>()
    AREAS.forEach((area, areaIndex) => {
      const areaItems = items.filter((it) => it.area === area.key)
      const radius    = getRingRadius(areaIndex, phase)
      const tiltRad   = (area.tilt * Math.PI) / 180
      areaItems.forEach((item, i) => {
        const angle = (i / Math.max(areaItems.length, 1)) * Math.PI * 2
        const lx    = Math.cos(angle) * radius
        const lz    = Math.sin(angle) * radius
        const q     = new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltRad, areaIndex * 0.8, 0))
        m.set(item.id, new THREE.Vector3(lx, 0, lz).applyQuaternion(q))
      })
    })
    return m
  }, [items, phase])

  const { dimGeom, allActiveGeom } = useMemo(() => {
    const dimPts: number[] = []
    const activeMap = new Map<string, number[]>()

    relations.forEach(({ fromId, toId }) => {
      const a = idToPos.get(fromId)
      const b = idToPos.get(toId)
      if (!a || !b) return
      dimPts.push(a.x, a.y, a.z, b.x, b.y, b.z)
      for (const id of [fromId, toId]) {
        if (!activeMap.has(id)) activeMap.set(id, [])
        activeMap.get(id)!.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }
    })

    const makeBuf = (arr: number[]) => {
      const g = new THREE.BufferGeometry()
      g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3))
      return g
    }

    return { dimGeom: makeBuf(dimPts), allActiveGeom: activeMap }
  }, [idToPos, relations])

  // Geometry is swapped imperatively in useFrame — no React re-render on hover
  const emptyGeom = useMemo(() => new THREE.BufferGeometry(), [])

  useFrame(({ clock }) => {
    const t         = clock.getElapsedTime()
    const currentId = hoveredIdRef.current
    const hasHover  = currentId !== null

    // Swap active geometry only when hovered node actually changes
    if (currentId !== prevHoveredId.current && activeRef.current) {
      const pts = currentId ? (allActiveGeom.get(currentId) ?? []) : []
      const g   = new THREE.BufferGeometry()
      g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3))
      activeRef.current.geometry.dispose()
      activeRef.current.geometry = g
      prevHoveredId.current = currentId
    }

    const ambientPulse = 0.038 + Math.sin(t * 0.12) * 0.012
    opActRef.current = lerp(opActRef.current, hasHover ? 0.48 : 0.0,  0.028)
    opDimRef.current = lerp(opDimRef.current, hasHover ? 0.022 : ambientPulse, 0.022)

    if (dimRef.current)    (dimRef.current.material    as THREE.LineBasicMaterial).opacity = opDimRef.current
    if (activeRef.current) (activeRef.current.material as THREE.LineBasicMaterial).opacity = opActRef.current
  })

  return (
    <group>
      <lineSegments ref={dimRef} geometry={dimGeom}>
        <lineBasicMaterial color="#C8A45A" transparent opacity={0.038} depthWrite={false} />
      </lineSegments>
      <lineSegments ref={activeRef} geometry={emptyGeom}>
        <lineBasicMaterial color="#E8D090" transparent opacity={0.0} depthWrite={false} />
      </lineSegments>
    </group>
  )
}

// ── Camera fly-in ─────────────────────────────────────────────────────────────

function CameraController() {
  const { camera } = useThree()

  useEffect(() => {
    let cleanup: (() => void) | undefined

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)

      camera.position.set(6, 22, 68)
      camera.lookAt(0, 0, 0)

      const flyIn = gsap.to(camera.position, {
        x: 0, y: 6, z: 24,
        duration: 5.5,
        ease: "power1.inOut",   // very gradual — no sudden movement
        onComplete: () => {
          const pullBack = gsap.to(camera.position, {
            z: 36,
            ease: "none",
            scrollTrigger: {
              trigger: document.body,
              start:   "top top",
              end:     "35% top",
              scrub:   5.0,      // very slow scroll scrub
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

// ── Architecture Shell ────────────────────────────────────────────────────────

function ArchitectureShell() {
  const groupRef  = useRef<THREE.Group>(null!)
  const matRef    = useRef<THREE.MeshBasicMaterial>(null!)
  const ring1Ref  = useRef<THREE.Mesh>(null!)
  const ring2Ref  = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current)  groupRef.current.rotation.y  = t * 0.007
    if (ring1Ref.current)  ring1Ref.current.rotation.z  = t * 0.015
    if (ring2Ref.current)  ring2Ref.current.rotation.x  = t * 0.010

    if (matRef.current) {
      matRef.current.opacity = lerp(
        matRef.current.opacity,
        0.06 + Math.sin(t * 0.14) * 0.025,
        0.018,
      )
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <dodecahedronGeometry args={[14, 0]} />
        <meshBasicMaterial ref={matRef} color="#1A1A2A" wireframe transparent opacity={0.06} />
      </mesh>

      {/* Slow-moving equatorial rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[12, 0.015, 4, 120]} />
        <meshBasicMaterial color="#C8A45A" transparent opacity={0.08} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, Math.PI / 5, 0]}>
        <torusGeometry args={[10.5, 0.010, 4, 100]} />
        <meshBasicMaterial color="#6040A0" transparent opacity={0.06} />
      </mesh>

      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 11, 0, Math.sin(angle) * 11]}>
            <cylinderGeometry args={[0.025, 0.025, 18, 5]} />
            <meshStandardMaterial color="#C8A45A" emissive="#C8A45A" emissiveIntensity={0.12} transparent opacity={0.5} />
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
  // Ref instead of state — hover changes never trigger React re-renders
  const hoveredIdRef = useRef<string | null>(null)
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
      <color attach="background" args={["#05050A"]} />
      <fog attach="fog" args={["#070710", 42, 105]} />

      {/* Ambient — very faint warm + cool fill */}
      <ambientLight intensity={0.04} color="#A090C0" />
      <directionalLight position={[12, 18, 8]} intensity={0.14} color="#C8B870" />
      <directionalLight position={[-8, -10, -6]} intensity={0.06} color="#304060" />

      {/* Stars — two layers: dense/faint + sparse/bright */}
      <Stars radius={120} depth={80} count={6000} factor={3.5} saturation={0.08} fade speed={0.12} />
      <Stars radius={50}  depth={30} count={800}  factor={6.0} saturation={0.20} fade speed={0.06} />

      {/* Atmospheric dust */}
      <Sparkles count={200} scale={55} size={0.8}  speed={0.06} opacity={0.12} color="#C8A45A" />
      <Sparkles count={80}  scale={30} size={2.0}  speed={0.03} opacity={0.08} color="#6040A0" />

      <Nebula />

      <SolarCore total={data.total} />

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
          hoveredIdRef={hoveredIdRef}
        />
      ))}

      {phase >= 2 && !isMobile && (
        <ConnectionLines
          items={data.items}
          relations={data.relations}
          hoveredIdRef={hoveredIdRef}
          phase={phase}
        />
      )}

      {phase === 3 && <ArchitectureShell />}

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={55}
        autoRotate
        autoRotateSpeed={0.18}
        enableDamping
        dampingFactor={0.03}
        zoomSpeed={0.22}
        rotateSpeed={0.55}
        makeDefault
      />

      <CameraController />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.25}
          luminanceSmoothing={0.95}
          intensity={1.5}
          mipmapBlur
          radius={0.7}
        />
        <Noise
          opacity={0.028}
          blendFunction={BlendFunction.ADD}
        />
        <Vignette
          offset={0.3}
          darkness={0.65}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  )
}
