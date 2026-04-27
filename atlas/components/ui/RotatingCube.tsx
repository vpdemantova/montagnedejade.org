"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import type { Mesh } from "three"

function Cube() {
  const mesh = useRef<Mesh>(null!)

  useFrame((_, delta) => {
    mesh.current.rotation.x += delta * 0.4
    mesh.current.rotation.y += delta * 0.7
  })

  return (
    <mesh ref={mesh}>
      {/* Quadrado fino — largura/altura iguais, espessura ~15% */}
      <boxGeometry args={[1.2, 1.2, 0.18]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.7} />
    </mesh>
  )
}

export function RotatingCube({ size = 36 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <directionalLight position={[-3, -2, -3]} intensity={0.3} color="#6060ff" />
        <Cube />
      </Canvas>
    </div>
  )
}
