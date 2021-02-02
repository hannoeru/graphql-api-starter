import jwt from 'jsonwebtoken'

export type AuthUser = {
  userId: string
}

const { HASH_KEY } = process.env

if (!HASH_KEY) throw new Error('HASH_KEY not set')

export function createSecureToken(payload: AuthUser) {
  // @ts-ignore
  const token = jwt.sign(payload, HASH_KEY)
  return token
}

export async function parseSecureToken(
  token: string,
): Promise<AuthUser | null> {
  try {
    // @ts-ignore
    return jwt.verify(token, HASH_KEY) as AuthUser
  }
  catch (error) {
    console.error('auth error', error)
    return null
  }
}
