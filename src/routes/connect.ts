import { handleSuccessfulLogin, passport } from '@/lib/passport'
import { FastifyInstance } from 'fastify'

export default (app: FastifyInstance) => {
  const providers = [
    {
      name: 'google',
    },
    {
      name: 'github',
    },
  ]
  for (const provider of providers) {
    app.get(
      `/connect/${provider.name}`,
      passport.authenticate(provider.name, {
        session: false,
      }),
    )
    app.get(
      `/connect/${provider.name}/callback`,
      {
        preValidation: passport.authenticate(provider.name, {
          failureRedirect: `${process.env.APP_URL}/login`,
          session: false,
        }),
      },
      handleSuccessfulLogin,
    )
  }
}
