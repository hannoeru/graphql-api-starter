import { FastifyInstance } from 'fastify'
import connect from './connect'

export function addRoutes(app: FastifyInstance) {
  connect(app)
}
