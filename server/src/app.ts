import Fastify from 'fastify'

import { databaseHealthRoutes } from './routes/database-health.routes.js'
import { healthRoutes } from './routes/health.routes.js'

export function buildApp() {
  const app = Fastify({
    logger: true,
  })

  app.register(healthRoutes)
  app.register(databaseHealthRoutes)

  app.setNotFoundHandler(async (request, reply) => {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    })
  })

  app.setErrorHandler(async (error, request, reply) => {
    request.log.error(error)

    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    })
  })

  return app
}
