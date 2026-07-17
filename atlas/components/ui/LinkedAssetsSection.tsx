import type { Asset } from "@/atlas/types"

type LinkedAsset = Asset & { linkId: string; role: string }

export function LinkedAssetsSection({ assets }: { assets: LinkedAsset[] }) {
  if (assets.length === 0) return null

  return (
    <div className="px-6 py-4 border-t border-solar-border/30">
      <p className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/50 mb-3">
        Arquivos anexados · {assets.length}
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {assets.map((asset) => (
          <a
            key={asset.linkId}
            href={asset.path}
            target="_blank"
            rel="noreferrer"
            className="group aspect-square border border-solar-border/25 rounded-[4px] bg-solar-void/40 overflow-hidden flex items-center justify-center hover:border-solar-border/50 transition-colors"
            title={asset.originalName}
          >
            {asset.kind === "IMAGE" ? (
              <img src={asset.path} alt={asset.originalName} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <span className="font-mono text-[8px] uppercase text-solar-muted/45 px-1 text-center">{asset.kind}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
