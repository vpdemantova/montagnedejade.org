"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export type PageNode = {
  id:        string
  title:     string
  icon:      string | null
  parentId:  string | null
  sortOrder: number
  isPublic:  boolean
  isBlog:    boolean
}

type TreeNode = PageNode & { children: TreeNode[] }

function buildTree(pages: PageNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  pages.forEach((p) => map.set(p.id, { ...p, children: [] }))
  pages.forEach((p) => {
    const node = map.get(p.id)!
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

function PageItem({
  node,
  depth,
  onDelete,
}: {
  node:     TreeNode
  depth:    number
  onDelete: (id: string) => void
}) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [open, setOpen] = useState(depth === 0)
  const isActive  = pathname === `/workspace/${node.id}`

  const addSubPage = async () => {
    const res = await fetch("/api/workspace/pages", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ title: "Nova página", parentId: node.id }),
    })
    if (res.ok) {
      const p = await res.json() as { id: string }
      router.push(`/workspace/${p.id}`)
      router.refresh()
    }
  }

  const deletePage = async () => {
    if (!confirm(`Deletar "${node.title}" e todas as sub-páginas?`)) return
    await fetch(`/api/workspace/pages/${node.id}`, { method: "DELETE" })
    onDelete(node.id)
    if (isActive) router.push("/workspace")
    router.refresh()
  }

  return (
    <div>
      <div
        className={`group flex items-center gap-1 py-0.5 rounded-sm transition-colors ${
          isActive ? "bg-solar-surface/40" : "hover:bg-solar-surface/20"
        }`}
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
      >
        {/* Expand toggle */}
        {node.children.length > 0 ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-4 h-4 flex items-center justify-center text-[8px] text-solar-muted/40 hover:text-solar-text/70 flex-shrink-0"
          >
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Icon */}
        <span className="text-[12px] flex-shrink-0">{node.icon ?? "📄"}</span>

        {/* Link */}
        <Link
          href={`/workspace/${node.id}`}
          className="flex-1 min-w-0 font-mono text-[9.5px] truncate transition-colors"
          style={{ color: isActive ? "rgb(var(--c-text) / 0.9)" : "rgb(var(--c-text) / 0.65)" }}
        >
          {node.title || "Sem título"}
        </Link>

        {/* Badges */}
        <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
          {node.isBlog && (
            <span className="font-mono text-[6px] uppercase tracking-widest px-1 py-0.5"
              style={{ background: "rgb(var(--c-accent)/0.15)", color: "rgb(var(--c-accent))" }}>
              blog
            </span>
          )}
          <button
            onClick={() => void addSubPage()}
            className="font-mono text-[11px] text-solar-muted/40 hover:text-solar-text/70 transition-colors w-5 h-5 flex items-center justify-center"
            title="Nova sub-página"
          >
            +
          </button>
          <button
            onClick={() => void deletePage()}
            className="font-mono text-[11px] text-solar-muted/30 hover:text-red-400/60 transition-colors w-5 h-5 flex items-center justify-center"
            title="Deletar página"
          >
            ×
          </button>
        </div>
      </div>

      {open && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <PageItem key={child.id} node={child} depth={depth + 1} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

export function WorkspaceSidebar({
  pages: initialPages,
}: {
  pages: PageNode[]
}) {
  const router = useRouter()
  const [pages,   setPages]   = useState<PageNode[]>(initialPages)
  const [creating, setCreating] = useState(false)

  const tree = buildTree(pages)

  const createPage = async () => {
    setCreating(true)
    const res = await fetch("/api/workspace/pages", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ title: "Nova página" }),
    })
    if (res.ok) {
      const p = await res.json() as PageNode
      setPages((prev) => [...prev, p])
      router.push(`/workspace/${p.id}`)
    }
    setCreating(false)
  }

  const handleDelete = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id && p.parentId !== id))
  }, [])

  return (
    <div
      className="flex flex-col h-full"
      style={{ borderRight: "1px solid rgb(var(--c-border) / 0.15)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3"
        style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.12)" }}>
        <div>
          <p className="font-mono text-[7px] uppercase tracking-[0.3em]"
            style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
            Workspace
          </p>
        </div>
        <button
          onClick={() => void createPage()}
          disabled={creating}
          className="font-mono text-[10px] text-solar-muted/40 hover:text-solar-accent/80 transition-colors disabled:opacity-40"
          title="Nova página"
        >
          {creating ? "…" : "+ Nova"}
        </button>
      </div>

      {/* Árvore */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {tree.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="font-mono text-[8px] text-solar-muted/30 leading-relaxed">
              Nenhuma página ainda.
              <br />
              Crie a primeira →
            </p>
          </div>
        ) : (
          tree.map((node) => (
            <PageItem key={node.id} node={node} depth={0} onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid rgb(var(--c-border) / 0.12)" }}>
        <Link href="/blog"
          className="flex items-center gap-2 font-mono text-[8px] text-solar-muted/40 hover:text-solar-muted/70 transition-colors">
          <span>◎</span> Ver blog público
        </Link>
      </div>
    </div>
  )
}
