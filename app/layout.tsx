import type { Metadata } from "next"
import { Playfair_Display, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google"
import { BottomNav } from "@/atlas/components/layout/BottomNav"
import { LenisProvider } from "@/atlas/components/layout/LenisProvider"
import { PageTransition } from "@/atlas/components/layout/PageTransition"
import "./globals.css"

// ── Fontes (Server Component — next/font só funciona aqui) ───────────────────

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-source-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Portal Solar",
  description: "Ecossistema de gestão de conhecimento local-first — Diamantov, PUCC",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`
        ${playfair.variable}
        ${ibmPlexMono.variable}
        ${sourceSerif.variable}
      `}
    >
      <body className="bg-solar-void text-solar-text antialiased">
        <LenisProvider>
          {/* Layout full-width com nav flutuante no fundo */}
          <div className="min-h-screen">
            <main className="flex flex-col min-h-screen pb-24">
              <PageTransition>{children}</PageTransition>
            </main>
            <BottomNav />
          </div>
        </LenisProvider>
      </body>
    </html>
  )
}
