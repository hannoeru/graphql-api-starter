
import { FastifyRequest } from 'fastify'
import { AuthenticationError } from 'apollo-server-koa'
import { AUTH_COOKIE_NAME } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import { parseSecureToken } from './utils'

export async function requireAuth(request: FastifyRequest) {
  const token = request.unsignCookie(request.cookies[AUTH_COOKIE_NAME])

  if (!token.valid || !token.value)
    throw new AuthenticationError('Missing token')

  try {
    const payload = await parseSecureToken(token.value)
    if (!payload)
      throw new AuthenticationError('Auth failed')

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        members: true,
      },
    })
    if (!user)
      throw new AuthenticationError('User not found')

    return user
  }
  catch (error) {
    throw new AuthenticationError(error.message)
  }
}
