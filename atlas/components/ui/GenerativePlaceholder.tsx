"use client"

import { useMemo } from "react"

// ── FNV-1a 32-bit — hash determinístico, boa distribuição ─────────────────────
function fnv32(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0
  }
  return h
}

// ── xorshift32 PRNG — rápido, boa qualidade ───────────────────────────────────
function mkRng(seed: number) {
  let s = (seed || 1) >>> 0
  return (): number => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

// ── Gera todos os parâmetros a partir do nome ─────────────────────────────────
function buildArt(name: string) {
  const seed = fnv32(name || " ")
  const rng  = mkRng(seed)
  const id   = `gp${seed.toString(36)}`

  // Paleta de cores derivada do hash
  const H1 = seed % 360
  const H2 = (H1 + 45  + Math.round(rng() * 70))  % 360
  const H3 = (H1 + 200 + Math.round(rng() * 50))  % 360
  const S  = 12 + rng() * 26          // saturação 12–38%
  const L1 = 5  + rng() * 10          // escuro  5–15%
  const L2 = 18 + rng() * 14          // médio  18–32%

  // Direção do gradiente base
  const gx1 = rng(), gy1 = rng(), gx2 = rng(), gy2 = rng()

  // Camada de ruído A — estrutural (baixa frequência)
  const nA = {
    seed: (Math.floor(rng() * 998) + 1),
    fx:   +(0.007 + rng() * 0.014).toFixed(4),
    fy:   +(0.007 + rng() * 0.014).toFixed(4),
    oct:  4 + Math.floor(rng() * 5),    // 4–8 oitavas
  }

  // Camada de ruído B — textura fina (alta frequência)
  const nB = {
    seed: (Math.floor(rng() * 998) + 1),
    fx:   +(0.055 + rng() * 0.065).toFixed(4),
    fy:   +(0.055 + rng() * 0.065).toFixed(4),
    oct:  3 + Math.floor(rng() * 3),    // 3–5 oitavas
  }

  // Camada de ruído C — detalhes médios (turbulência)
  const nC = {
    seed: (Math.floor(rng() * 998) + 1),
    fx:   +(0.022 + rng() * 0.028).toFixed(4),
    fy:   +(0.022 + rng() * 0.028).toFixed(4),
    oct:  5 + Math.floor(rng() * 3),    // 5–7 oitavas
  }

  // Blobs orgânicos para profundidade
  const blobs = Array.from({ length: 4 + Math.floor(rng() * 5) }, () => ({
    cx:  +(rng() * 100).toFixed(1),
    cy:  +(rng() * 100).toFixed(1),
    rx:  +(14 + rng() * 48).toFixed(1),
    ry:  +(14 + rng() * 48).toFixed(1),
    h:   (H1 + Math.round(rng() * 140)) % 360,
    op:  +(0.04 + rng() * 0.13).toFixed(3),
  }))

  return { id, H1, H2, H3, S, L1, L2, gx1, gy1, gx2, gy2, nA, nB, nC, blobs }
}

// ── Componente ────────────────────────────────────────────────────────────────

export function GenerativePlaceholder({
  name,
  className,
  style,
}: {
  name:       string
  className?: string
  style?:     React.CSSProperties
}) {
  const art = useMemo(() => buildArt(name), [name])
  const { id, H1, H2, H3, S, L1, L2, gx1, gy1, gx2, gy2, nA, nB, nC, blobs } = art

  const hsl = (h: number, s = S, l = L2) => `hsl(${h},${s | 0}%,${l | 0}%)`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      style={{ display: "block", ...style }}
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Gradiente base */}
        <linearGradient
          id={`${id}-bg`}
          x1={`${(gx1 * 100).toFixed(1)}%`} y1={`${(gy1 * 100).toFixed(1)}%`}
          x2={`${(gx2 * 100).toFixed(1)}%`} y2={`${(gy2 * 100).toFixed(1)}%`}
        >
          <stop offset="0%"   stopColor={hsl(H1, S,       L1)} />
          <stop offset="50%"  stopColor={hsl(H2, S * .75, L2)} />
          <stop offset="100%" stopColor={hsl(H3, S * .9,  L1 * .8)} />
        </linearGradient>

        {/* Vinheta */}
        <radialGradient id={`${id}-vig`} cx="50%" cy="50%" r="70%">
          <stop offset="40%"  stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.52" />
        </radialGradient>

        {/* Ruído A — estrutural (fractalNoise, baixa frequência) */}
        <filter id={`${id}-nA`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={`${nA.fx} ${nA.fy}`}
            numOctaves={nA.oct}
            seed={nA.seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.55" />
          </feComponentTransfer>
        </filter>

        {/* Ruído B — grão fino (fractalNoise, alta frequência) */}
        <filter id={`${id}-nB`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={`${nB.fx} ${nB.fy}`}
            numOctaves={nB.oct}
            seed={nB.seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.28" />
          </feComponentTransfer>
        </filter>

        {/* Ruído C — detalhes médios (turbulência) */}
        <filter id={`${id}-nC`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="turbulence"
            baseFrequency={`${nC.fx} ${nC.fy}`}
            numOctaves={nC.oct}
            seed={nC.seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2" />
          </feComponentTransfer>
        </filter>
      </defs>

      {/* 1 — Gradiente base */}
      <rect width="100%" height="100%" fill={`url(#${id}-bg)`} />

      {/* 2 — Blobs orgânicos para profundidade */}
      {blobs.map((b, i) => (
        <ellipse
          key={i}
          cx={`${b.cx}%`} cy={`${b.cy}%`}
          rx={`${b.rx}%`} ry={`${b.ry}%`}
          fill={hsl(b.h, S * 1.4, L2 * 1.85)}
          opacity={b.op}
        />
      ))}

      {/* 3 — Ruído estrutural (overlay) */}
      <rect
        width="100%" height="100%"
        filter={`url(#${id}-nA)`}
        style={{ mixBlendMode: "overlay" }}
      />

      {/* 4 — Detalhes médios (soft-light) */}
      <rect
        width="100%" height="100%"
        filter={`url(#${id}-nC)`}
        style={{ mixBlendMode: "soft-light" }}
      />

      {/* 5 — Grão fino (screen, baixa opacidade) */}
      <rect
        width="100%" height="100%"
        filter={`url(#${id}-nB)`}
        opacity="0.35"
        style={{ mixBlendMode: "screen" }}
      />

      {/* 6 — Vinheta final */}
      <rect width="100%" height="100%" fill={`url(#${id}-vig)`} />
    </svg>
  )
}
