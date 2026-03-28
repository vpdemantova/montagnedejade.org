"use client"

import { Suspense, useRef, useMemo, useEffect, Component, type ReactNode } from "react"
import { useFrame, useThree, useLoader } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"

// ── Constants ─────────────────────────────────────────────────────────────────

const H      = 13.0   // outer half-size
const HT     = 5.8    // outer wall height
const W      = 0.55   // wall thickness
const I      = 8.0    // inner half-size
const IH     = 4.4    // inner wall height
const DW     = 2.8    // doorway width
const GATE_W = 3.2    // outer arch gate width
const GATE_H = 3.6    // outer arch gate spring height (crown = GATE_H + GATE_W/2 = 5.2 < HT)

// ── Camera presets ────────────────────────────────────────────────────────────

export type PresetKey =
  | "livre" | "fachada" | "topo" | "interior"
  | "jardim" | "galeria" | "campo" | "lateral" | "angular"

export const CAMERA_PRESETS: Record<PresetKey, {
  pos: [number,number,number]
  target: [number,number,number]
  label: string
}> = {
  livre:    { pos: [20, 12, 22],    target: [0, 2, 0],      label: "Livre"     },
  fachada:  { pos: [0,  6, 30],     target: [0, 3, 0],      label: "Fachada"   },
  topo:     { pos: [0,  46, 0.5],   target: [0, 0, 0],      label: "De Cima"   },
  interior: { pos: [0,  4, 1],      target: [0, 2, -4],     label: "Interior"  },
  jardim:   { pos: [1.5, 1.6, 4],   target: [0, 1.2, 0],    label: "Jardim"    },
  galeria:  { pos: [-4, 2.5, -5],   target: [-9, 2.5, -5],  label: "Galeria"   },
  campo:    { pos: [0,  14, 82],    target: [0, 5, 0],      label: "Campo"     },
  lateral:  { pos: [32, 7, 0],      target: [0, 3, 0],      label: "Lateral"   },
  angular:  { pos: [-18, 20, 22],   target: [0, 2, 0],      label: "Ângulo"    },
}

// ── Shared materials (module-level singletons — zero GC pressure) ─────────────

// ── Day/night sky materials ───────────────────────────────────────────────────

const M_SKY_NIGHT = new THREE.MeshBasicMaterial({ color: "#07090e", side: THREE.BackSide })
const M_SKY_DAY   = new THREE.MeshBasicMaterial({ color: "#6ab4e8", side: THREE.BackSide })

const M = {
  stoneBase:   new THREE.MeshStandardMaterial({ color: "#6a6050", roughness: 0.95, metalness: 0.0 }),
  stoneLight:  new THREE.MeshStandardMaterial({ color: "#8a7e6e", roughness: 0.90, metalness: 0.0 }),
  marble:      new THREE.MeshStandardMaterial({ color: "#c8c0b0", roughness: 0.28, metalness: 0.0 }),
  wood:        new THREE.MeshStandardMaterial({ color: "#4a2e14", roughness: 0.96, metalness: 0.0 }),
  woodLight:   new THREE.MeshStandardMaterial({ color: "#5a3a1e", roughness: 0.88, metalness: 0.02 }),
  leaf:        new THREE.MeshStandardMaterial({ color: "#2a5518", roughness: 0.95, metalness: 0.0 }),
  leafDark:    new THREE.MeshStandardMaterial({ color: "#1c3c10", roughness: 0.98, metalness: 0.0 }),
  grass:       new THREE.MeshStandardMaterial({ color: "#162808", roughness: 1.0,  metalness: 0.0 }),
  floorStone:  new THREE.MeshStandardMaterial({ color: "#5a5040", roughness: 0.90, metalness: 0.0 }),
  water:       new THREE.MeshStandardMaterial({ color: "#4080b0", roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.72 }),
  gold:        new THREE.MeshStandardMaterial({ color: "#C8A45A", roughness: 0.25, metalness: 0.80 }),
  frame:       new THREE.MeshStandardMaterial({ color: "#2e2418", roughness: 0.82, metalness: 0.08 }),
  window:      new THREE.MeshStandardMaterial({ color: "#FFD890", emissive: "#FFD890", emissiveIntensity: 0.4, transparent: true, opacity: 0.55 }),
  hedge:       new THREE.MeshStandardMaterial({ color: "#1e4a10", roughness: 0.97, metalness: 0.0 }),
}

// ── Camera rig ────────────────────────────────────────────────────────────────

function CameraRig({ preset }: { preset: PresetKey }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const toPos    = useRef(new THREE.Vector3(...CAMERA_PRESETS[preset].pos))
  const toLook   = useRef(new THREE.Vector3(...CAMERA_PRESETS[preset].target))
  const animating = useRef(false)

  useEffect(() => {
    const p = CAMERA_PRESETS[preset]
    toPos.current.set(...p.pos)
    toLook.current.set(...p.target)
    animating.current = true
  }, [preset])

  useFrame(() => {
    if (!animating.current) return
    camera.position.lerp(toPos.current, 0.06)
    if (controlsRef.current) {
      controlsRef.current.target.lerp(toLook.current, 0.06)
      controlsRef.current.update()
    }
    if (camera.position.distanceTo(toPos.current) < 0.08) animating.current = false
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.055}
      autoRotate={preset === "livre"}
      autoRotateSpeed={0.3}
      maxPolarAngle={Math.PI / 1.9}
      minDistance={4}
      maxDistance={100}
    />
  )
}

// ── Arch frame (reusable) ─────────────────────────────────────────────────────

function ArchFrame({ width, height, wallDepth }: { width: number; height: number; wallDepth: number }) {
  const r    = width / 2
  const pilW = 0.26
  const pilD = wallDepth + 0.18

  return (
    <group>
      {/* Left pilaster */}
      <mesh position={[-(r + pilW / 2), height / 2, 0]} material={M.marble} castShadow>
        <boxGeometry args={[pilW, height, pilD]} />
      </mesh>
      {/* Left capital */}
      <mesh position={[-(r + pilW / 2), height + 0.07, 0]} material={M.marble} castShadow>
        <boxGeometry args={[pilW + 0.12, 0.14, pilD + 0.08]} />
      </mesh>
      {/* Right pilaster */}
      <mesh position={[r + pilW / 2, height / 2, 0]} material={M.marble} castShadow>
        <boxGeometry args={[pilW, height, pilD]} />
      </mesh>
      {/* Right capital */}
      <mesh position={[r + pilW / 2, height + 0.07, 0]} material={M.marble} castShadow>
        <boxGeometry args={[pilW + 0.12, 0.14, pilD + 0.08]} />
      </mesh>
      {/* Half-torus arch — spans from (-r, height) to (+r, height) via (0, height+r) */}
      <mesh position={[0, height, 0]} material={M.marble} castShadow>
        <torusGeometry args={[r, 0.13, 8, 32, Math.PI]} />
      </mesh>
      {/* Keystone at crown */}
      <mesh position={[0, height + r - 0.05, 0]} material={M.gold} castShadow>
        <boxGeometry args={[0.26, 0.24, pilD]} />
      </mesh>
    </group>
  )
}

// ── Ground ────────────────────────────────────────────────────────────────────

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow material={M.grass}>
        <planeGeometry args={[300, 300]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow material={M.floorStone}>
        <planeGeometry args={[H * 2, H * 2]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow material={M.marble}>
        <planeGeometry args={[I * 2 - 0.5, I * 2 - 0.5]} />
      </mesh>
    </>
  )
}

// ── Outer walls (arched gates at center of each wall) ─────────────────────────

function OuterWalls() {
  const segW = H - GATE_W / 2                  // 11.4 — each side segment width
  const segX = (H + GATE_W / 2) / 2            // 7.3  — distance from wall center to segment center
  const archCrown = GATE_H + GATE_W / 2        // 5.2  — world y of arch crown
  const fillH = HT - archCrown                  // 0.6  — fill strip above arch
  const fillY = archCrown + fillH / 2           // 5.5  — world y center of fill
  const fillLocalY = fillY - HT / 2             // 2.6  — local y in group (group.y = HT/2)

  // [x, localY, z, ry]
  const sides: [number, number, number, number][] = [
    [0,  HT / 2, -H, 0],
    [0,  HT / 2,  H, 0],
    [ H, HT / 2,  0, Math.PI / 2],
    [-H, HT / 2,  0, Math.PI / 2],
  ]

  return (
    <>
      {sides.map(([x, y, z, ry], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, ry, 0]}>
          {/* Left wall segment */}
          <mesh position={[-segX, 0, 0]} material={M.stoneBase} receiveShadow castShadow>
            <boxGeometry args={[segW, HT, W]} />
          </mesh>
          {/* Right wall segment */}
          <mesh position={[segX, 0, 0]} material={M.stoneBase} receiveShadow castShadow>
            <boxGeometry args={[segW, HT, W]} />
          </mesh>
          {/* Fill above arch crown */}
          <mesh position={[0, fillLocalY, 0]} material={M.stoneBase} castShadow>
            <boxGeometry args={[GATE_W + 0.56, fillH, W * 1.06]} />
          </mesh>
          {/* Full parapet strip */}
          <mesh position={[0, HT / 2 + 0.2, 0]} material={M.stoneBase} castShadow>
            <boxGeometry args={[H * 2 + 0.2, 0.4, W + 0.25]} />
          </mesh>
          {/* Window glow panels — on side segments */}
          {([-segX + segW * 0.35, segX - segW * 0.35] as number[]).map((wx, wi) => (
            <group key={wi} position={[wx, 0.3, W * 0.5 + 0.01]}>
              <mesh material={M.window}>
                <planeGeometry args={[1.5, 2.0]} />
              </mesh>
            </group>
          ))}
          {/* Arch frame on outer face */}
          <group position={[0, -HT / 2, W * 0.56]}>
            <ArchFrame width={GATE_W} height={GATE_H} wallDepth={W} />
          </group>
          {/* Arch frame on inner face */}
          <group position={[0, -HT / 2, -W * 0.56]} rotation={[0, Math.PI, 0]}>
            <ArchFrame width={GATE_W} height={GATE_H} wallDepth={W} />
          </group>
        </group>
      ))}

      {/* Corner towers */}
      {([[H,-H],[H,H],[-H,-H],[-H,H]] as [number,number][]).map(([tx,tz],i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, HT / 2, 0]} material={M.stoneBase} castShadow>
            <boxGeometry args={[1.5, HT + 0.6, 1.5]} />
          </mesh>
          <mesh position={[0, HT + 0.9, 0]} castShadow>
            <coneGeometry args={[0.6, 1.4, 6]} />
            <primitive object={M.stoneBase} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Inner walls (arched doorways at center) ────────────────────────────────────

function InnerWalls() {
  const segLen = (I * 2 - DW) / 2
  const off    = segLen / 2 + DW / 2
  // Arch spring line = IH minus arch radius minus a little clearance
  const archR  = DW / 2                         // 1.4
  const archH  = IH - archR - 0.35              // 2.65 — spring line; crown = 2.65+1.4=4.05 ≤ IH=4.4

  const sides = [
    [0, 0, -I,  0] as [number,number,number,number],
    [0, 0,  I,  0] as [number,number,number,number],
    [-I, 0,  0, Math.PI/2] as [number,number,number,number],
    [ I, 0,  0, Math.PI/2] as [number,number,number,number],
  ]

  return (
    <>
      {sides.map(([x, y, z, ry], si) => (
        <group key={si} position={[x, y, z]} rotation={[0, ry, 0]}>
          <mesh position={[-off, IH/2, 0]} material={M.stoneLight} receiveShadow castShadow>
            <boxGeometry args={[segLen, IH, W * 0.8]} />
          </mesh>
          <mesh position={[off, IH/2, 0]} material={M.stoneLight} receiveShadow castShadow>
            <boxGeometry args={[segLen, IH, W * 0.8]} />
          </mesh>
          {/* Arch lintel */}
          <mesh position={[0, IH - 0.1, 0]} material={M.stoneLight} castShadow>
            <boxGeometry args={[DW + 0.5, 0.5, W * 0.8]} />
          </mesh>
          {/* Top cornice */}
          <mesh position={[0, IH + 0.15, 0]} material={M.stoneLight} castShadow>
            <boxGeometry args={[I * 2, 0.3, W + 0.15]} />
          </mesh>
          {/* Arch frame on front face */}
          <group position={[0, 0, W * 0.45]}>
            <ArchFrame width={DW} height={archH} wallDepth={W * 0.8} />
          </group>
          {/* Arch frame on back face */}
          <group position={[0, 0, -W * 0.45]} rotation={[0, Math.PI, 0]}>
            <ArchFrame width={DW} height={archH} wallDepth={W * 0.8} />
          </group>
        </group>
      ))}
    </>
  )
}

// ── Colonnade (8 columns, 2 per side) ─────────────────────────────────────────

function Colonnade() {
  const cols: [number,number][] = [
    [-4.5, -I+1.2], [4.5, -I+1.2],
    [-4.5,  I-1.2], [4.5,  I-1.2],
    [-I+1.2, -4.5], [-I+1.2, 4.5],
    [ I-1.2, -4.5], [ I-1.2, 4.5],
  ]
  return (
    <>
      {cols.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.2, 0]} material={M.marble} castShadow>
            <cylinderGeometry args={[0.22, 0.28, 0.4, 10]} />
          </mesh>
          <mesh position={[0, IH*0.5 + 0.4, 0]} material={M.marble} castShadow>
            <cylinderGeometry args={[0.15, 0.2, IH, 10]} />
          </mesh>
          <mesh position={[0, IH + 0.6, 0]} material={M.marble} castShadow>
            <boxGeometry args={[0.5, 0.4, 0.5]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Roof pergola ──────────────────────────────────────────────────────────────

function Roof() {
  const count = 5
  const beams: JSX.Element[] = []
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const z = -I + I * 2 * t
    const x = -I + I * 2 * t
    beams.push(
      <mesh key={`bz${i}`} position={[0, IH+0.55, z]} material={M.wood} castShadow>
        <boxGeometry args={[I*2, 0.2, 0.2]} />
      </mesh>,
      <mesh key={`bx${i}`} position={[x, IH+0.65, 0]} material={M.wood} castShadow>
        <boxGeometry args={[0.2, 0.2, I*2]} />
      </mesh>
    )
  }
  return <>{beams}</>
}

// ── Real paintings — local public/paintings/ assets ───────────────────────────

const PAINTINGS_DATA: { url: string; fallback: string }[] = [
  { url: "/paintings/starry-night.jpg",       fallback: "#1a3570" },
  { url: "/paintings/mona-lisa.jpg",           fallback: "#8a7040" },
  { url: "/paintings/birth-of-venus.jpg",      fallback: "#c09080" },
  { url: "/paintings/the-scream.jpg",          fallback: "#e05020" },
  { url: "/paintings/girl-pearl-earring.jpg",  fallback: "#2a4860" },
  { url: "/paintings/great-wave.jpg",          fallback: "#284080" },
  { url: "/paintings/water-lilies.jpg",        fallback: "#406880" },
  { url: "/paintings/night-watch.jpg",         fallback: "#503820" },
  { url: "/paintings/last-supper.jpg",         fallback: "#605040" },
  { url: "/paintings/sunflowers.jpg",          fallback: "#d09020" },
  { url: "/paintings/klimt-kiss.jpg",          fallback: "#c08020" },
  { url: "/paintings/las-meninas.jpg",         fallback: "#503028" },
  { url: "/paintings/school-of-athens.jpg",    fallback: "#7080a0" },
  { url: "/paintings/american-gothic.jpg",     fallback: "#607048" },
  { url: "/paintings/liberty-leading.jpg",     fallback: "#c06030" },
  { url: "/paintings/wanderer.jpg",            fallback: "#90a0b0" },
]

// Painting positions on the 4 inner wall faces (4 paintings per side, avoiding doorway zone)
const segLen = (I * 2 - DW) / 2    // 6.6
const off    = segLen / 2 + DW / 2  // 4.7
const PAINT_X = [
  -off - segLen * 0.25,  // -6.35
  -off + segLen * 0.25,  // -3.05
   off - segLen * 0.25,  //  3.05
   off + segLen * 0.25,  //  6.35
]
const PAINT_Y = IH * 0.48

const INNER_SIDES = [
  { ax: "z" as const, co: -I + 0.42, ry: 0 },
  { ax: "z" as const, co:  I - 0.42, ry: Math.PI },
  { ax: "x" as const, co: -I + 0.42, ry:  Math.PI / 2 },
  { ax: "x" as const, co:  I - 0.42, ry: -Math.PI / 2 },
]

// ── Error boundary for texture loading ────────────────────────────────────────

interface EBProps { children: ReactNode; fallback: ReactNode }
interface EBState { error: boolean }

class PaintingErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { error: false }
  static getDerivedStateFromError(): EBState { return { error: true } }
  render() {
    return this.state.error ? this.props.fallback : this.props.children
  }
}

// ── Single textured painting (suspends until texture ready) ───────────────────

function TexturedPainting({
  url, position, rotation,
}: {
  url: string
  position: [number,number,number]
  rotation: [number,number,number]
}) {
  const texture = useLoader(THREE.TextureLoader, url)
  return (
    <group position={position} rotation={rotation}>
      <mesh material={M.frame} castShadow>
        <boxGeometry args={[1.2, 1.55, 0.07]} />
      </mesh>
      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[0.95, 1.28, 0.02]} />
        <meshStandardMaterial map={texture} roughness={0.5} toneMapped={false} />
      </mesh>
    </group>
  )
}

// ── Fallback painting (solid color while loading / on error) ──────────────────

function FallbackPainting({
  fallbackColor, position, rotation,
}: {
  fallbackColor: string
  position: [number,number,number]
  rotation: [number,number,number]
}) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: fallbackColor, roughness: 0.55, emissive: fallbackColor, emissiveIntensity: 0.12 }),
    [fallbackColor]
  )
  return (
    <group position={position} rotation={rotation}>
      <mesh material={M.frame} castShadow>
        <boxGeometry args={[1.2, 1.55, 0.07]} />
      </mesh>
      <mesh position={[0, 0, 0.055]} material={mat}>
        <boxGeometry args={[0.95, 1.28, 0.02]} />
      </mesh>
    </group>
  )
}

// ── Gallery of real paintings distributed on inner walls ──────────────────────

function RealPaintings() {
  const items: JSX.Element[] = []
  let di = 0

  INNER_SIDES.forEach(({ ax, co, ry }) => {
    PAINT_X.forEach((px) => {
      const d   = PAINTINGS_DATA[di % PAINTINGS_DATA.length]!
      const x   = ax === "x" ? co : px
      const z   = ax === "z" ? co : px
      const pos: [number,number,number] = [x, PAINT_Y, z]
      const rot: [number,number,number] = [0, ry, 0]

      items.push(
        <PaintingErrorBoundary
          key={di}
          fallback={<FallbackPainting fallbackColor={d.fallback} position={pos} rotation={rot} />}
        >
          <Suspense fallback={<FallbackPainting fallbackColor={d.fallback} position={pos} rotation={rot} />}>
            <TexturedPainting url={d.url} position={pos} rotation={rot} />
          </Suspense>
        </PaintingErrorBoundary>
      )
      di++
    })
  })

  return <>{items}</>
}

// ── Sculptures ────────────────────────────────────────────────────────────────

function Sculptures() {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((_, dt) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      const sculpt = child.children[2]
      if (sculpt) sculpt.rotation.y += dt * (0.22 + i * 0.04)
    })
  })

  const positions: [number,number,number][] = [
    [-I+2.5, 0, -I+2.5], [I-2.5, 0, -I+2.5],
    [-I+2.5, 0,  I-2.5], [I-2.5, 0,  I-2.5],
    [0, 0, -H+2], [0, 0, H-2],
  ]

  return (
    <group ref={groupRef}>
      {positions.map(([x,,z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.15, 0]} material={M.stoneBase} castShadow>
            <cylinderGeometry args={[0.5, 0.6, 0.3, 10]} />
          </mesh>
          <mesh position={[0, 0.6, 0]} material={M.marble} castShadow>
            <boxGeometry args={[0.68, 0.5, 0.68]} />
          </mesh>
          <mesh position={[0, 1.22, 0]} material={i % 2 === 0 ? M.gold : M.marble} castShadow>
            {i === 0 && <torusKnotGeometry args={[0.3, 0.09, 80, 12, 2, 3]} />}
            {i === 1 && <sphereGeometry    args={[0.36, 16, 16]} />}
            {i === 2 && <coneGeometry      args={[0.28, 0.8, 6]} />}
            {i === 3 && <torusGeometry     args={[0.28, 0.1, 12, 32]} />}
            {i === 4 && <octahedronGeometry args={[0.38, 0]} />}
            {i === 5 && <dodecahedronGeometry args={[0.34, 0]} />}
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── Fountain ──────────────────────────────────────────────────────────────────

function Fountain() {
  const waterRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.68 + Math.sin(clock.getElapsedTime() * 1.8) * 0.07
    }
  })
  return (
    <group>
      <mesh position={[0, 0.22, 0]} material={M.stoneBase} receiveShadow castShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.44, 24]} />
      </mesh>
      <mesh ref={waterRef} position={[0, 0.45, 0]} material={M.water}>
        <cylinderGeometry args={[1.28, 1.28, 0.06, 24]} />
      </mesh>
      <mesh position={[0, 1.1, 0]} material={M.stoneBase} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 1.35, 8]} />
      </mesh>
      <mesh position={[0, 1.78, 0]} material={M.stoneBase} castShadow>
        <cylinderGeometry args={[0.45, 0.28, 0.18, 14]} />
      </mesh>
    </group>
  )
}

// ── Trees ─────────────────────────────────────────────────────────────────────

function Trees() {
  const treePos: [number,number,number,number][] = [
    [-2.8, 0, -2.8, 1.1], [2.8, 0, -2.8, 0.9],
    [-2.8, 0,  2.8, 1.0], [2.8, 0,  2.8, 1.2],
    [0, 0, -4.8, 1.35],   [0, 0,  4.8, 1.25],
    [-H-4, 0, -H-4, 2.2], [H+4, 0, -H-4, 1.9],
    [-H-4, 0,  H+4, 2.1], [H+4, 0,  H+4, 2.0],
    [0, 0, -H-8, 2.5],    [0, 0,  H+8, 2.4],
    [-H-8, 0, 0, 2.3],    [H+8, 0, 0, 2.2],
  ]
  return (
    <>
      {treePos.map(([x,,z,s], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, s*0.5, 0]} material={M.wood} castShadow>
            <cylinderGeometry args={[0.1, 0.15, s, 7]} />
          </mesh>
          <mesh position={[0, s*1.35, 0]} material={M.leaf} castShadow>
            <sphereGeometry args={[s*0.58, 8, 8]} />
          </mesh>
          <mesh position={[0, s*1.75, 0]} material={M.leafDark} castShadow>
            <sphereGeometry args={[s*0.38, 7, 7]} />
          </mesh>
          <mesh position={[0, s*2.05, 0]} material={M.leaf}>
            <sphereGeometry args={[s*0.22, 6, 6]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Flowers (instanced, 5 colors) ────────────────────────────────────────────

const FLOWER_DEFS: { color: string; count: number }[] = [
  { color: "#F0C830", count: 220 },
  { color: "#FFFFFF", count: 180 },
  { color: "#E8608A", count: 180 },
  { color: "#9060D0", count: 130 },
  { color: "#FF7020", count: 130 },
]

const FLOWER_GEOM = new THREE.SphereGeometry(1, 5, 5)

function buildFlowerMatrices(count: number, seed: number): Float32Array {
  const dummy = new THREE.Object3D()
  const mats  = new Float32Array(count * 16)
  let placed  = 0, att = 0
  let s = seed
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }

  while (placed < count && att < count * 20) {
    att++
    const angle = rand() * Math.PI * 2
    const dist  = H + 1.5 + rand() * 60
    const x = Math.cos(angle) * dist
    const z = Math.sin(angle) * dist
    const sc = 0.04 + rand() * 0.06
    dummy.position.set(x, sc * 0.5, z)
    dummy.scale.set(sc, sc * (0.8 + rand() * 0.5), sc)
    dummy.rotation.y = rand() * Math.PI * 2
    dummy.updateMatrix()
    dummy.matrix.toArray(mats, placed * 16)
    placed++
  }
  return mats
}

function FlowerMesh({ color, count, seed }: { color: string; count: number; seed: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const mat     = useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: 0.8, emissive: color, emissiveIntensity: 0.07 }),
    [color]
  )
  const matrices = useMemo(() => buildFlowerMatrices(count, seed), [count, seed])

  useEffect(() => {
    if (!meshRef.current) return
    const m4 = new THREE.Matrix4()
    for (let i = 0; i < count; i++) {
      m4.fromArray(matrices, i * 16)
      meshRef.current.setMatrixAt(i, m4)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [matrices, count])

  return <instancedMesh ref={meshRef} args={[FLOWER_GEOM, mat, count]} />
}

function Flowers() {
  return (
    <>
      {FLOWER_DEFS.map(({ color, count }, i) => (
        <FlowerMesh key={i} color={color} count={count} seed={i * 7919 + 1} />
      ))}
    </>
  )
}

// ── Hedges ────────────────────────────────────────────────────────────────────

function Hedges() {
  const segs: [number,number,number, number,number,number][] = [
    [0, 0.4, -I-1.5,  I*2-2, 0.8, 0.5],
    [0, 0.4,  I+1.5,  I*2-2, 0.8, 0.5],
    [-I-1.5, 0.4, 0,  0.5, 0.8, I*2-2],
    [ I+1.5, 0.4, 0,  0.5, 0.8, I*2-2],
  ]
  return (
    <>
      {segs.map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]} material={M.hedge} castShadow>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
    </>
  )
}

// ── Study tables ──────────────────────────────────────────────────────────────

function StudyTables() {
  const candle = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: "#FFD070", emissive: "#FF8020", emissiveIntensity: 1.3 }),
    []
  )
  const book = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: "#8a3020", roughness: 0.9 }),
    []
  )
  const positions: [number,number][] = [[-10,-10],[10,-10],[-10,10],[10,10]]
  return (
    <>
      {positions.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.46, 0]} material={M.woodLight} castShadow>
            <boxGeometry args={[1.8, 0.08, 0.9]} />
          </mesh>
          {([-0.8, 0.8] as number[]).flatMap((lx) =>
            ([-0.38, 0.38] as number[]).map((lz, li) => (
              <mesh key={`${lx}-${li}`} position={[lx, 0.22, lz]} material={M.wood}>
                <cylinderGeometry args={[0.03, 0.04, 0.44, 5]} />
              </mesh>
            ))
          )}
          {[-0.4, 0, 0.35].map((bx, bi) => (
            <mesh key={bi} position={[bx, 0.55, (bi-1)*0.08]} rotation={[0, bi*0.25, 0]} material={book} castShadow>
              <boxGeometry args={[0.18, 0.26, 0.05]} />
            </mesh>
          ))}
          <mesh position={[0.62, 0.52, 0]} material={M.marble}>
            <cylinderGeometry args={[0.03, 0.035, 0.16, 7]} />
          </mesh>
          <mesh position={[0.62, 0.63, 0]} material={candle}>
            <coneGeometry args={[0.025, 0.1, 5]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Sky dome ──────────────────────────────────────────────────────────────────

function Sky({ isDia }: { isDia: boolean }) {
  return (
    <>
      <mesh material={isDia ? M_SKY_DAY : M_SKY_NIGHT}>
        <sphereGeometry args={[200, 12, 12]} />
      </mesh>
      {!isDia && <Stars radius={120} depth={80} count={5000} factor={5} saturation={0.1} fade speed={0.2} />}
      {isDia && (
        // Sun disc
        <mesh position={[60, 80, -120]}>
          <sphereGeometry args={[8, 12, 12]} />
          <meshBasicMaterial color="#FFF5C0" />
        </mesh>
      )}
    </>
  )
}

// ── Main scene ────────────────────────────────────────────────────────────────

export function EscolaScene({
  paintingColors: _paintingColors,
  preset,
  isDia = false,
}: {
  paintingColors: string[]
  preset: PresetKey
  isDia?: boolean
}) {
  return (
    <>
      {isDia ? (
        /* ── Day lights ── */
        <>
          <ambientLight intensity={0.55} color="#FFF8E8" />
          <hemisphereLight args={["#87CEEB", "#3d6b20", 0.75]} />
          <directionalLight
            position={[28, 55, 18]}
            intensity={2.6}
            color="#FFFAE0"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={1}
            shadow-camera-far={120}
            shadow-camera-left={-40}
            shadow-camera-right={40}
            shadow-camera-top={40}
            shadow-camera-bottom={-40}
          />
          <directionalLight position={[-15, 20, -25]} intensity={0.35} color="#C8E0FF" />
          <pointLight position={[0, 0.6, 0]} color="#80C0FF" intensity={0.5} distance={6} decay={2.5} />
        </>
      ) : (
        /* ── Night lights ── */
        <>
          <ambientLight intensity={0.12} color="#8899BB" />
          <hemisphereLight args={["#1a2440", "#0a1208", 0.3]} />
          <directionalLight
            position={[18, 30, 14]}
            intensity={0.75}
            color="#C4CCE0"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={1}
            shadow-camera-far={100}
            shadow-camera-left={-35}
            shadow-camera-right={35}
            shadow-camera-top={35}
            shadow-camera-bottom={-35}
          />
          <directionalLight position={[-10, 12, -18]} intensity={0.22} color="#E8C070" />
          <pointLight position={[0, 0.6, 0]} color="#5090FF" intensity={1.2} distance={7} decay={2.5} />
          <pointLight position={[0, 3, 0]} color="#FFB850" intensity={0.5} distance={12} decay={2} />
        </>
      )}

      <Sky isDia={isDia} />
      <Ground />
      <OuterWalls />
      <InnerWalls />
      <Colonnade />
      <Roof />
      <RealPaintings />
      <Sculptures />
      <Fountain />
      <Trees />
      <Flowers />
      <Hedges />
      <StudyTables />

      <CameraRig preset={preset} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.38} luminanceSmoothing={0.82} intensity={1.3} mipmapBlur />
      </EffectComposer>
    </>
  )
}
