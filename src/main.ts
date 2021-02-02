import 'reflect-metadata'
import fastify from 'fastify'
import cors from 'fastify-cors'
import helmet from 'fastify-helmet'
import dotenv from 'dotenv'
import cookie from 'fastify-cookie'
import session from 'fastify-session'
import { ApolloServer } from 'apollo-server-fastify'
import { buildSchema } from 'type-graphql'
import { passport } from '@/lib/passport'
import { addRoutes } from './routes'
import { CurrentUserResolver } from './resolvers/current-user.resolver'

dotenv.config()

const { ENCRYPT_SECRET } = process.env

if (!ENCRYPT_SECRET) throw new Error('ENCRYPT_SECRET not set')

const app = fastify({
  logger: true,
})

app.get('/', async(request, reply) => {
  return { hello: 'world' }
})

app.register(cors)
app.register(
  helmet,
  // Example disables the `contentSecurityPolicy` middleware but keeps the rest.
  { contentSecurityPolicy: false },
)
// init passport
app.register(passport.initialize())
app.register(passport.secureSession())
app.register(cookie, {
  secret: 'my-secret',
})
app.register(session, { secret: ENCRYPT_SECRET })

addRoutes(app)

async function main() {
  const schema = await buildSchema({
    resolvers: [CurrentUserResolver],
  })

  const apolloServer = new ApolloServer({
    schema,
    tracing: process.env.NODE_ENV === 'development',
    introspection: true,
    playground: true,
    context: ({ request, reply }) => ({
      request,
      reply,
    }),
  })

  app.register(apolloServer.createHandler())

  const { PORT = 4000 } = process.env

  try {
    await app.listen(PORT)
    console.log(`🚀  Server listening on http://localhost:${PORT}`)
  }
  catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
