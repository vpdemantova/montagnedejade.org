import withPWAInit from "@ducanh2912/next-pwa"

const withPWA = withPWAInit({
  dest: "public",
  // Só ativa o service worker em produção
  disable: process.env.NODE_ENV === "development",
  // Cache de assets estáticos automaticamente
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default withPWA(nextConfig)
