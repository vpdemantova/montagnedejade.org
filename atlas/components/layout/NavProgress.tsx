"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function NavProgress() {
  const pathname            = usePathname()
  const [loading, setLoading] = useState(false)
  const prevPathname        = useRef(pathname)
  const timeoutRef          = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a")
      if (!anchor) return
      const href = anchor.getAttribute("href")
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto") ||
        href === pathname
      ) return
      setLoading(true)
      // Safety valve: hide after 10s even if navigation stalls
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setLoading(false), 10_000)
    }
    window.addEventListener("click", handleClick)
    return () => {
      window.removeEventListener("click", handleClick)
      clearTimeout(timeoutRef.current)
    }
  }, [pathname])

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      setLoading(false)
      clearTimeout(timeoutRef.current)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[500] h-[2px] overflow-hidden pointer-events-none">
      <div
        className="h-full"
        style={{
          background: "rgb(var(--c-accent))",
          animation: "nav-progress 1.4s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes nav-progress {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%);    }
          100% { transform: translateX(100%);  }
        }
      `}</style>
    </div>
  )
}
