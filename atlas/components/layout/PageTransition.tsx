"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

/**
 * PageTransition — envolve o conteúdo principal com AnimatePresence do Framer Motion.
 * Cada troca de rota aplica um fade + slide suave.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="flex-1 min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
