"use client"

import { useCallback, useState } from "react"

type Status = "idle" | "loading" | "done" | "error"

// ── Trigger browser download from a blob/Response ─────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement("a")
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePortability() {
  const [status,  setStatus]  = useState<Status>("idle")
  const [message, setMessage] = useState<string>("")

  const run = useCallback(async <T>(label: string, fn: () => Promise<T>): Promise<T | null> => {
    setStatus("loading")
    setMessage(label)
    try {
      const result = await fn()
      setStatus("done")
      setMessage("")
      setTimeout(() => setStatus("idle"), 3000)
      return result
    } catch (e) {
      setStatus("error")
      setMessage(e instanceof Error ? e.message : "Erro desconhecido")
      return null
    }
  }, [])

  // ── Export: item individual → .md ────────────────────────────────────────

  const exportItem = useCallback(async (id: string, title = "item") => {
    await run(`Exportando ${title}…`, async () => {
      const res = await fetch(`/api/portability/export/item/${id}`)
      if (!res.ok) throw new Error("Falha ao exportar item")
      const blob = await res.blob()
      downloadBlob(blob, `${id}.md`)
    })
  }, [run])

  // ── Export: área completa → .zip ─────────────────────────────────────────

  const exportArea = useCallback(async (area: string) => {
    await run(`Exportando área ${area}…`, async () => {
      const res = await fetch(`/api/portability/export/area/${area.toLowerCase()}`)
      if (!res.ok) throw new Error("Falha ao exportar área")
      const blob = await res.blob()
      downloadBlob(blob, `portal-solar-${area.toLowerCase()}.zip`)
    })
  }, [run])

  // ── Export: backup total → .zip ───────────────────────────────────────────

  const exportAll = useCallback(async () => {
    await run("Gerando backup completo…", async () => {
      const res = await fetch("/api/portability/export/all")
      if (!res.ok) throw new Error("Falha ao exportar")
      const blob = await res.blob()
      const date = new Date().toISOString().split("T")[0]!
      downloadBlob(blob, `portal-solar-backup-${date}.zip`)
    })
  }, [run])

  // ── Import: .md individual ────────────────────────────────────────────────

  const importMd = useCallback(async (file: File): Promise<{ ok: boolean; action?: string } | null> => {
    return run(`Importando ${file.name}…`, async () => {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/portability/import", { method: "POST", body: form })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        throw new Error(err.error)
      }
      return res.json() as Promise<{ ok: boolean; action: string }>
    })
  }, [run])

  // ── Import: folder (.zip) via File API ───────────────────────────────────
  // Opens file picker, reads zip, imports each .md inside

  const importFolder = useCallback(async (file: File) => {
    await run(`Importando pacote ${file.name}…`, async () => {
      const { default: JSZip } = await import("jszip")
      const zip = await JSZip.loadAsync(file)
      const mdFiles = Object.values(zip.files).filter((f) => !f.dir && f.name.endsWith(".md"))

      let imported = 0
      let errors   = 0

      for (const zipFile of mdFiles) {
        const text = await zipFile.async("text")
        const form = new FormData()
        form.append("file", new File([text], zipFile.name.split("/").pop() ?? "item.md", { type: "text/markdown" }))
        const res = await fetch("/api/portability/import", { method: "POST", body: form })
        if (res.ok) { imported++ } else { errors++ }
      }

      return { imported, errors }
    })
  }, [run])

  // ── Rebuild index ─────────────────────────────────────────────────────────

  const rebuildIndex = useCallback(async () => {
    return run("Reconstruindo índice…", async () => {
      const res = await fetch("/api/portability/rebuild-index", { method: "POST" })
      if (!res.ok) throw new Error("Falha ao reconstruir índice")
      return res.json() as Promise<{ written: number; errors: number; totalItems: number }>
    })
  }, [run])

  return {
    status,
    message,
    isLoading: status === "loading",
    exportItem,
    exportArea,
    exportAll,
    importMd,
    importFolder,
    rebuildIndex,
  }
}
