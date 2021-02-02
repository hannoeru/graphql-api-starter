import passport from 'fastify-passport'
import { Profile } from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy } from 'passport-github'
import { prisma } from '@/lib/prisma'
import { RouteHandlerMethod } from 'fastify'
import { User } from '@prisma/client'
import { createSecureToken } from '../guards/utils'
import { AUTH_COOKIE_NAME } from './constants'

passport.registerUserSerializer<User, string>(async(user, request) => user.id)

passport.registerUserDeserializer<string, User>(async(id, request) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })
  if (!user)
    throw new Error('user not found')

  return user
})

const enableGoogle
  = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
const enableGithub
  = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET

if (enableGoogle) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: '/connect/google/callback',
      },
      async(accessToken, refreshToken, profile, cb) => {
        const user = await getUserByProviderProfile(profile, 'google')
        cb(undefined, user)
      },
    ),
  )
}

if (enableGithub) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: '/connect/github/callback',
      },
      async(accessToken, refreshToken, profile, cb) => {
        try {
          const user = await getUserByProviderProfile(profile, 'github')
          cb(null, user)
        }
        catch (error) {
          cb(error)
        }
      },
    ),
  )
}

async function getUserByProviderProfile(
  profile: Profile,
  provider: 'github' | 'google',
) {
  const email = profile.emails && profile.emails[0].value
  const avatar = profile.photos && profile.photos[0].value

  if (!email)
    throw new Error('No email provided')

  const providerKey = `${provider}UserId` as 'githubUserId' | 'googleUserId'

  // Find one by provider user id
  let existing = await prisma.user.findUnique({
    where: {
      [providerKey]: profile.id,
    },
  })
  // Otherwise find one with the same email and link them
  if (!existing) {
    existing = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (existing) {
      await prisma.user.update({
        where: {
          id: existing.id,
        },
        data: {
          [providerKey]: profile.id,
        },
      })
    }
  }

  if (!existing) {
    existing = await prisma.user.create({
      data: {
        email,
        name: profile.displayName || profile.username || '',
        [providerKey]: profile.id,
        avatar,
      },
    })
  }

  if (avatar && existing.avatar !== avatar) {
    await prisma.user.update({
      where: {
        id: existing.id,
      },
      data: {
        avatar,
      },
    })
  }

  return existing
}

export { passport }

export const handleSuccessfulLogin: RouteHandlerMethod = async(request, reply) => {
  const { id } = request.user as User
  const authToken = createSecureToken({ userId: id })
  reply
    .setCookie(AUTH_COOKIE_NAME, authToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 2 months
    })
  reply.redirect(`${process.env.APP_URL}${process.env.REDIRECT_PATH}`)
}
