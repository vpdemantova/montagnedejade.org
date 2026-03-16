"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"

type SearchBarProps = {
  onSearch?: (query: string) => void
  placeholder?: string
}

export function SearchBar({
  onSearch,
  placeholder = "Buscar no Atlas... (⌘K)",
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Atalho global Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
        // Foca no input após o estado atualizar
        setTimeout(() => inputRef.current?.focus(), 0)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
        setQuery("")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    onSearch?.(value)
  }

  function handleClear() {
    setQuery("")
    onSearch?.("")
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md border
          bg-solar-surface transition-solar
          ${isOpen || query
            ? "border-solar-amber/40 shadow-[0_0_0_2px_rgba(200,164,90,0.1)]"
            : "border-solar-border hover:border-solar-border/80"
          }
        `}
        onClick={() => {
          setIsOpen(true)
          inputRef.current?.focus()
        }}
      >
        <Search size={14} className="text-solar-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="
            flex-1 bg-transparent text-sm text-solar-text placeholder:text-solar-muted/50
            outline-none min-w-0
          "
          aria-label="Buscar no Atlas"
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-solar-muted hover:text-solar-text transition-solar"
            aria-label="Limpar busca"
          >
            <X size={12} />
          </button>
        )}
        {!query && (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono text-solar-muted border border-solar-border rounded">
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  )
}
