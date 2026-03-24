import { SignJWT, jwtVerify, type JWTPayload } from "jose"

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? process.env.AUTH_SECRET ?? "fallback-dev-secret"
)

export type SessionPayload = JWTPayload & {
  userId:      string
  username:    string
  displayName: string
  guest?:      boolean
}

export async function signToken(payload: Omit<SessionPayload, keyof JWTPayload>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret)
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as SessionPayload
  } catch {
    return null
  }
}
