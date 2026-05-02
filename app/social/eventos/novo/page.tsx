"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/atlas/components/layout/PageHeader"

const SUGGESTED_TAGS = [
  "espiritualidade", "música", "mantras", "meditação", "desenho",
  "biologia", "botânica", "wicca", "astronomia", "cinema",
  "dança", "culinária", "filosofia", "teatro", "literatura",
  "yoga", "fotografia", "poesia", "games", "programação",
]

export default function NovoEventoPage() {
  const router = useRouter()

  const [title,        setTitle]        = useState("")
  const [description,  setDescription]  = useState("")
  const [date,         setDate]         = useState("")
  const [time,         setTime]         = useState("")
  const [city,         setCity]         = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [address,      setAddress]      = useState("")
  const [maxGuests,    setMaxGuests]    = useState(6)
  const [tags,         setTags]         = useState<string[]>([])
  const [tagInput,     setTagInput]     = useState("")
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState("")

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput("")
  }

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))

  const handleTagKey = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title || !date || !time) { setError("Preencha título, data e hora"); return }
    setSaving(true)
    setError("")

    const dateTime = `${date}T${time}:00`
    const res = await fetch("/api/social/events", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, date: dateTime, city, neighborhood, address, maxGuests, tags }),
    })

    if (res.ok) {
      const ev = await res.json() as { id: string }
      router.push(`/social/eventos/${ev.id}`)
    } else {
      const data = await res.json() as { error?: string }
      setError(data.error ?? "Erro ao criar evento")
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeader label="Eventos · Novo" title="Criar encontro" size="narrow" />
      <div className="page-narrow py-8">

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6 max-w-lg">

          {/* Título */}
          <div>
            <label className="section-label mb-2 block">Título do encontro</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Meditação + chá de botânica"
              required
              className="w-full bg-transparent font-mono text-sm outline-none pb-2"
              style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.35)", color: "rgb(var(--c-text) / 0.85)" }}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="section-label mb-2 block">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O que vai rolar, o que trazer, quem é bem-vindo…"
              rows={3}
              className="w-full bg-solar-deep/30 border border-solar-border/25 p-3 font-mono text-[11px] outline-none resize-none"
              style={{ color: "rgb(var(--c-text) / 0.75)" }}
            />
          </div>

          {/* Data + Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label mb-2 block">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-solar-deep/30 border border-solar-border/25 p-2 font-mono text-[11px] outline-none"
                style={{ color: "rgb(var(--c-text) / 0.8)" }}
              />
            </div>
            <div>
              <label className="section-label mb-2 block">Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-solar-deep/30 border border-solar-border/25 p-2 font-mono text-[11px] outline-none"
                style={{ color: "rgb(var(--c-text) / 0.8)" }}
              />
            </div>
          </div>

          {/* Localização pública */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label mb-2 block">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="São Paulo"
                className="w-full bg-transparent font-mono text-[11px] outline-none pb-2"
                style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.3)", color: "rgb(var(--c-text) / 0.75)" }}
              />
            </div>
            <div>
              <label className="section-label mb-2 block">Bairro</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Vila Madalena"
                className="w-full bg-transparent font-mono text-[11px] outline-none pb-2"
                style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.3)", color: "rgb(var(--c-text) / 0.75)" }}
              />
            </div>
          </div>

          {/* Endereço privado */}
          <div>
            <label className="section-label mb-1 block">Endereço completo</label>
            <p className="font-mono text-[7.5px] mb-2" style={{ color: "rgb(var(--c-muted) / 0.45)" }}>
              Visível apenas para participantes aceitos por você
            </p>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua e número — revelado só para quem você aceitar"
              className="w-full bg-solar-deep/30 border border-solar-border/25 p-2.5 font-mono text-[11px] outline-none"
              style={{ color: "rgb(var(--c-text) / 0.75)" }}
            />
          </div>

          {/* Vagas */}
          <div>
            <label className="section-label mb-2 block">Máximo de participantes: {maxGuests}</label>
            <input
              type="range"
              min={2}
              max={20}
              value={maxGuests}
              onChange={(e) => setMaxGuests(Number(e.target.value))}
              className="w-full accent-solar-amber"
            />
            <div className="flex justify-between font-mono text-[7px] text-solar-muted/30 mt-1">
              <span>2</span><span>10</span><span>20</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="section-label mb-2 block">Interesses do encontro</label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => removeTag(t)}
                  className="font-mono text-[7.5px] uppercase tracking-widest px-2 py-1 flex items-center gap-1"
                  style={{ background: "rgb(var(--c-accent) / 0.1)", border: "1px solid rgb(var(--c-accent) / 0.3)", color: "rgb(var(--c-accent) / 0.9)" }}
                >
                  {t} <span style={{ opacity: 0.5 }}>×</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              placeholder="Digite uma tag e pressione Enter"
              className="w-full bg-transparent font-mono text-[11px] outline-none pb-1.5"
              style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.3)", color: "rgb(var(--c-text) / 0.75)" }}
            />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addTag(t)}
                  className="font-mono text-[7px] uppercase tracking-widest px-2 py-0.5 border transition-colors hover:border-solar-accent/40"
                  style={{ borderColor: "rgb(var(--c-border) / 0.25)", color: "rgb(var(--c-muted) / 0.5)" }}
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="font-mono text-[9px] text-solar-red/70">{error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving || !title || !date || !time}
              className="btn btn-primary btn-md"
            >
              {saving ? "Criando…" : "Criar encontro →"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="font-mono text-[9px] text-solar-muted/40 hover:text-solar-muted/70 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
