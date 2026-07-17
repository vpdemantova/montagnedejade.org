import { notFound } from "next/navigation"
import { findBySlug, parsePathSteps, resolvePathSteps } from "@/atlas/lib/db"
import { PathDetailClient } from "@/atlas/components/portal/PathDetailClient"

type Props = { params: Promise<{ slug: string }> }

export default async function PathPage({ params }: Props) {
  const { slug } = await params
  const path = await findBySlug(slug)
  if (!path || path.type !== "PATH") notFound()

  const steps = parsePathSteps(path.metadata)
  const resolvedSteps = await resolvePathSteps(steps)

  return <PathDetailClient path={path} steps={resolvedSteps} />
}
