import { prisma } from '@/lib/prisma'
import {
  Resolver,
  Query,
  ObjectType,
  Field,
  ID,
  Mutation,
  ArgsType,
  Args,
} from 'type-graphql'
import { FastifyRequest } from 'fastify'
import { GqlContext } from '../decorators/gql-context'
import { requireAuth } from '../guards/require-auth'

@ObjectType()
class CurrentUser {
  @Field(type => ID)
  id: string

  @Field()
  email: string

  @Field()
  name: string

  @Field({ nullable: true })
  avatar?: string
}

@ArgsType()
class UpdateProfileArgs {
  @Field()
  name: string
}

@Resolver()
export class CurrentUserResolver {
  @Query(returns => CurrentUser)
  async currentUser(@GqlContext() request: FastifyRequest) {
    const user = await requireAuth(request)
    return user
  }

  @Mutation(returns => CurrentUser)
  async updateProfile(
  @Args() args: UpdateProfileArgs,
    @GqlContext() request: FastifyRequest,
  ) {
    const user = await requireAuth(request)
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: args.name,
      },
    })
    return user
  }
}
