import type { Metadata, Viewport } from "next"
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import { LenisProvider }        from "@/atlas/components/layout/LenisProvider"
import { PageTransition }       from "@/atlas/components/layout/PageTransition"
import { NavProgress }          from "@/atlas/components/layout/NavProgress"
import { GlobalSearch }         from "@/atlas/components/ui/GlobalSearch"
import { QuickCapture }         from "@/atlas/components/ui/QuickCapture"
import { ModeAwareShell }       from "@/atlas/components/layout/ModeAwareShell"
import { OnboardingOverlay }    from "@/atlas/components/layout/OnboardingOverlay"
import { ThemeApplier }         from "@/atlas/components/layout/ThemeApplier"
import { KeyboardShortcuts }    from "@/atlas/components/ui/KeyboardShortcuts"
import { EntryCard }            from "@/atlas/components/ui/EntryCard"
import { InstallPrompt }        from "@/atlas/components/ui/InstallPrompt"

import "./globals.css"

// ── Fontes ─────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display:  "swap",
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets:  ["latin"],
  weight:   ["600", "700", "800"],
  variable: "--font-display",
  display:  "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets:  ["latin"],
  weight:   ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display:  "swap",
})

export const viewport: Viewport = {
  themeColor:  "#C8A45A",
  width:       "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title:       "Portal Solar",
  description: "Ecossistema de gestão de conhecimento — Diamantov",
  manifest:    "/manifest.json",
  appleWebApp: {
    capable:          true,
    statusBarStyle:   "black-translucent",
    title:            "Portal Solar",
    startupImage:     "/icons/icon.svg",
  },
  icons: {
    icon:   "/icons/icon.svg",
    apple:  "/icons/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-solar-void text-solar-text antialiased">
        <LenisProvider>
          <NavProgress />
          <ThemeApplier />
          <ModeAwareShell>
            <PageTransition>{children}</PageTransition>
          </ModeAwareShell>
          <GlobalSearch />
          <QuickCapture />
          <KeyboardShortcuts />
          <OnboardingOverlay />
          <EntryCard />
          <InstallPrompt />
        </LenisProvider>
      </body>
    </html>
  )
}
