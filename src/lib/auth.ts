import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'internlink-secret-key-2024'
const JWT_EXPIRES_IN = '7d'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): object | null {
  try {
    return jwt.verify(token, JWT_SECRET) as object
  } catch {
    return null
  }
}

export function getUserFromRequest(request: Request): { userId: string; role: string } | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.split(' ')[1]
    if (!token) return null

    const decoded = verifyToken(token)
    if (!decoded || typeof decoded !== 'object') return null

    const payload = decoded as { userId?: string; role?: string }
    if (!payload.userId || !payload.role) return null

    return { userId: payload.userId, role: payload.role }
  } catch {
    return null
  }
}
