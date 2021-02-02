import { createParamDecorator } from 'type-graphql'
import { FastifyRequest, FastifyReply } from 'fastify'

export function GqlContext() {
  return createParamDecorator<{
    request: FastifyRequest
    reply: FastifyReply
  }>((ctx) => {
    console.log(ctx)
    return ctx
  })
}
