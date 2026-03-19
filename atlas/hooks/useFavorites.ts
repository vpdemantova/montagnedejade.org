"use client"

import useSWR from "swr"
import type { AtlasItemWithTags } from "@/atlas/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useFavorites() {
  const { data, error, isLoading } = useSWR<AtlasItemWithTags[]>(
    "/api/atlas/favorites",
    fetcher,
    { refreshInterval: 30_000 }
  )

  return {
    favorites:  data ?? [],
    error,
    isLoading,
  }
}
