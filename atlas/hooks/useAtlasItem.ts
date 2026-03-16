"use client"

import { useState, useEffect } from "react"
import type { AtlasItemWithTags } from "@/atlas/types"

/**
 * Hook para buscar e gerenciar um item individual do Atlas via API.
 */
export function useAtlasItem(id: string) {
  const [item, setItem] = useState<AtlasItemWithTags | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    fetch(`/api/atlas/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<AtlasItemWithTags>
      })
      .then((data) => {
        setItem(data)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
        setIsLoading(false)
      })
  }, [id])

  async function mutate(updated: Partial<AtlasItemWithTags>) {
    if (!item) return
    const res = await fetch(`/api/atlas/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
    if (res.ok) {
      const data = (await res.json()) as AtlasItemWithTags
      setItem(data)
    }
  }

  return { item, isLoading, error, mutate }
}
