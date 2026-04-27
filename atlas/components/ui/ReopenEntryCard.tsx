"use client"

export function ReopenEntryCard() {
  const show = () => {
    // Limpa o flag de sessão e dispara o evento — EntryCard reabre
    sessionStorage.removeItem("ps-entry")
    window.dispatchEvent(new CustomEvent("portal:show-entry-card"))
  }

  return (
    <button
      onClick={show}
      className="flex items-center gap-2 font-mono text-[7.5px] uppercase tracking-[0.22em] px-3 py-1.5 hover:opacity-70 transition-opacity"
      style={{
        border: "1px solid rgb(var(--c-border) / 0.25)",
        color:  "rgb(var(--c-muted) / 0.65)",
      }}
    >
      <span style={{ fontSize: 11 }}>◎</span>
      Ver apresentação
    </button>
  )
}
